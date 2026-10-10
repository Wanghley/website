#!/usr/bin/env node
/**
 * Precompute pipeline for the hero's character head (CharacterHead.js).
 *
 * The source (src/assets/3d_model/wanghley-v2-3d.glb) is a stylized
 * Funko-style sculpt — flat cap, round glasses, curly hair, full beard,
 * open smile, black tee, tan overalls, boots, standing on a grey base
 * disc — NOT a photogrammetry scan (an earlier pass of this script
 * mis-identified it as one; see git history). It's exported at 1.5M
 * triangles / 874k vertices with a single material and three 4K textures
 * (~80MB), roughly 400x heavier than a browser should ever load, so this
 * script decimates it down to a real (if low-poly) mesh entirely in Node
 * — no browser, no three.js GLTFLoader — and produces:
 *
 *   1. public/models/wsm-head.glb — head+shoulders mesh, ~20k tris,
 *      per-vertex color baked from the source's basecolor texture
 *      (COLOR_0), meshopt-compressed. In public/ rather than src/assets/
 *      so it has a stable URL for <link rel="preload">.
 *   2. src/assets/3d_model/precomputed/wsm-head-holo.png — a duotone
 *      hologram-treated still of the same crop/pose, rendered by this
 *      script's own offline rasterizer, for the SVG/mobile fallback
 *      (CircuitBoardScene.js) which never loads the GLB.
 *   3. public/models/wsm-figure.glb — the SAME sculpt, decimated
 *      separately (higher tri budget, since a whole body needs more
 *      geometry than a head+shoulders crop to keep the face readable) and
 *      left UNCROPPED, for the tenth pass's hover-materialize feature
 *      (CharacterHead.js renders both the hologram head *and* the full
 *      figure from this one model, via a clipping plane — see that file).
 *   4. src/data/figureMetrics.js — measured (not hand-computed) landmarks
 *      in the figure's own normalized space: where the shoulder crop line
 *      and the head's own center/span would fall, reusing this exact
 *      script's own crop-threshold logic against the figure's un-decimated
 *      geometry rather than assuming the head file's numbers transfer.
 *
 * Geometry notes (confirmed via `gltf-transform inspect` + direct
 * accessor reads, not estimated):
 *   - Single mesh `node_0`, single primitive, attributes
 *     POSITION/NORMAL/TEXCOORD_0 — no COLOR_0, so vertex color has to be
 *     baked from the basecolor texture here, not copied from the source.
 *   - Single material (`Material.001`) — there's no skin/hair/glasses
 *     material split to key off; texel-luminance is the only signal.
 *   - Raw mesh is Z-up; node_0 carries a +90deg-about-X rotation
 *     ([0.7071, 0, 0, 0.7071]) making the *scene* Y-up. That rotation is
 *     baked into the exported positions/normals below so CharacterHead.js
 *     never has to reason about the source's authoring axes — just Y-up,
 *     facing +Z.
 *   - Crop threshold (HEAD_FRACTION) keeps triangles whose centroid sits
 *     above 34% up the post-bake Y range: 39% was tested first and cuts
 *     through the overall straps, leaving them as loose floating clips;
 *     34% clears them onto a clean shoulder line just below the collar.
 *
 * Re-run manually via `yarn build-head-precompute` whenever the source
 * model changes — same "generated once, checked in" pattern as
 * scripts/build-photo-archive.js / `yarn build-archive`.
 */
const fs = require('fs');
const path = require('path');
const { NodeIO, Document } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { weld, simplify, meshopt } = require('@gltf-transform/functions');
const { MeshoptSimplifier, MeshoptEncoder } = require('meshoptimizer');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC_GLB = path.join(ROOT, 'src/assets/3d_model/wanghley-v2-3d.glb');
const PUBLIC_OUT_DIR = path.join(ROOT, 'public/models');
const ASSET_OUT_DIR = path.join(ROOT, 'src/assets/3d_model/precomputed');
const DATA_OUT_DIR = path.join(ROOT, 'src/data');

