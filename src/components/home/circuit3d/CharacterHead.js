import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { proximitySignal } from '../../../lib/proximitySignal';
import { holoGlitchSignal } from '../../../lib/holoGlitchSignal';
import { sourceCaptureSignal } from '../../../lib/sourceCaptureSignal';
import { figureStateSignal } from '../../../lib/figureStateSignal';
import FIGURE_METRICS from '../../../data/figureMetrics';
import FIGURE_ANIM_CONFIG from '../../../data/figureAnimConfig';

// Meshopt-compressed FULL-BODY sculpt (tenth pass) — see
// scripts/build-head-precompute.js's `buildFigure()` for the pipeline
// (same decimate/up-axis-bake/color-bake steps as the retired wsm-head.glb,
// just left uncropped and at a higher tri budget so the face stays
// readable at whole-body scale). This one model renders BOTH the
// hologram-head rest state and the full-color materialized figure — see
// the file-level comment on `t` below — rather than the old design's
// separate, permanently-cropped head file.
const MODEL_URL = '/models/wsm-figure.glb';
useGLTF.preload(MODEL_URL, false, true);

// Blue duotone ramp — kept in sync manually with build-head-precompute.js's
// RAMP (used there for the mobile/SVG fallback still); this copy lives as
// GLSL literals baked into the shader string below rather than a shared
// JSON import, since one is a build-time Node script and the other is
// compiled into a three.js material.
const RAMP_DARK = [0x14 / 255, 0x24 / 255, 0x2c / 255];
const RAMP_MID = [0x24 / 255, 0x3a / 255, 0x7a / 255];
const RAMP_LIGHT = [0x3a / 255, 0xaf / 255, 0xf1 / 255];
const RIM_COLOR = [0x46 / 255, 0xaa / 255, 0xe0 / 255];
const HUE_RETENTION = 0.35; // how much original hue survives the duotone remap

const OUTLINE_COLOR = '#3AAFF1';
const OUTLINE_SCALE = 1.035;

// Resting pose: the ortho camera sits at [16,15,16] (45deg bearing) and the
// baked mesh faces +Z, so +45deg yaw faces it dead-on; -20deg from there
// turns him toward the text column (.hero-chamber__content is
// align-items:flex-start, i.e. the LEFT side of the hero). The -10deg
// pitch compensates for the camera looking down — unpitched, the cap
// dominates and both eyes don't read. Verified by rendering yaw
// 0/25/45/65deg through the real camera basis before shipping (see the
// plan's Part 2 derivation).
const BASE_YAW = THREE.MathUtils.degToRad(25);
const BASE_PITCH = THREE.MathUtils.degToRad(-10);

// Proximity → opacity/scan-line mapping, per the plan's Part 4 table.
// OPACITY_FAR was 0.35 through Phase 1 (the separately-decimated,
// separately-color-baked head-only crop) and looked fine there. Rendered
// against the SAME board at the same opacity, the tenth pass's full-body
// rig read as a near-featureless dark blob — confirmed directly (forcing
// opacity to 1 in a scratch build reproduced the OLD crisp, high-contrast
// duotone look exactly, proving the shader logic itself is unbroken).
// The full-body mesh's own vertex colors evidently carry less contrast
// than the old crop's did (a different decimation/sampling pass over the
// same source texture), so the same 35% blend against the dark board
// reads far fainter. Raised until the idle (far) state reads clearly
// again — verified by screenshot, not computed.
const OPACITY_FAR = 0.55;
const OPACITY_NEAR = 0.9;
const NEAR_THRESHOLD = 0.85; // at/above this, "near": flicker stops, scan lines light

// "De-rez" state while the hover-head photo ring is open
// (circuit3d/SourceCaptures.js) — the head reverts toward near-transparent
// with heavier scan lines, reading as "reverting to source," independent
// of (layered on top of) the ordinary proximity-driven opacity above. Now
// that the ring only ever opens once the figure is fully materialized (see
// figureStateSignal's own header comment), this dims the COLOR copy
// instead of the (by-then-invisible) holo copy — same idea, different
// target.
const OPACITY_DEREZ = 0.15;
const DEREZ_LERP_RATE = 0.1; // ~450ms to settle at 60fps, same convention as the yaw/pitch lerp below

// --- Tenth pass: hologram <-> full-color figure materialization --------
//
// One loaded model, one float `t` in [0,1] held in a ref (never React
// state — it moves every frame): 0 = today's hologram head, 1 = the full-
// color figure standing on the electrode. Every other per-frame quantity
// below (scale, position, clip plane, material opacities) is a FUNCTION of
// `t`, not an independent timer — this is what makes reversing mid-
// transition trivial (the lerp below just heads the other way from
// wherever `t` currently is; there's no separate state machine to unwind).
//
// `t`'s target is `figureStateSignal.hoverTarget`, written every frame by
// CircuitBoardR3F.js's BoardHoverTrigger (a manual raycast against the
// board substrate + the figure itself — see that file for why).
const T_LERP_RATE_IN = 0.055; // ~900ms to settle at 60fps, matching the brief's A->B
const T_LERP_RATE_OUT = 0.07; // ~700ms to settle at 60fps, matching B->A

