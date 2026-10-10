// Shared, mutable state for the hero bench scene. A plain object (not React
// state): it changes every frame and is read by the R3F scene, the DOM
// readout and the capture script alike.
//
// Everything in the 3D scene reads THIS object, never the clock or the
// pointer directly. In the live scene a <Driver> writes it each frame; in
// capture mode (scripts/render-hero-assets.js) the script writes it and
// steps the renderer, which is what makes the poster and the mobile loop
// frame-exact copies of the live scene.

export const PF_MIN = 0.18;
export const PF_MAX = 2.14;

// Copy for the classify label. Numbers are illustrative until measured.
// [[PLACEHOLDER: real latency and power from the wrist sensor]]
export const CLASSIFY_LABEL = 'classified: hand · 0.4 ms · 38 µW';

export const benchState = {
  p: 0,        // proximity 0..1 (cursor to pad)
  t: 0,        // seconds, drives idle motion
  draw: 1,     // 0..1 traces drawn in
  drop: 1,     // 0..1 Funko drop-in (0 = above board, 1 = standing)
  fade: 1,     // 0..1 board lights up from shadow
  lookX: 0,    // -1..1 cursor direction, damped
  lookY: 0,
  // targets written by the DOM (pointer) and eased toward by the scene
  pTarget: 0,
  lookTargetX: 0,
  lookTargetY: 0,
  // Projected screen positions as fractions of the canvas (0..1)
  pad: { x: 0.3, y: 0.6, ready: false },
  mcu: { x: 0.6, y: 0.5, ready: false },
};

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const pfFromProximity = (p) => PF_MIN + (PF_MAX - PF_MIN) * (1 - (1 - p) ** 2);

// Auto-loop used on touch devices, the mobile video and the reduced-motion
// poster: a hand approaches the pad, holds, withdraws. Period in seconds.
export const LOOP_SECONDS = 6;
export const proximityAtLoop = (sec) => {
  const x = (((sec % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS) / LOOP_SECONDS;
  if (x < 0.1) return 0;
  if (x < 0.45) return smoothstep(0.1, 0.45, x);
  if (x < 0.75) return 1;
  if (x < 0.95) return 1 - smoothstep(0.75, 0.95, x);
  return 0;
};

// The classify label shows once the whole chain is energised.
export const CLASSIFY_AT = 0.86;