const SOURCE_VERTS = 874311;
const WORKING_TRIS = 25000; // tractable resolution to decimate to before cropping (head output)
// The figure spreads the same visual budget over a whole body instead of a
// head+shoulders crop; at WORKING_TRIS's ratio the face would drop to a
// sliver of the mesh. ~70k tris keeps the face comparable to the head
// file's own density while staying well inside the 3MB/figure budget once
// meshopt-compressed (the 25k-tri head lands at 396KB, so ~70k should land
// roughly proportionally higher, in the megabyte range, not multiple MB).
const FIGURE_WORKING_TRIS = 70000;
const HEAD_FRACTION = 0.34; // bottom slice discarded (torso/legs/base disc); see doc comment
const TEXTURE_SAMPLE_RES = 2048; // basecolor decode resolution for vertex-color baking
const HUE_RETENTION = 0.35; // how much original hue survives the blue-duotone still

// Blue duotone ramp used for the fallback still (CharacterHead.js keeps its
// own copy of these for the live shader — duplicated intentionally rather
// than shared, since one is a build-time Node script and the other a GLSL
// snippet compiled into a three.js material).
const RAMP = [
  [0x14, 0x24, 0x2c],
  [0x24, 0x3a, 0x7a],
  [0x3a, 0xaf, 0xf1],
];

function loadPrimitive(document) {
  const mesh = document.getRoot().listMeshes()[0];
  const prim = mesh.listPrimitives()[0];
  return {
    position: prim.getAttribute('POSITION').getArray(),
    uv: prim.getAttribute('TEXCOORD_0').getArray(),
    normal: prim.getAttribute('NORMAL').getArray(),
    indices: prim.getIndices().getArray(),
  };
}

// Bakes node_0's +90deg-about-X rotation directly into positions/normals:
// (x, y, z) -> (x, -z, y). This is the one axis transform in the whole
// pipeline — everything downstream (crop, color bake, normalize, render)
// operates in the already-correct Y-up, face-at-+Z space.
function bakeUpAxis(flat) {
  const out = new Float32Array(flat.length);
  for (let i = 0; i < flat.length; i += 3) {
    out[i] = flat[i];
    out[i + 1] = -flat[i + 2];
    out[i + 2] = flat[i + 1];
  }
  return out;
}

function boundsOfFlatArray(flat) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < flat.length; i += 3) {
    for (let k = 0; k < 3; k += 1) {
      const v = flat[i + k];
      if (v < min[k]) min[k] = v;
      if (v > max[k]) max[k] = v;
    }
  }
  return { min, max };
}

// Keeps triangles whose Y centroid sits above the crop threshold, then
// compacts the vertex buffers so no orphaned verts are exported. Returns
// new position/normal/uv arrays plus a remapped index buffer.
function cropToHeadAndShoulders(position, normal, uv, indices, fraction) {
  const { min, max } = boundsOfFlatArray(position);
  const threshold = min[1] + fraction * (max[1] - min[1]);

  const nVerts = position.length / 3;
  const remap = new Int32Array(nVerts).fill(-1);
  const keptIndices = [];
  let nextIndex = 0;

  const triCount = indices.length / 3;
  for (let t = 0; t < triCount; t += 1) {
    const a = indices[t * 3];
    const b = indices[t * 3 + 1];
    const c = indices[t * 3 + 2];
    const centroidY = (position[a * 3 + 1] + position[b * 3 + 1] + position[c * 3 + 1]) / 3;
    if (centroidY < threshold) continue;
    for (const v of [a, b, c]) {
      if (remap[v] < 0) remap[v] = nextIndex++;
      keptIndices.push(remap[v]);
    }
  }

  const outPosition = new Float32Array(nextIndex * 3);
  const outNormal = new Float32Array(nextIndex * 3);
  const outUv = new Float32Array(nextIndex * 2);
  for (let i = 0; i < nVerts; i += 1) {
    const j = remap[i];
    if (j < 0) continue;
    outPosition[j * 3] = position[i * 3];
    outPosition[j * 3 + 1] = position[i * 3 + 1];
    outPosition[j * 3 + 2] = position[i * 3 + 2];
    outNormal[j * 3] = normal[i * 3];
    outNormal[j * 3 + 1] = normal[i * 3 + 1];
    outNormal[j * 3 + 2] = normal[i * 3 + 2];
    outUv[j * 2] = uv[i * 2];
    outUv[j * 2 + 1] = uv[i * 2 + 1];
  }

  return {
    position: outPosition,
    normal: outNormal,
    uv: outUv,
    indices: new Uint32Array(keptIndices),
    vertCount: nextIndex,
    cropThresholdY: threshold,
  };
}

