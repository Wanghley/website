#!/usr/bin/env node
/**
 * Adds a skeleton, skin weights, and animation clips to the already-built
 * public/models/wsm-figure.glb (see scripts/build-head-precompute.js's
 * `buildFigure()` for how THAT file itself is produced from the source
 * sculpt).
 *
 * Context: the source sculpt (src/assets/3d_model/wanghley-v2-3d.glb) has
 * no skeleton and no animations — confirmed directly via gltf-transform
 * inspection, not assumed. A proper rig would normally come from Mixamo's
 * auto-rigger or manual work in Blender; neither is available here
 * (Mixamo needs an Adobe account login, which isn't something this
 * pipeline can create or authenticate; Blender isn't installed on this
 * machine). This script instead builds a rig ENTIRELY from geometry
 * analysis and hand-placed joints:
 *
 *   1. Joint positions were read directly off orthographic front/side
 *      renders of the actual mesh with a 0.05-unit world-space grid
 *      overlay (a one-off scratch harness, not checked in) — not guessed,
 *      not derived from a generic human proportion table. See BONES below;
 *      each position is a coordinate literally read off those renders.
 *   2. Skin weights use ENVELOPE (capsule/segment-distance) skinning, not
 *      a heat-diffusion solve — the simpler of the two standard skinning
 *      techniques, but perfectly adequate for a chunky, low-detail toon
 *      figure with no concave joint creases to get wrong.
 *   3. Only the bones the brief's own gesture set actually needs are
 *      animated (Spine, Head, both arms). Hips carries the entire lower
 *      body + the sculpt's own round base disc as 100%-rigid geometry —
 *      deliberately not rigged into separate legs, since no required
 *      animation (Idle/Wave/ThumbsUp/LookAround/Salute/HappyIdle) moves a
 *      leg, and guessing a two-leg split from geometry alone is exactly
 *      the kind of step that goes wrong without a DCC tool's visual
 *      feedback loop.
 *
 * Honest quality note: this is a from-scratch procedural rig, not a
 * Mixamo/Blender one. No finger bones exist (the source has no separate
 * finger geometry to rig), so ThumbsUp/Salute are arm-pose approximations,
 * not literal finger poses. Verify visually (this script's own console
 * output points at the verification harness) before trusting it blindly.
 */
const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { NodeIO, Document } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { meshopt } = require('@gltf-transform/functions');
const meshoptimizer = require('meshoptimizer');

const ROOT = path.join(__dirname, '..');
const SRC_GLB = path.join(ROOT, 'public/models/wsm-figure.glb');
const OUT_GLB = path.join(ROOT, 'public/models/wsm-figure.glb');
const CONFIG_OUT = path.join(ROOT, 'src/data/figureAnimConfig.js');

// ---------------------------------------------------------------------
// Skeleton — positions are WORLD/model-space (the figure's own normalized
// space: Y-up, height 1, centered on the origin), read directly off
// grid-overlaid orthographic renders of the actual mesh. Converted to
// parent-relative glTF node translations later in this script.
// ---------------------------------------------------------------------
const BONES = [
  { name: 'Hips', parent: null, pos: [0, -0.2, 0] },
  { name: 'Spine', parent: 'Hips', pos: [0, -0.08, 0] },
  { name: 'Head', parent: 'Spine', pos: [0, -0.04, 0] },
  { name: 'LeftShoulder', parent: 'Spine', pos: [0.19, -0.09, -0.01] },
  { name: 'LeftForearm', parent: 'LeftShoulder', pos: [0.22, -0.19, 0.02] },
  { name: 'RightShoulder', parent: 'Spine', pos: [-0.19, -0.09, -0.01] },
  { name: 'RightForearm', parent: 'RightShoulder', pos: [-0.22, -0.19, 0.02] },
];