// Today's on-screen head height (world units) — matches the retired
// wsm-head.glb's own `scale` value one-for-one, so `t=0` reproduces
// today's exact framing. The figure's head+shoulders only span
// FIGURE_METRICS.headSpanHeight of its own unit-tall body, so the group's
// actual scale at t=0 has to be REST_HEIGHT/headSpanHeight, not
// REST_HEIGHT directly (see restScale0 below) — computed here from the
// MEASURED metric, not assumed.
const REST_HEIGHT = 3.4;
// Full-figure scale at t=1, as a fraction of REST_HEIGHT — the brief's own
// "~0.85x" starting point; a genuine visual judgment call, not derived
// from anything measurable, and the one placement number in this file
// worth re-tuning by eye if the figure reads too big/small on screen.
const FIGURE_SCALE_FACTOR = 0.85;
const FEET_CLEARANCE = 0.01;

// FIGURE_METRICS.headSpanHeight is measured (not assumed) against the
// figure's OWN geometry, but the rendered result still needed a real
// screenshot to confirm — comparing at rest against the retired
// wsm-head.glb's own framing showed the figure's head reading visibly
// larger despite the "3.4 world units tall" arithmetic matching exactly.
// Most likely cause: the figure is decimated independently (a separate
// MeshoptSimplifier pass at a different tri budget/ratio than the old
// dedicated head crop), and curvature-adaptive simplification doesn't
// preserve the same amount of protruding hair/beard/cap silhouette detail
// at the two different budgets — the measured Y-extent (top-of-head to
// shoulder-line) can match while the visually-perceived silhouette still
// reads bigger. RENDER_SIZE_TUNE corrects for that gap; verified by the
// same "trust the screenshot, not the math" standard this file's own
// headBaseHeight/headScale constants over in CircuitBoardR3F.js were
// tuned by.
const RENDER_SIZE_TUNE = 0.80;
const restScale0 = (REST_HEIGHT / FIGURE_METRICS.headSpanHeight) * RENDER_SIZE_TUNE;
const restScale1 = REST_HEIGHT * FIGURE_SCALE_FACTOR;

// --- Rig (Part 2): procedurally-built skin + gesture clips ---------------
// wsm-figure.glb's source sculpt has no skeleton and no animations of its
// own (confirmed via gltf-transform inspection) and neither Mixamo
// (requires an Adobe account login) nor Blender (not installed) were
// available to produce one — see scripts/build-figure-rig.js's own header
// comment for the full account of how this rig was built instead: hand-
// placed joints read directly off grid-overlaid renders, envelope
// (capsule-distance) skin weights, and hand-keyframed rotation clips.
// Bone count, clip names, and clip-name mapping all come from that
// script's own generated output (figureAnimConfig.js) rather than being
// hardcoded here a second time.
const GESTURE_WEIGHTS = { Wave: 3, ThumbsUp: 2, LookAround: 2, Salute: 1 };
const GESTURE_NAMES = Object.keys(GESTURE_WEIGHTS);
const GESTURE_TOTAL_WEIGHT = Object.values(GESTURE_WEIGHTS).reduce((a, b) => a + b, 0);
const GESTURE_MIN_GAP_S = 6;
const GESTURE_MAX_GAP_S = 12;
const GESTURE_CROSSFADE_S = 0.25;
const LOOK_AT_YAW_MAX = THREE.MathUtils.degToRad(25);
const LOOK_AT_PITCH_MAX = THREE.MathUtils.degToRad(12);
const LOOK_AT_LERP_RATE = 0.08;

function pickWeightedGesture(exclude) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    let r = Math.random() * GESTURE_TOTAL_WEIGHT;
    let picked = GESTURE_NAMES[0];
    for (const name of GESTURE_NAMES) {
      r -= GESTURE_WEIGHTS[name];
      if (r <= 0) {
        picked = name;
        break;
      }
    }
    if (picked !== exclude) return picked;
  }
  return GESTURE_NAMES[0];
}

// Cel-shading light bands for MeshToonMaterial's own lighting response —
// independent of the vertex-color duotone remap below (that's a *base
// color* stylization; this is a *lighting* stylization). Module-scope: one
// shared texture, never recreated per mount.
const gradientMapData = new Uint8Array([0, 128, 255]);
const gradientMap = new THREE.DataTexture(gradientMapData, gradientMapData.length, 1, THREE.RedFormat);
gradientMap.needsUpdate = true;
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.minFilter = THREE.NearestFilter;
gradientMap.generateMipmaps = false;