// Centers on the origin and scales so height (Y range) is exactly 1 unit —
// CharacterHead.js can place/scale the result without knowing the source's
// native units. Returns the transform applied, so the caller can carry the
// crop plane and other Y-space facts through in the same normalized units.
function normalize(position) {
  const { min, max } = boundsOfFlatArray(position);
  const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const scale = 1 / (max[1] - min[1] || 1);
  const out = new Float32Array(position.length);
  for (let i = 0; i < position.length; i += 3) {
    out[i] = (position[i] - center[0]) * scale;
    out[i + 1] = (position[i + 1] - center[1]) * scale;
    out[i + 2] = (position[i + 2] - center[2]) * scale;
  }
  return { position: out, center, scale, bounds: boundsOfFlatArray(out) };
}

async function decodeBaseColor(document, resolution) {
  const material = document.getRoot().listMaterials()[0];
  const textureInfo = material.getBaseColorTexture();
  if (!textureInfo) throw new Error('Source material has no baseColorTexture.');
  const imageBuffer = Buffer.from(textureInfo.getImage());
  const { data } = await sharp(imageBuffer)
    .resize(resolution, resolution, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, size: resolution };
}

// glTF UV convention: (0,0) is top-left, same as raster row/col order, so
// no v-flip is needed when indexing straight into the decoded buffer.
function sampleTexel(texture, u, v) {
  const x = Math.min(texture.size - 1, Math.max(0, Math.floor(u * texture.size)));
  const y = Math.min(texture.size - 1, Math.max(0, Math.floor(v * texture.size)));
  const o = (y * texture.size + x) * 3;
  return [texture.data[o], texture.data[o + 1], texture.data[o + 2]];
}