// Envelope segments used ONLY for weight computation (not part of the
// joint hierarchy's own transforms) — [pointA, pointB, radius].
//
// FIRST ATTEMPT gave Hips a deliberately huge radius (0.65) reasoning that
// "it just needs to reach the base disc's ~0.48 half-width." That was
// wrong in a way only visible by actually rendering a pose: the weight
// formula below (`smoothstep(1 - distance/radius)`) is normalized by each
// bone's OWN radius, so a vertex sitting at 60% of Hips' giant radius
// scored higher than the same vertex sitting at 30% of LeftShoulder's tiny
// one — even though the LeftShoulder distance was numerically much
// smaller. Hips silently won almost the entire mesh, including the upper
// arms (confirmed directly: a shoulder vertex came back 80% Hips, 18%
// LeftShoulder). Caught by animating the rig and watching nothing move,
// not by inspecting the numbers in isolation.
//
// Fix: keep every bone's radius in the same anatomically-modest range (no
// bone "reaches" much past its own limb), so the competition is fair, and
// handle the geometry NO envelope reaches at all (the base disc's outer
// rim, past every bone's radius) with an explicit post-hoc fallback to
// Hips rather than by inflating Hips' radius to paper over it.
// Head's radius was found (via a direct weight-paint render, not
// hand-calculation) to be too small: at 0.28 it left the back of the
// hair/cap (which extends to about Z=-0.28, right at the boundary) just
// outside its own reach, so those vertices fell through to the Hips
// fallback and stayed rigid while the rest of the head rotated with the
// Head bone — a visible tear across the head on every LookAround/idle-bob
// frame. 0.36 comfortably covers the whole head+cap+hair volume (the
// mesh's own measured half-extents there run up to ~0.3 in any direction).
const ENVELOPES = {
  Hips: { a: [0, -0.2, 0], b: [0, -0.5, 0], r: 0.28 },
  Spine: { a: [0, -0.2, 0], b: [0, -0.03, 0], r: 0.2 },
  Head: { a: [0, -0.05, 0], b: [0, 0.5, 0], r: 0.36 },
  LeftShoulder: { a: [0.19, -0.09, -0.01], b: [0.22, -0.19, 0.02], r: 0.11 },
  LeftForearm: { a: [0.22, -0.19, 0.02], b: [0.19, -0.28, 0.07], r: 0.1 },
  RightShoulder: { a: [-0.19, -0.09, -0.01], b: [-0.22, -0.19, 0.02], r: 0.11 },
  RightForearm: { a: [-0.22, -0.19, 0.02], b: [-0.19, -0.28, 0.07], r: 0.1 },
};

const BONE_NAMES = BONES.map((b) => b.name);
const BONE_INDEX = Object.fromEntries(BONE_NAMES.map((n, i) => [n, i]));

function closestPointOnSegmentDist(p, a, b) {
  const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const abLenSq = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
  let t = abLenSq > 1e-9 ? (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / abLenSq : 0;
  t = Math.max(0, Math.min(1, t));
  const c = [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t];
  return Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]);
}

function smoothstep01(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

// Returns up to 4 {joint, weight} pairs, normalized to sum 1. Squaring the
// smoothstep sharpens the falloff so the winning bone in any given region
// dominates cleanly rather than blending muddily with marginal
// contributors — a chunky toon figure reads better with a fairly crisp
// weight boundary than a soft heat-map-style gradient.
function computeVertexWeights(p) {
  const raw = [];
  for (const name of BONE_NAMES) {
    const env = ENVELOPES[name];
    const d = closestPointOnSegmentDist(p, env.a, env.b);
    const s = smoothstep01(1 - d / env.r);
    const w = s * s;
    if (w > 0.0005) raw.push({ joint: BONE_INDEX[name], weight: w });
  }
  // Nothing in range (the base disc's outer rim, past every bone's
  // radius, per the file-level comment above) — falls back to Hips
  // outright rather than leaving a vertex with zero total weight.
  if (raw.length === 0) raw.push({ joint: BONE_INDEX.Hips, weight: 1 });
  raw.sort((x, y) => y.weight - x.weight);
  const top = raw.slice(0, 4);
  const sum = top.reduce((s, w) => s + w.weight, 0) || 1;
  while (top.length < 4) top.push({ joint: 0, weight: 0 });
  return top.map((w) => ({ joint: w.joint, weight: w.weight / sum }));
}

// ---------------------------------------------------------------------
// Animation clips — keyframed local-rotation tracks per bone. Every
// clip's brief-facing name maps to real clip names via figureAnimConfig.js
// (generated at the bottom of this script) so CharacterHead.js never
// hardcodes these exact strings.
// ---------------------------------------------------------------------
const Q = (axis, deg) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), THREE.MathUtils.degToRad(deg));
const QI = new THREE.Quaternion(); // identity
const mulQ = (...qs) => qs.reduce((acc, q) => acc.multiply(q), new THREE.Quaternion());