// Deterministic pseudo-random in [0,1), used only to jitter the next
// glitch's timing — no dependency needed for one throwaway value per cycle.
function hash(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function easeOutCubic(x) {
  return 1 - (1 - x) ** 3;
}

// Standard smoothstep — used both as the brief's own `smoothstep(0.25,
// 0.75, t)` material crossfade curve and as an easeInOut for the clip
// plane's travel.
function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function patchHologramShader(shader) {
  shader.uniforms.uTime = { value: 0 };
  shader.uniforms.uScanIntensity = { value: 0.6 };
  // Where the clip plane currently sits, in this SAME model's local space
  // — the bottom-dissolve band rides this moving line instead of a
  // hardcoded constant, so it still reads as "fading out at the cut" at
  // every value of `t`, not just at the old fixed head-crop edge.
  shader.uniforms.uClipY = { value: FIGURE_METRICS.shoulderY };
  // 1 at t=0, eases to 0 as the color copy takes over (see
  // smoothstep(0.25,0.75,t) below) — scales the rim/scan-line cues out
  // alongside the opacity fade instead of leaving them full-strength under
  // a fully-transparent material.
  shader.uniforms.uFadeOut = { value: 1 };

  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
      varying float vObjY;
      varying vec3 vViewDirCustom;`
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vObjY = position.y;`
    )
    .replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vViewDirCustom = normalize( -mvPosition.xyz );`
    );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>
      varying float vObjY;
      varying vec3 vViewDirCustom;
      uniform float uTime;
      uniform float uScanIntensity;
      uniform float uClipY;
      uniform float uFadeOut;`
    )
    .replace(
      '#include <color_fragment>',
      `
      {
        // Duotone remap: quantize the baked vertex color's luminance to the
        // 3-step blue ramp, then let some of the original hue survive so
        // feature contrast (dark glasses/beard vs. warm cap vs. mid skin)
        // isn't lost — see build-head-precompute.js's duotone() for the
        // build-time equivalent used on the fallback still.
        vec3 bakedColor = vColor.rgb;
        float lum = clamp(dot(bakedColor, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
        vec3 rampDark = vec3(${RAMP_DARK[0]}, ${RAMP_DARK[1]}, ${RAMP_DARK[2]});
        vec3 rampMid = vec3(${RAMP_MID[0]}, ${RAMP_MID[1]}, ${RAMP_MID[2]});
        vec3 rampLight = vec3(${RAMP_LIGHT[0]}, ${RAMP_LIGHT[1]}, ${RAMP_LIGHT[2]});
        vec3 rampColor = lum < 0.5
          ? mix(rampDark, rampMid, lum * 2.0)
          : mix(rampMid, rampLight, (lum - 0.5) * 2.0);
        float maxC = max(max(bakedColor.r, bakedColor.g), max(bakedColor.b, 0.0001));
        vec3 tint = bakedColor / maxC;
        vec3 tinted = rampColor * tint;
        diffuseColor.rgb = mix(rampColor, tinted, ${HUE_RETENTION.toFixed(3)});
      }
      `
    )
    .replace(
      '#include <dithering_fragment>',
      `
      {
        // Fresnel rim — the single most important hologram cue, strongest
        // at grazing angles so the silhouette glows. Fades out with the
        // rest of the holo treatment as the color copy takes over.
        float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDirCustom)), 0.0, 1.0), 3.0);
        gl_FragColor.rgb += vec3(${RIM_COLOR[0]}, ${RIM_COLOR[1]}, ${RIM_COLOR[2]}) * fresnel * 0.9 * uFadeOut;
      }
      #include <dithering_fragment>
      `
    );

  return shader;
}