// Bakes COLOR_0 as linear-space [0,1] RGB triples, one per vertex, by
// sampling the decoded basecolor texture at that vertex's UV. This is what
// stands in for the material split the source doesn't have (see doc
// comment above) — CharacterHead.js's toon shader quantizes this into the
// blue duotone at render time; it stays full baked color here so the
// low-poly GLB itself looks correct if previewed outside the hologram
// shader too.
function bakeVertexColors(uv, texture, vertCount) {
  const srgbToLinear = (c) => {
    const cs = c / 255;
    return cs <= 0.04045 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
  };
  const colors = new Float32Array(vertCount * 3);
  for (let i = 0; i < vertCount; i += 1) {
    const [r, g, b] = sampleTexel(texture, uv[i * 2], uv[i * 2 + 1]);
    colors[i * 3] = srgbToLinear(r);
    colors[i * 3 + 1] = srgbToLinear(g);
    colors[i * 3 + 2] = srgbToLinear(b);
  }
  return colors;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function duotone(r, g, b, retention) {
  const lum = Math.max(0, Math.min(1, luminance(r, g, b)));
  const stepIndex = lum < 0.5 ? 0 : 1;
  const localT = lum < 0.5 ? lum * 2 : (lum - 0.5) * 2;
  const lo = RAMP[stepIndex];
  const hi = RAMP[stepIndex + 1];
  const ramp = [0, 1, 2].map((k) => lo[k] + (hi[k] - lo[k]) * localT);
  // Let a fraction of the original hue survive: mix the pure ramp color
  // with (ramp tinted by the original color's own normalized hue).
  const maxC = Math.max(r, g, b, 1e-4);
  const tint = [r / maxC, g / maxC, b / maxC];
  const tinted = ramp.map((v, k) => v * tint[k]);
  return ramp.map((v, k) => v * (1 - retention) + tinted[k] * retention);
}

// Minimal offline flat-shaded z-buffer rasterizer producing the mobile/SVG
// fallback still. Not a general-purpose renderer — just enough to match
// CharacterHead.js's placement/pose for a static image. Camera basis
// mirrors CircuitBoardR3F.js's OrthographicCamera at position [16,15,16]
// looking at the origin; yaw/pitch match the live component (+25/-10deg).
async function renderHoloStill(position, normal, colors, indices, outPath) {
  const W = 640;
  const H = 780;
  const S = H * 0.72;
  const YAW = (25 * Math.PI) / 180;
  const PITCH = (-10 * Math.PI) / 180;

  const norm = (v) => {
    const len = Math.hypot(...v);
    return v.map((x) => x / len);
  };
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const viewDirToCam = norm([16, 15, 16]);
  const forward = viewDirToCam.map((x) => -x);
  const right = norm(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);

  const ca = Math.cos(YAW);
  const sa = Math.sin(YAW);
  const cp = Math.cos(PITCH);
  const sp = Math.sin(PITCH);

  const zBuffer = new Float32Array(W * H).fill(-Infinity);
  // RGBA, background alpha 0 — this gets composited over the SVG board
  // (see CircuitBoardScene.js), not shown on its own, so an opaque
  // background would render as a hard rectangle rather than a floating
  // hologram silhouette. The bottom dissolve below fades alpha to 0, not
  // color toward a fixed background, for the same reason.
  const frame = Buffer.alloc(W * H * 4, 0);

  const triCount = indices.length / 3;
  for (let t = 0; t < triCount; t += 1) {
    const vi = [indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]];
    const world = vi.map((j) => {
      const x = position[j * 3];
      const y = position[j * 3 + 1];
      const z = position[j * 3 + 2];
      const rx = x * ca + z * sa;
      const rz = -x * sa + z * ca;
      const ry = y * cp - rz * sp;
      const rz2 = y * sp + rz * cp;
      return [rx, ry, rz2];
    });
    const screen = world.map((q) => [
      W / 2 + (q[0] * right[0] + q[1] * right[1] + q[2] * right[2]) * S,
      H / 2 - (q[0] * up[0] + q[1] * up[1] + q[2] * up[2]) * S,
      q[0] * viewDirToCam[0] + q[1] * viewDirToCam[1] + q[2] * viewDirToCam[2],
    ]);

    const e1 = [world[1][0] - world[0][0], world[1][1] - world[0][1], world[1][2] - world[0][2]];
    const e2 = [world[2][0] - world[0][0], world[2][1] - world[0][1], world[2][2] - world[0][2]];
    let faceNormal = cross(e1, e2);
    const flen = Math.hypot(...faceNormal) || 1;
    faceNormal = faceNormal.map((x) => x / flen);
    // Floor raised from an earlier 0.3 — the "near" state this still
    // represents should read as a resolved, well-lit hologram rather than
    // dim/backlit, per the proximity table (near = crisp, bright).
    const lambert = Math.max(0.55, Math.abs(faceNormal[0] * 0.3 + faceNormal[1] * 0.5 + faceNormal[2] * 0.81));
    // Grazing-angle rim boost, standing in for the live shader's Fresnel
    // term (#46AAE0) — cheap approximation since this is a static still,
    // not the real onBeforeCompile injection CharacterHead.js uses.
    const facing = Math.abs(faceNormal[0] * viewDirToCam[0] + faceNormal[1] * viewDirToCam[1] + faceNormal[2] * viewDirToCam[2]);
    const rim = (1 - facing) ** 3;

    const holoColor = [0, 1, 2].map((k) => {
      const avg = (colors[vi[0] * 3 + k] + colors[vi[1] * 3 + k] + colors[vi[2] * 3 + k]) / 3;
      return avg;
    });
    // duotone() already returns 0-255-range values (the RAMP constants are
    // hex byte values) — only lambert shading remains to apply, no second
    // *255 (that earlier bug washed the whole still out to solid white).
    const [dr, dg, db] = duotone(holoColor[0], holoColor[1], holoColor[2], HUE_RETENTION);
    const RIM = [0x46, 0xaa, 0xe0];
    const shaded = [dr, dg, db].map((v, k) => Math.min(255, v * lambert + RIM[k] * rim * 0.6));

    // Bottom dissolve: fade to the background color across the lowest 15%
    // of normalized height, matching the live shader's alpha ramp — makes
    // the shoulder crop read as a projection fading out, not a hard cut.
    const avgY = (position[vi[0] * 3 + 1] + position[vi[1] * 3 + 1] + position[vi[2] * 3 + 1]) / 3;
    const dissolve = Math.max(0, Math.min(1, (avgY - -0.5) / 0.15));

    const minX = Math.max(0, Math.floor(Math.min(screen[0][0], screen[1][0], screen[2][0])));
    const maxX = Math.min(W - 1, Math.ceil(Math.max(screen[0][0], screen[1][0], screen[2][0])));
    const minY = Math.max(0, Math.floor(Math.min(screen[0][1], screen[1][1], screen[2][1])));
    const maxY = Math.min(H - 1, Math.ceil(Math.max(screen[0][1], screen[1][1], screen[2][1])));
    const denom =
      (screen[1][0] - screen[0][0]) * (screen[2][1] - screen[0][1]) -
      (screen[2][0] - screen[0][0]) * (screen[1][1] - screen[0][1]);
    if (Math.abs(denom) < 1e-9) continue;

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const w0 = ((screen[1][0] - x) * (screen[2][1] - y) - (screen[2][0] - x) * (screen[1][1] - y)) / denom;
        const w1 = ((screen[2][0] - x) * (screen[0][1] - y) - (screen[0][0] - x) * (screen[2][1] - y)) / denom;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w0 * screen[0][2] + w1 * screen[1][2] + w2 * screen[2][2];
        const o = y * W + x;
        if (z <= zBuffer[o]) continue;
        zBuffer[o] = z;
        // Alpha carries the dissolve fade (to transparent, since this gets
        // composited over the live SVG board, not a fixed color) — RGB
        // stays the true shaded color throughout. Base alpha ~0.92, not
        // fully opaque, matching the hologram's own near-state opacity.
        frame[o * 4] = shaded[0];
        frame[o * 4 + 1] = shaded[1];
        frame[o * 4 + 2] = shaded[2];
        frame[o * 4 + 3] = 235 * dissolve;
      }
    }
  }

  await sharp(frame, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toFile(outPath);
}