// Rest-pose local rotations for the arm bones are identity (the mesh's
// OWN current pose IS the bind pose — see the file-level comment's point
// 1) — so every arm keyframe below is expressed as a rotation AWAY FROM
// identity, not away from some assumed T-pose.
function armDown() {
  return { shoulder: QI.clone(), forearm: QI.clone() };
}
// Raises the arm out to the side and up — shoulder does the bulk of the
// lift, forearm bends up at the elbow, matching how a two-bone arm with no
// separate hand bone reads as "waving" from this camera's 45-degree
// isometric bearing.
function armRaised(sideSign, liftDeg, forwardDeg, elbowBendDeg) {
  const shoulder = mulQ(Q([0, 0, 1], sideSign * liftDeg), Q([1, 0, 0], forwardDeg));
  const forearm = Q([1, 0, 0], -elbowBendDeg);
  return { shoulder, forearm };
}

function track(times, values) {
  return { times, values };
}

// Each clip: { duration, loop, tracks: { boneName: {times:[...], values:[quats...]} } }
function buildClips() {
  const clips = {};

  // Idle — subtle chest sway + head bob, loops forever while `t=1` and no
  // gesture is playing (CharacterHead.js's own base layer).
  {
    const spineSway = [Q([0, 0, 1], -1.5), Q([0, 0, 1], 1.5), Q([0, 0, 1], -1.5)];
    const headBob = [Q([1, 0, 0], -1), Q([1, 0, 0], 1.2), Q([1, 0, 0], -1)];
    clips.Idle = {
      duration: 3,
      loop: true,
      tracks: {
        Spine: track([0, 1.5, 3], spineSway),
        Head: track([0, 1.5, 3], headBob),
      },
    };
  }

  // HappyIdle — same idea, faster and a touch more energetic (a little
  // hip bounce via Hips itself, which every non-arm/head bone is rigidly
  // weighted to, per the file-level comment's point 3 — so this reads as
  // a small whole-body bounce, not just a chest wiggle).
  {
    clips.HappyIdle = {
      duration: 1.6,
      loop: true,
      tracks: {
        Hips: track([0, 0.8, 1.6], [Q([0, 0, 1], 2), Q([0, 0, 1], -2), Q([0, 0, 1], 2)]),
        Spine: track([0, 0.8, 1.6], [Q([0, 0, 1], -3), Q([0, 0, 1], 3), Q([0, 0, 1], -3)]),
        Head: track([0, 0.8, 1.6], [Q([1, 0, 0], 2), Q([1, 0, 0], -2.5), Q([1, 0, 0], 2)]),
      },
    };
  }

  // Wave — one-shot: raise the right-side arm, wave the forearm 3x, lower.
  //
  // sideSign=-1 for every Right*-bone clip in this file: confirmed by
  // direct render that +1 swings the arm INWARD across the chest (toward
  // +X, since RightShoulder's own joint sits at X=-0.19 — rotating its
  // local "hangs down" vector by a POSITIVE angle around Z moves it toward
  // local +X, which is toward the body's centerline, not away from it).
  // -1 swings it outward instead — this was wrong in an earlier version
  // of this script and looked like "nothing is animating" from the front,
  // since the arm just swept across the torso and stayed within its
  // silhouette rather than reading as a raised arm.
  {
    const s = -1;
    const restU = armDown().shoulder;
    const restF = armDown().forearm;
    const upU = armRaised(s, 95, -25, 15).shoulder; // lift OUT and slightly forward (see armRaised's own doc comment)
    const upF = armRaised(s, 95, -25, 15).forearm;
    const wagF1 = mulQ(upF, Q([0, 1, 0], 18));
    const wagF2 = mulQ(upF, Q([0, 1, 0], -18));
    clips.Wave = {
      duration: 2.4,
      loop: false,
      tracks: {
        RightShoulder: track([0, 0.35, 2.05, 2.4], [restU, upU, upU, restU]),
        RightForearm: track(
          [0, 0.35, 0.65, 0.95, 1.25, 1.55, 1.85, 2.05, 2.4],
          [restF, upF, wagF1, wagF2, wagF1, wagF2, wagF1, upF, restF]
        ),
      },
    };
  }

  // ThumbsUp — no finger geometry to pose (see the file-level honesty
  // note), so this is an arm-raise-and-hold approximation: forearm comes
  // up in front of the chest, held.
  {
    const restU = armDown().shoulder;
    const restF = armDown().forearm;
    const upU = armRaised(-1, 100, 15, 95).shoulder;
    const upF = armRaised(-1, 100, 15, 95).forearm;
    clips.ThumbsUp = {
      duration: 2.2,
      loop: false,
      tracks: {
        RightShoulder: track([0, 0.3, 1.9, 2.2], [restU, upU, upU, restU]),
        RightForearm: track([0, 0.3, 1.9, 2.2], [restF, upF, upF, restF]),
      },
    };
  }

  // LookAround — pure head yaw sweep, no arm involvement.
  {
    clips.LookAround = {
      duration: 3,
      loop: false,
      tracks: {
        Head: track(
          [0, 0.6, 1.5, 2.4, 3],
          [QI.clone(), Q([0, 1, 0], 35), Q([0, 1, 0], -35), Q([0, 1, 0], 12), QI.clone()]
        ),
      },
    };
  }

  // Salute — arm raises to the temple, held, lowers.
  {
    const restU = armDown().shoulder;
    const restF = armDown().forearm;
    const upU = armRaised(-1, 160, -20, 120).shoulder;
    const upF = armRaised(-1, 160, -20, 120).forearm;
    clips.Salute = {
      duration: 2.4,
      loop: false,
      tracks: {
        RightShoulder: track([0, 0.35, 2.05, 2.4], [restU, upU, upU, restU]),
        RightForearm: track([0, 0.35, 2.05, 2.4], [restF, upF, upF, restF]),
      },
    };
  }

  return clips;
}