// Color copy's own shader patch — just the brief's "faint blue Fresnel rim
// ~0.3," not the duotone/scanline/dissolve treatment above (the clip
// plane's native hard cut plus the print band mesh already sell the edge
// for this copy; a second soft alpha dissolve on top would just look like
// a seam).
function patchColorRimShader(shader) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n      varying vec3 vViewDirRim;`)
    .replace(
      '#include <project_vertex>',
      `#include <project_vertex>\n      vViewDirRim = normalize( -mvPosition.xyz );`
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n      varying vec3 vViewDirRim;`)
    .replace(
      '#include <dithering_fragment>',
      `
      {
        float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDirRim)), 0.0, 1.0), 3.0);
        gl_FragColor.rgb += vec3(${RIM_COLOR[0]}, ${RIM_COLOR[1]}, ${RIM_COLOR[2]}) * fresnel * 0.3;
      }
      #include <dithering_fragment>
      `
    );
  return shader;
}

/**
 * The hologram-style Funko head, projected up out of the board's sensor
 * pad — and, since the tenth pass, the same figure materialized full-body
 * and in color while the board (or the figure itself) is hovered. Replaces
 * the original voxel renderer entirely (see git history) — that treatment
 * discarded every feature that made the source model read as a face. This
 * one renders the actual (decimated) mesh with a cel-shaded, duotone,
 * Fresnel-rimmed, scan-lined material for the hologram state, and a second
 * vertex-colored toon material for the materialized state, cross-fading
 * between them as a function of `t` (see the file-level comment above).
 *
 * `style` stays as a prop for parity with the rest of this scene's
 * lazy-loaded-optional-feature components, but 'hologram' is the only
 * value that renders anything — a non-hologram style renders null rather
 * than guessing at a treatment nobody has designed yet.
 */
export default function CharacterHead({
  style = 'hologram',
  position = [0, 0, 0],
  scale = REST_HEIGHT,
  groundY = 0,
  reducedMotion,
  onGroupRef,
}) {
  // Every hook below must run unconditionally regardless of `style`
  // (Rules of Hooks) — the actual early-out is in the JSX return.
  const isHologram = style === 'hologram';

  // drei's useGLTF (this installed version) returns the raw parsed GLTF —
  // no gltfjsx-style `nodes`/`materials` convenience maps — so the mesh's
  // geometry is pulled directly off the scene graph by name instead.
  const gltf = useGLTF(MODEL_URL, false, true);
  // build-figure-rig.js names the skinned mesh's own node "wsm-figure-mesh"
  // (distinct from the mesh DATA's name, "wsm-figure") and the skeleton's
  // root joint "Hips" — both looked up by name rather than assumed to be
  // gltf.scene's first/only children, since drei's useGLTF here returns
  // the raw parsed graph with no nodes/materials convenience map.
  const rig = useMemo(() => {
    const scene = gltf.scene;
    if (!scene) return null;
    const skinnedMesh = scene.getObjectByName('wsm-figure-mesh');
    if (!skinnedMesh?.isSkinnedMesh || !skinnedMesh.skeleton) return null;
    // The root joint is read off the SKELETON's own bone list, not off
    // `scene.getObjectByName('Hips')` — confirmed directly that the two
    // disagree: drei's useGLTF returns a scene whose only children are an
    // unnamed group and the SkinnedMesh itself (no bones at all under it,
    // even though the exported GLB's own JSON correctly lists Hips as a
    // top-level scene node with its full child hierarchy — verified by
    // reading the GLB's JSON chunk directly). Most likely a plain
    // `.clone()` somewhere in drei's caching path, which — unlike three's
    // own `SkeletonUtils.clone()` — doesn't preserve a cloned skinned
    // mesh's bone hierarchy. `skinnedMesh.skeleton.bones`, populated by
    // GLTFLoader's own skin-binding step, still has the real Bone objects
    // with their parent-child chain intact regardless.
    const hipsBone = skinnedMesh.skeleton.bones.find((b) => b.name === 'Hips');
    if (!hipsBone) return null;
    return { geometry: skinnedMesh.geometry, skeleton: skinnedMesh.skeleton, hipsBone };
  }, [gltf]);
  const geometry = rig?.geometry ?? null;

  // Diagnostic only (see HeroChamber.js's matching 'hero-content-mounted'
  // and HeroCircuitBoard.js's 'hero-board-ready') — by the time this
  // component's function body runs at all, useGLTF's own Suspense
  // throw/resolve has already happened, so `geometry` is available on the
  // very first successful render; this just timestamps that moment.
  useEffect(() => {
    if (geometry) performance.mark('hero-head-ready');
  }, [geometry]);

  const groupRef = useRef(null);
  const outlineMaterialRef = useRef(null);
  const printBandRef = useRef(null);
  const printBandMaterialRef = useRef(null);
  const driftRef = useRef({ t: hash(1) * 100 });
  const glitchRef = useRef({ active: false, endsAt: 0, nextAt: 2 + hash(2) * 4 });
  const derezRef = useRef(0);
  const tRef = useRef(0); // 0 = hologram, 1 = figure — see file-level comment
  const clipPlaneRef = useRef(new THREE.Plane());
  const clipNormalRef = useRef(new THREE.Vector3());
  const clipPointRef = useRef(new THREE.Vector3());

  // --- Rig runtime state ---------------------------------------------
  const mixerRef = useRef(null);
  const idleActionRef = useRef(null);
  const gestureActionRef = useRef(null);
  const gestureNameRef = useRef(null);
  const nextGestureAtRef = useRef(2 + hash(3) * GESTURE_MIN_GAP_S);
  const wasFigureRef = useRef(false);
  const headBoneRef = useRef(null);
  const spineBoneRef = useRef(null);
  const lookYawRef = useRef(0);
  const lookPitchRef = useRef(0);
  const blinkLoggedRef = useRef(false);
  const lookAddQuatRef = useRef(new THREE.Quaternion());
  const lookAddEulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const leanAddQuatRef = useRef(new THREE.Quaternion());
  const leanAddEulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    if (!rig) return undefined;
    const mixer = new THREE.AnimationMixer(rig.hipsBone);
    mixerRef.current = mixer;
    const idleClip = gltf.animations.find((a) => a.name === FIGURE_ANIM_CONFIG.clips.Idle.clip);
    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.play();
      idleActionRef.current = action;
    }
    headBoneRef.current = rig.skeleton.getBoneByName('Head');
    spineBoneRef.current = rig.skeleton.getBoneByName('Spine');

    // Blink fallback chain, per the brief: morph target -> separate eye
    // meshes -> skip and log. This rig has neither (a single continuous
    // mesh with no morph targets — confirmed via the same gltf-transform
    // inspection that found no skeleton/animations on the source sculpt),
    // so this always lands on the third rung. Logged once, not per frame.
    if (!blinkLoggedRef.current) {
      blinkLoggedRef.current = true;
      // eslint-disable-next-line no-console
      console.log(
        '[CharacterHead] blink: no morph target and no separate eye meshes on wsm-figure.glb — skipping (see the brief\'s own documented fallback).'
      );
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rig, gltf]);

  const material = useMemo(() => {
    const mat = new THREE.MeshToonMaterial({
      color: '#ffffff',
      gradientMap,
      vertexColors: true,
      transparent: true,
      opacity: OPACITY_FAR,
      depthWrite: true,
      side: THREE.FrontSide,
      clippingPlanes: [clipPlaneRef.current],
    });
    mat.onBeforeCompile = (shader) => {
      mat.userData.shader = patchHologramShader(shader);
    };
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The materialized figure's own material — same toon gradient response
  // as the holo copy, but reading the model's REAL baked vertex color
  // (no duotone remap) with no `map`: the exported GLB carries color as
  // COLOR_0 vertex colors, not a baseColorTexture (verified directly via
  // gltf-transform inspection — see the tenth pass's plan), so there is no
  // texture to bind here.
  const colorMaterial = useMemo(() => {
    const mat = new THREE.MeshToonMaterial({
      color: '#ffffff',
      gradientMap,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.FrontSide,
      clippingPlanes: [clipPlaneRef.current],
    });
    mat.onBeforeCompile = (shader) => {
      mat.userData.shader = patchColorRimShader(shader);
    };
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    material.dispose();
    colorMaterial.dispose();
  }, [material, colorMaterial]);

  // Two THREE.SkinnedMesh instances SHARING one skeleton (three.js
  // decouples Skeleton from any single mesh by design) — one per material,
  // so the existing holo/color crossfade keeps working unmodified while
  // both copies deform identically from the same bone poses. Built once
  // per loaded rig, not per render. Bind matrix is identity: these meshes
  // carry no local transform of their own (the group they're rendered
  // under does all the placement), matching how the source GLTF's own
  // mesh node was bound.
  const skinnedMeshes = useMemo(() => {
    if (!rig) return null;
    const bindMatrix = new THREE.Matrix4();
    const holo = new THREE.SkinnedMesh(rig.geometry, material);
    holo.bind(rig.skeleton, bindMatrix);
    const color = new THREE.SkinnedMesh(rig.geometry, colorMaterial);
    color.bind(rig.skeleton, bindMatrix);
    return { holo, color };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rig, material, colorMaterial]);

  useFrame((state, delta) => {
    if (!isHologram) return;
    const group = groupRef.current;
    if (!group || !skinnedMeshes) return;

    const p = reducedMotion ? 1 : proximitySignal.value;
    const now = state.clock.elapsedTime;

    // Glitch: a single ~80ms opacity dip + a small horizontal pop, never
    // overlapping, only while not yet "near" (a resolved lock shouldn't
    // keep glitching) — disabled entirely under reduced motion.
    const glitch = glitchRef.current;
    if (!reducedMotion && p < NEAR_THRESHOLD && !glitch.active && now >= glitch.nextAt) {
      glitch.active = true;
      glitch.endsAt = now + 0.08;
    }
    if (glitch.active && now >= glitch.endsAt) {
      glitch.active = false;
      glitch.nextAt = now + 3 + hash(now) * 4;
    }
    holoGlitchSignal.active = glitch.active;

    // De-rez while the source-captures ring is open — see
    // sourceCaptureSignal's own file and figureStateSignal's header
    // comment: the ring now only ever opens once `t` is at/near 1, so this
    // dims the COLOR copy (the one actually visible then), not the holo
    // copy the original de-rez cue targeted.
    derezRef.current += ((sourceCaptureSignal.open ? 1 : 0) - derezRef.current) * DEREZ_LERP_RATE;
    const derez = derezRef.current;

    // --- t: hologram <-> figure --------------------------------------
    // Reduced-motion visitors keep the plain static hologram head with no
    // hover-driven materialization at all — this mirrors the previous
    // pass's own precedent for R3F-only interactive mechanics (SourceCaptures'
    // photo ring is likewise never mounted for them), rather than the
    // brief's literal "300ms crossfade" reading, since a full-body
    // materialize/dematerialize is itself a large motion effect regardless
    // of how fast it crossfades.
    const target = reducedMotion ? 0 : figureStateSignal.hoverTarget ? 1 : 0;
    const rate = target > tRef.current ? T_LERP_RATE_IN : T_LERP_RATE_OUT;
    tRef.current += (target - tRef.current) * rate;
    if (tRef.current < 0.0005) tRef.current = 0;
    if (tRef.current > 0.9995) tRef.current = 1;
    const t = tRef.current;
    const colorize = smoothstep(0.25, 0.75, t);

    // Placement — X/Z anchored on the electrode always; scale/Y interpolate
    // between the t=0 (today's hologram framing) and t=1 (feet on the
    // electrode) endpoints, both derived from FIGURE_METRICS rather than
    // hardcoded (see the module-scope restScale0/restScale1 derivation).
    const groupY0 = position[1] - FIGURE_METRICS.headCenterY * restScale0;
    const groupY1 = groundY + FEET_CLEARANCE + 0.5 * restScale1;
    const placementEase = easeOutCubic(t);
    const currentScale = THREE.MathUtils.lerp(restScale0, restScale1, placementEase);
    const currentGroupY = THREE.MathUtils.lerp(groupY0, groupY1, placementEase);

    const targetOpacity = OPACITY_FAR + p * (OPACITY_NEAR - OPACITY_FAR);
    const blendedOpacity = targetOpacity * (1 - derez) + OPACITY_DEREZ * derez;
    const holoFadeOut = 1 - colorize;
    material.opacity = (glitch.active ? 0.6 : blendedOpacity) * holoFadeOut;
    if (outlineMaterialRef.current) {
      outlineMaterialRef.current.opacity = (0.15 + p * 0.55) * holoFadeOut;
    }
    // The color copy dims the same way the holo copy always has while the
    // ring is open — the tenth pass's "de-rez" cue, now on the material
    // that's actually visible when it can trigger.
    colorMaterial.opacity = colorize * (1 - derez * 0.7);
    const colorSettled = colorMaterial.opacity > 0.995;
    colorMaterial.transparent = !colorSettled;
    colorMaterial.depthWrite = colorSettled;
    // "Shadow sells materialized," per the brief — holograms cast none
    // (the holo copy never has castShadow set), the color copy picks it up
    // only once it's mostly opaque, so a shadow doesn't appear under a
    // still-translucent, half-formed figure.
    skinnedMeshes.color.castShadow = colorize > 0.5;

    const shader = material.userData.shader;
    if (shader) {
      shader.uniforms.uTime.value = now;
      // Scan lines intensify on top of the ordinary far/near table while
      // de-rezzing — "reverting to source" reads as heavier interference,
      // not just dimmer.
      shader.uniforms.uScanIntensity.value = Math.min(1, 1 - p + derez * 0.8);
      shader.uniforms.uFadeOut.value = holoFadeOut;
    }

    // --- Clip plane + print band --------------------------------------
    // Local-space clip height first (also drives the holo shader's
    // dissolve uniform and the print band's own position), then converted
    // to a world-space plane — three.js clipping planes are always world-
    // space, and this group sits inside TiltGroup's own live rotation, so
    // the plane has to be recomputed from the group's actual matrixWorld
    // every frame rather than set once.
    const clipEase = smoothstep(0, 1, t);
    const localClipY = THREE.MathUtils.lerp(FIGURE_METRICS.shoulderY, FIGURE_METRICS.feetY - 0.05, clipEase);
    if (shader) shader.uniforms.uClipY.value = localClipY;

    const glitchOffsetX = glitch.active ? 0.012 * scale : 0;

    if (reducedMotion) {
      group.position.set(position[0], position[1], position[2]);
      group.rotation.set(BASE_PITCH, BASE_YAW, 0);
      group.scale.setScalar(restScale0);
    } else {
      // Idle bob + gentle cursor-follow lean, layered on top of the resting
      // pose above — same damped-lerp technique as CircuitBoardR3F's
      // TiltGroup, not a new dependency. The bob amplitude eases out as the
      // figure rises, since a life-size bob reads as unstable/floating once
      // there's a whole body rather than just a hovering head.
      driftRef.current.t += delta;
      const dt = driftRef.current.t;
      const bobAmount = Math.sin(dt * 0.6) * 0.08 * (1 - t * 0.85);
      group.position.set(position[0] + glitchOffsetX, currentGroupY + bobAmount, position[2]);
      group.scale.setScalar(currentScale);
      // proximitySignal.nx/ny (lib/proximitySignal.js), not R3F's own
      // state.pointer — that's canvas-local and simply stops updating once
      // the cursor leaves the canvas element, which used to make the head
      // "snap forward and stop tracking" the instant the cursor moved over
      // the text column. nx/ny are window-wide and already lerped by
      // HeroChamber.js's pointer effect, so this follow is smooth without
      // its own separate damping needed on the input side.
      const targetYaw = BASE_YAW + proximitySignal.nx * 0.35;
      const targetPitch = BASE_PITCH - proximitySignal.ny * 0.18;
      group.rotation.y += (targetYaw + Math.sin(dt * 0.22) * 0.08 - group.rotation.y) * 0.04;
      group.rotation.x += (targetPitch - group.rotation.x) * 0.04;
    }

    group.updateWorldMatrix(true, false);
    // three.js keeps the side the normal points TOWARD (positive signed
    // distance) and clips away the other side — (0,1,0) keeps everything
    // ABOVE localClipY (the head end), not below. Confirmed by direct
    // render: (0,-1,0) was tried first and clipped the wrong way,
    // rendering the LEGS with the head clipped away — caught by this
    // pass's own required rest-state screenshot, not assumed correct.
    const normal = clipNormalRef.current.set(0, 1, 0).transformDirection(group.matrixWorld);
    const point = clipPointRef.current.set(0, localClipY, 0).applyMatrix4(group.matrixWorld);
    clipPlaneRef.current.setFromNormalAndCoplanarPoint(normal, point);

    if (printBandRef.current) {
      const bandVisible = t > 0.01 && t < 0.99;
      printBandRef.current.visible = bandVisible;
      if (bandVisible) {
        printBandRef.current.position.y = localClipY;
        // Brightest mid-transition, fading at both ends — a pure function
        // of t, like everything else here, so an interrupted reversal just
        // fades the band back out from wherever it already was.
        const bandStrength = 1 - Math.abs(colorize - 0.5) * 2;
        if (printBandMaterialRef.current) {
          printBandMaterialRef.current.opacity = 0.55 + bandStrength * 0.45;
        }
      }
    }

    // --- Rig: mixer, gesture loop, look-at ------------------------------
    // Single AnimationMixer, only advanced once the figure is meaningfully
    // present — paused entirely at rest (t~0), per the brief's own
    // performance note, rather than ticking a skeleton nobody can see.
    const mixer = mixerRef.current;
    if (mixer && t > 0.03) {
      mixer.update(delta);
    }

    const isFigure = figureStateSignal.state === 'figure';
    if (isFigure) {
      if (!wasFigureRef.current) {
        // Just arrived at the figure state — give the idle pose a moment
        // before the first gesture rather than firing on arrival.
        nextGestureAtRef.current = now + GESTURE_MIN_GAP_S + hash(now) * (GESTURE_MAX_GAP_S - GESTURE_MIN_GAP_S);
      }
      if (mixer && !gestureActionRef.current && idleActionRef.current && now >= nextGestureAtRef.current) {
        const name = pickWeightedGesture(gestureNameRef.current);
        const clipMeta = FIGURE_ANIM_CONFIG.clips[name];
        const clip = clipMeta && gltf.animations.find((a) => a.name === clipMeta.clip);
        if (clip) {
          const action = mixer.clipAction(clip);
          action.reset();
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.enabled = true;
          action.play();
          idleActionRef.current.crossFadeTo(action, GESTURE_CROSSFADE_S, false);
          gestureActionRef.current = action;
          gestureNameRef.current = name;
        }
      }
    } else {
      // Dropped out of the figure state mid-cycle (dissolving away) —
      // don't let a stale short wait fire the instant it re-materializes.
      nextGestureAtRef.current = now + GESTURE_MIN_GAP_S;
    }
    wasFigureRef.current = isFigure;

    // A LoopOnce action stops running once it hits (and clamps on) its
    // last frame — that's the cue to crossfade back to the idle base
    // layer and schedule the next gesture.
    if (gestureActionRef.current && !gestureActionRef.current.isRunning() && idleActionRef.current) {
      gestureActionRef.current.crossFadeTo(idleActionRef.current, GESTURE_CROSSFADE_S, false);
      idleActionRef.current.enabled = true;
      gestureActionRef.current = null;
      nextGestureAtRef.current = now + GESTURE_MIN_GAP_S + hash(now + 7) * (GESTURE_MAX_GAP_S - GESTURE_MIN_GAP_S);
    }

    // Look-at-cursor: an ADDITIVE bone rotation applied AFTER mixer.update()
    // above (order matters — the clip tracks would otherwise overwrite it
    // every frame), reusing proximitySignal.nx/ny exactly as the hologram
    // head's own group-level look-follow already does, faded in as `t`
    // approaches 1 so it doesn't fight the group-level follow used at
    // t=0 (see the non-reduced-motion branch above).
    if (headBoneRef.current) {
      const targetYaw = reducedMotion ? 0 : proximitySignal.nx * LOOK_AT_YAW_MAX;
      const targetPitch = reducedMotion ? 0 : -proximitySignal.ny * LOOK_AT_PITCH_MAX;
      lookYawRef.current += (targetYaw - lookYawRef.current) * LOOK_AT_LERP_RATE;
      lookPitchRef.current += (targetPitch - lookPitchRef.current) * LOOK_AT_LERP_RATE;
      const lookFade = smoothstep(0.5, 0.95, t);
      if (lookFade > 0.001) {
        lookAddEulerRef.current.set(lookPitchRef.current * lookFade, lookYawRef.current * lookFade, 0);
        lookAddQuatRef.current.setFromEuler(lookAddEulerRef.current);
        headBoneRef.current.quaternion.multiply(lookAddQuatRef.current);
        if (spineBoneRef.current) {
          leanAddEulerRef.current.set(
            lookPitchRef.current * lookFade * 0.2,
            lookYawRef.current * lookFade * 0.2,
            0
          );
          leanAddQuatRef.current.setFromEuler(leanAddEulerRef.current);
          spineBoneRef.current.quaternion.multiply(leanAddQuatRef.current);
        }
      }
    }

    // Publish for sibling components that share this same local space
    // (SourceCaptures anchors its photo ring on the figure's current head
    // position; SensorElectrode collapses its projection cone) — see
    // figureStateSignal.js's own header comment for the full list.
    figureStateSignal.t = t;
    // The material crossfade itself (colorize = smoothstep(0.25,0.75,t))
    // is visually complete well before t reaches 1 — gating "figure"/HUD
    // LIVE at t>=0.999 left a long stretch where the figure already looked
    // fully materialized but the HUD still read MATERIALIZING (caught by
    // screenshot, not assumed): 0.9 has comfortable margin past the
    // color crossfade's own 0.75 saturation point without flickering LIVE
    // before the rise/scale has actually settled.
    figureStateSignal.state =
      t <= 0.001 ? 'hologram' : t >= 0.9 ? 'figure' : figureStateSignal.hoverTarget ? 'materializing' : 'dissolving';
    figureStateSignal.groupLocalPos.x = group.position.x;
    figureStateSignal.groupLocalPos.y = group.position.y;
    figureStateSignal.groupLocalPos.z = group.position.z;
    figureStateSignal.groupLocalScale = currentScale;
  });

  if (!isHologram || !geometry || !skinnedMeshes) return null;

  return (
    <group
      ref={(self) => {
        groupRef.current = self;
        if (onGroupRef) onGroupRef(self);
      }}
      position={position}
      scale={restScale0}
      rotation={[BASE_PITCH, BASE_YAW, 0, 'YXZ']}
    >
      {/* The skeleton's root joint — MUST be part of the rendered scene
          graph (not just referenced by the SkinnedMeshes below) or its
          bones' matrixWorld never gets updated by the normal render-loop
          traversal, and the mixer's own bone rotations would silently
          never reach the GPU. The bones carry no geometry of their own, so
          this adds no visible content — only live transforms. */}
      <primitive object={rig.hipsBone} />
      <primitive object={skinnedMeshes.holo} />
      <primitive object={skinnedMeshes.color} />
      <mesh geometry={geometry} scale={OUTLINE_SCALE}>
        <meshBasicMaterial
          ref={outlineMaterialRef}
          color={OUTLINE_COLOR}
          side={THREE.BackSide}
          transparent
          opacity={0.15}
          depthWrite={false}
          clippingPlanes={[clipPlaneRef.current]}
        />
      </mesh>
      {/* Print band — a thin emissive strip tracking the clip plane's own
          local-space height, only visible mid-transition (see the
          `bandVisible` gate above). Radius is a fixed approximation of the
          figure's own silhouette width (measured ~0.29 half-width at its
          widest — the shoulders/hips — see the tenth pass's plan) rather
          than an exact per-height contour; it reads as "the body being
          printed downward" without needing to track the real silhouette. */}
      <mesh ref={printBandRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.3, 0.36, 32]} />
        <meshBasicMaterial
          ref={printBandMaterialRef}
          color={OUTLINE_COLOR}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