// Shared by both the head and figure outputs — builds a fresh single-mesh
// Document from already-processed (baked-axis, optionally cropped, baked
// vertex-color) arrays and meshopt-compresses it. Factored out here so the
// figure output doesn't duplicate the head's own accessor/primitive/mesh
// wiring below.
async function writeCompressedGlb({ io, position, normal, colors, indices, name, encoder, outPath }) {
  const outDoc = new Document();
  const buffer = outDoc.createBuffer();
  const positionAccessor = outDoc.createAccessor().setType('VEC3').setArray(position).setBuffer(buffer);
  const normalAccessor = outDoc.createAccessor().setType('VEC3').setArray(normal).setBuffer(buffer);
  const colorAccessor = outDoc.createAccessor().setType('VEC3').setArray(colors).setBuffer(buffer);
  const indexAccessor = outDoc.createAccessor().setType('SCALAR').setArray(indices).setBuffer(buffer);
  const material = outDoc.createMaterial(name).setBaseColorFactor([1, 1, 1, 1]).setRoughnessFactor(1);
  const primitive = outDoc
    .createPrimitive()
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setAttribute('COLOR_0', colorAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);
  const mesh = outDoc.createMesh(name).addPrimitive(primitive);
  outDoc.createScene().addChild(outDoc.createNode(name).setMesh(mesh));
  await outDoc.transform(meshopt({ encoder, level: 'medium' }));
  await io.write(outPath, outDoc);
  return fs.statSync(outPath).size;
}