async function main() {
  if (!fs.existsSync(SRC_GLB)) {
    console.error(`${SRC_GLB} not found — run scripts/build-head-precompute.js first.`);
    process.exit(1);
  }

  await meshoptimizer.MeshoptDecoder.ready;
  await meshoptimizer.MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.decoder': meshoptimizer.MeshoptDecoder,
      'meshopt.encoder': meshoptimizer.MeshoptEncoder,
    });

  console.log('Reading', path.relative(ROOT, SRC_GLB));
  const srcDoc = await io.read(SRC_GLB);
  if (srcDoc.getRoot().listSkins().length > 0) {
    console.error(
      `${path.relative(ROOT, SRC_GLB)} already has a skin — this script's SRC_GLB and OUT_GLB are the same ` +
        'path, so re-running it against its own already-rigged output (rather than the clean, unrigged file ' +
        "buildFigure() produces) would layer a second skeleton on top. Restore the unrigged file first (this " +
        'session kept a backup during development; going forward, regenerate it via build-head-precompute.js).'
    );
    process.exit(1);
  }
  const srcMesh = srcDoc.getRoot().listMeshes()[0];
  const srcPrim = srcMesh.listPrimitives()[0];
  const posAcc = srcPrim.getAttribute('POSITION');
  const normalAcc = srcPrim.getAttribute('NORMAL');
  const colorAcc = srcPrim.getAttribute('COLOR_0');
  const indicesAcc = srcPrim.getIndices();
  const nVerts = posAcc.getCount();
  console.log(`  ${nVerts} verts, ${indicesAcc.getCount() / 3} tris`);

  // The mesh's own NODE (not the accessor) carries a compensating scale —
  // meshopt()'s quantization picks the tightest int16 volume for POSITION
  // and bakes a matching scale onto the node so the combination decodes
  // back to true model space (a legitimate, standard KHR_mesh_quantization
  // pattern; three.js's GLTFLoader applies both automatically, which is
  // why this rendered correctly in the browser throughout Phase 1). Direct
  // `accessor.getElement()` reads only the raw accessor value, silently
  // skipping that node-level scale — confirmed directly: this file's own
  // vertices decoded via getElement() alone come back exactly 2x too big
  // (a Y-bound of 1.0 instead of the true 0.5). Not a bug in the shipped
  // Phase 1 asset — a bug in reading it without the compensating node
  // transform this same script's own earlier version omitted.
  const srcNode = srcDoc.getRoot().listNodes().find((n) => n.getMesh() === srcMesh);
  const nodeScale = srcNode ? srcNode.getScale() : [1, 1, 1];
  console.log(`  mesh node compensating scale: [${nodeScale.join(', ')}]`);

  const position = new Float32Array(nVerts * 3);
  const normal = new Float32Array(nVerts * 3);
  const color = new Float32Array(nVerts * 3);
  const el = [0, 0, 0];
  for (let i = 0; i < nVerts; i += 1) {
    posAcc.getElement(i, el);
    position[i * 3] = el[0] * nodeScale[0];
    position[i * 3 + 1] = el[1] * nodeScale[1];
    position[i * 3 + 2] = el[2] * nodeScale[2];
    // NORMAL is a direction, not a position — a uniform scale (confirmed
    // uniform: nodeScale's three components are equal) doesn't change its
    // direction, so no compensation needed here.
    normalAcc.getElement(i, el);
    normal.set(el, i * 3);
    colorAcc.getElement(i, el);
    color.set(el, i * 3);
  }
  const indices = indicesAcc.getArray();

  console.log('Computing envelope skin weights...');
  const joints = new Uint16Array(nVerts * 4);
  const weights = new Float32Array(nVerts * 4);
  for (let i = 0; i < nVerts; i += 1) {
    const p = [position[i * 3], position[i * 3 + 1], position[i * 3 + 2]];
    const w = computeVertexWeights(p);
    for (let k = 0; k < 4; k += 1) {
      joints[i * 4 + k] = w[k].joint;
      weights[i * 4 + k] = w[k].weight;
    }
  }

  // ---- Build output document -----------------------------------------
  const doc = new Document();
  const buffer = doc.createBuffer();

  const positionAccessor = doc.createAccessor().setType('VEC3').setArray(position).setBuffer(buffer);
  const normalAccessor = doc.createAccessor().setType('VEC3').setArray(normal).setBuffer(buffer);
  const colorAccessor = doc.createAccessor().setType('VEC3').setArray(color).setBuffer(buffer);
  const jointsAccessor = doc.createAccessor().setType('VEC4').setArray(joints).setBuffer(buffer);
  const weightsAccessor = doc.createAccessor().setType('VEC4').setArray(weights).setBuffer(buffer);
  const indexAccessor = doc
    .createAccessor()
    .setType('SCALAR')
    .setArray(indices instanceof Uint32Array ? indices : new Uint32Array(indices))
    .setBuffer(buffer);

  const material = doc.createMaterial('wsm-figure').setBaseColorFactor([1, 1, 1, 1]).setRoughnessFactor(1);
  const primitive = doc
    .createPrimitive()
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setAttribute('COLOR_0', colorAccessor)
    .setAttribute('JOINTS_0', jointsAccessor)
    .setAttribute('WEIGHTS_0', weightsAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);
  const mesh = doc.createMesh('wsm-figure').addPrimitive(primitive);

  // ---- Skeleton nodes (parent-relative translations, identity rotation
  // at bind time — the mesh's OWN current pose IS the bind pose) --------
  const worldPos = Object.fromEntries(BONES.map((b) => [b.name, b.pos]));
  const nodeByName = {};
  for (const b of BONES) {
    const node = doc.createNode(b.name);
    const parentWorld = b.parent ? worldPos[b.parent] : [0, 0, 0];
    node.setTranslation([b.pos[0] - parentWorld[0], b.pos[1] - parentWorld[1], b.pos[2] - parentWorld[2]]);
    nodeByName[b.name] = node;
  }
  for (const b of BONES) {
    if (b.parent) nodeByName[b.parent].addChild(nodeByName[b.name]);
  }

  const skin = doc.createSkin('wsm-figure-skin').setSkeleton(nodeByName.Hips);
  const ibmFlat = new Float32Array(BONES.length * 16);
  BONES.forEach((b, i) => {
    skin.addJoint(nodeByName[b.name]);
    // Bind-pose rotation/scale are identity for every joint, so the
    // inverse bind matrix is exactly a translation by -worldPos.
    const m = new THREE.Matrix4().makeTranslation(-b.pos[0], -b.pos[1], -b.pos[2]);
    ibmFlat.set(m.toArray(), i * 16);
  });
  const ibmAccessor = doc.createAccessor().setType('MAT4').setArray(ibmFlat).setBuffer(buffer);
  skin.setInverseBindMatrices(ibmAccessor);

  const meshNode = doc.createNode('wsm-figure-mesh').setMesh(mesh).setSkin(skin);
  const scene = doc.createScene();
  scene.addChild(meshNode);
  scene.addChild(nodeByName.Hips);

  // ---- Animations -------------------------------------------------------
  const clips = buildClips();
  const animNameMap = {};
  for (const [clipName, clip] of Object.entries(clips)) {
    const anim = doc.createAnimation(clipName);
    for (const [boneName, t] of Object.entries(clip.tracks)) {
      const node = nodeByName[boneName];
      const timesAcc = doc.createAccessor().setType('SCALAR').setArray(new Float32Array(t.times)).setBuffer(buffer);
      const valuesFlat = new Float32Array(t.values.length * 4);
      t.values.forEach((q, i) => valuesFlat.set(q.toArray(), i * 4));
      const valuesAcc = doc.createAccessor().setType('VEC4').setArray(valuesFlat).setBuffer(buffer);
      const sampler = doc.createAnimationSampler().setInput(timesAcc).setOutput(valuesAcc).setInterpolation('LINEAR');
      anim.addSampler(sampler);
      const channel = doc.createAnimationChannel().setTargetNode(node).setTargetPath('rotation').setSampler(sampler);
      anim.addChannel(channel);
    }
    animNameMap[clipName] = { clip: clipName, duration: clip.duration, loop: clip.loop };
  }

  // meshopt() bakes a compensating scale onto the mesh's own NODE when it
  // quantizes POSITION (see the file-level comment on `nodeScale` above —
  // that's what caused this script's own naive first read to come back at
  // 2x). That's fine for the actual runtime consumer: three.js's
  // GLTFLoader applies the node scale automatically, same as it did for
  // this exact file all through Phase 1. It only broke a plain
  // accessor.getElement() read done without also reading the node — which
  // is what this script's OWN diagnostics do, so verify this compressed
  // output via the browser-based render harness (real GLTFLoader path),
  // not another raw Node.js accessor dump.
  console.log('Compressing (meshopt)...');
  await doc.transform(meshopt({ encoder: meshoptimizer.MeshoptEncoder, level: 'medium' }));
  await io.write(OUT_GLB, doc);
  const size = fs.statSync(OUT_GLB).size;
  console.log(`\nWrote ${path.relative(ROOT, OUT_GLB)}: ${(size / 1024).toFixed(1)} KB`);
  console.log(`Bones: ${BONES.length} (${BONE_NAMES.join(', ')})`);
  console.log(`Clips: ${Object.keys(clips).join(', ')}`);

  fs.writeFileSync(
    CONFIG_OUT,
    `// GENERATED by scripts/build-figure-rig.js — do not hand-edit.
// Maps the brief's logical gesture names to this rig's actual clip names
// (identical here since this script authors both, but CharacterHead.js
// goes through this indirection anyway rather than hardcoding clip name
// strings, in case the rig is ever regenerated with different names).
const FIGURE_ANIM_CONFIG = {
  bones: ${JSON.stringify(BONE_NAMES)},
  clips: ${JSON.stringify(animNameMap, null, 2)},
};

export default FIGURE_ANIM_CONFIG;
`
  );
  console.log(`Wrote ${path.relative(ROOT, CONFIG_OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