// Full-body pass: same decimate/up-axis-bake/color-bake pipeline as the
// head, but a fresh read of the source (the head's own read above has
// already been mutated in place by its own simplify() transform) and NO
// crop. Also runs the head's own crop-threshold logic against this figure's
// geometry purely to MEASURE where that plane would fall in the figure's
// own normalized space — CharacterHead.js needs these landmarks to place
// its clipping plane and to size the two rest states consistently; see
// src/data/figureMetrics.js's own header comment.
async function buildFigure({ io, encoder }) {
  console.log('\n--- Figure pass (full body, uncropped) ---');
  console.log('Reading source model again (a fresh Document — the head pass above already consumed its own)...');
  const document = await io.read(SRC_GLB);

  console.log(`Simplifying to ~${FIGURE_WORKING_TRIS} tris...`);
  await document.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: FIGURE_WORKING_TRIS / SOURCE_VERTS, error: 0.004 })
  );

  const { position: rawPosition, uv, normal: rawNormal, indices } = loadPrimitive(document);
  console.log(`Working mesh: ${rawPosition.length / 3} verts, ${indices.length / 3} tris.`);

  const position = bakeUpAxis(rawPosition);
  const normal = bakeUpAxis(rawNormal);

  // Measurement-only: this crop's OUTPUT geometry is discarded — only its
  // threshold and the resulting head-region's raw Y bounds are kept, to
  // locate "where the head is" inside the full figure once normalized.
  const headCropForMetrics = cropToHeadAndShoulders(position, normal, uv, indices, HEAD_FRACTION);
  const headRawBounds = boundsOfFlatArray(headCropForMetrics.position);

  console.log(`Decoding basecolor texture at ${TEXTURE_SAMPLE_RES}px for vertex-color baking...`);
  const texture = await decodeBaseColor(document, TEXTURE_SAMPLE_RES);
  const bakedColors = bakeVertexColors(uv, texture, position.length / 3);

  console.log('Normalizing (center on origin, scale height to 1 unit)...');
  const { position: normPosition, center, scale, bounds } = normalize(position);
  console.log(`  Normalized bounds: min=[${bounds.min.map((v) => v.toFixed(3))}] max=[${bounds.max.map((v) => v.toFixed(3))}]`);

  console.log('Building output GLB (meshopt-compressed)...');
  const glbPath = path.join(PUBLIC_OUT_DIR, 'wsm-figure.glb');
  const glbSize = await writeCompressedGlb({
    io,
    position: normPosition,
    normal,
    colors: bakedColors,
    indices,
    name: 'wsm-figure',
    encoder,
    outPath: glbPath,
  });

  // Apply the SAME center/scale transform used above to carry the
  // measurement-only crop's landmarks into the figure's final normalized
  // space (translation then uniform scale — the only two ops normalize()
  // performs, so this is exact, not an approximation).
  const toNormalizedY = (rawY) => (rawY - center[1]) * scale;
  const metrics = {
    headFraction: HEAD_FRACTION,
    feetY: bounds.min[1], // -0.5 by construction of normalize()
    shoulderY: toNormalizedY(headCropForMetrics.cropThresholdY),
    headCenterY: toNormalizedY((headRawBounds.min[1] + headRawBounds.max[1]) / 2),
    headSpanHeight: (headRawBounds.max[1] - headRawBounds.min[1]) * scale,
  };

  fs.mkdirSync(DATA_OUT_DIR, { recursive: true });
  const metricsPath = path.join(DATA_OUT_DIR, 'figureMetrics.js');
  fs.writeFileSync(
    metricsPath,
    `// GENERATED by scripts/build-head-precompute.js — do not hand-edit.
// Re-run \`yarn build-head-precompute\` whenever src/assets/3d_model's
// source sculpt changes.
//
// Landmarks in wsm-figure.glb's own normalized local space (Y-up, height
// exactly 1, centered on the origin — see normalize() in the build script).
// Measured by re-running the same head-crop threshold rule
// (HEAD_FRACTION) against the figure's own geometry, not copied from the
// separately-decimated wsm-head.glb, since the two files' simplify() calls
// use different tri budgets and can land the crop plane a hair apart.
//
// CharacterHead.js uses these to place its clipping plane (shoulderY at
// t=0, feetY at t=1) and to size the hologram-head rest pose so it
// reproduces the framing of the retired wsm-head.glb (scale/position
// derived at runtime from headCenterY/headSpanHeight, not hardcoded).
const FIGURE_METRICS = ${JSON.stringify(metrics, null, 2)};

export default FIGURE_METRICS;
`
  );

  console.log(`  ${path.relative(ROOT, glbPath)}: ${(glbSize / 1024).toFixed(1)} KB, ${indices.length / 3} tris`);
  console.log(`  ${path.relative(ROOT, metricsPath)}: ${JSON.stringify(metrics)}`);
}

async function main() {
  if (!fs.existsSync(SRC_GLB)) {
    console.error(`Source model not found at ${SRC_GLB}`);
    process.exit(1);
  }
  fs.mkdirSync(PUBLIC_OUT_DIR, { recursive: true });
  fs.mkdirSync(ASSET_OUT_DIR, { recursive: true });

  await MeshoptSimplifier.ready;
  await MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': require('meshoptimizer').MeshoptDecoder });

  console.log('Reading source model (1.5M tris, this takes a moment)...');
  const document = await io.read(SRC_GLB);

  console.log(`Simplifying to ~${WORKING_TRIS} tris...`);
  await document.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: WORKING_TRIS / SOURCE_VERTS, error: 0.004 })
  );

  const { position: rawPosition, uv, normal: rawNormal, indices } = loadPrimitive(document);
  console.log(`Working mesh: ${rawPosition.length / 3} verts, ${indices.length / 3} tris.`);

  console.log('Baking node_0 up-axis rotation into positions/normals (Z-up source -> Y-up, face at +Z)...');
  const position = bakeUpAxis(rawPosition);
  const normal = bakeUpAxis(rawNormal);

  console.log(`Cropping to head + shoulders (keeping top ${((1 - HEAD_FRACTION) * 100).toFixed(0)}% of height)...`);
  const cropped = cropToHeadAndShoulders(position, normal, uv, indices, HEAD_FRACTION);
  console.log(`  Head+shoulders: ${cropped.vertCount} verts, ${cropped.indices.length / 3} tris.`);
  if (cropped.vertCount === 0) {
    console.error('Crop produced zero vertices — HEAD_FRACTION is wrong for this source.');
    process.exit(1);
  }

  console.log(`Decoding basecolor texture at ${TEXTURE_SAMPLE_RES}px for vertex-color baking...`);
  const texture = await decodeBaseColor(document, TEXTURE_SAMPLE_RES);
  const bakedColors = bakeVertexColors(cropped.uv, texture, cropped.vertCount);

  console.log('Normalizing (center on origin, scale height to 1 unit)...');
  const { position: normPosition, bounds } = normalize(cropped.position);
  console.log(`  Normalized bounds: min=[${bounds.min.map((v) => v.toFixed(3))}] max=[${bounds.max.map((v) => v.toFixed(3))}]`);
  // NOTE: this crop's own GLB (formerly public/models/wsm-head.glb) is no
  // longer written — the tenth pass retired it in favor of rendering the
  // hologram-head state from the full wsm-figure.glb behind a clipping
  // plane (see CharacterHead.js), so this whole crop pipeline now exists
  // ONLY to feed the mobile/SVG fallback still below, which still wants
  // its own independently-croppable head pose. The crop plane lands at
  // -0.5 in this normalized space by construction (crop happens before
  // normalize, so the kept region's own min Y is always the new bottom) —
  // renderHoloStill's own dissolve math below already assumes this.

  console.log('Rendering hologram-duotone still for the SVG/mobile fallback...');
  const stillPath = path.join(ASSET_OUT_DIR, 'wsm-head-holo.png');
  await renderHoloStill(normPosition, cropped.normal, bakedColors, cropped.indices, stillPath);

  const stillSize = fs.statSync(stillPath).size;
  console.log('\nDone. Outputs:');
  console.log(`  ${path.relative(ROOT, stillPath)}: ${(stillSize / 1024).toFixed(1)} KB`);

  await buildFigure({ io, encoder: MeshoptEncoder });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
