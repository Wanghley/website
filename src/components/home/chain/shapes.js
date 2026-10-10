import { TRACE_POINTS, TRACE_SECONDS, buildTrace, extractFeatures } from '../../../lib/sensorTrace';

// One path, five shapes. Every shape is TRACE_POINTS points in the SVG's
// 1000 x 560 space, so the scroll can interpolate point-by-point and the
// same <path> element morphs from raw trace to recognised hand.

export const VIEW = { w: 1000, h: 560 };
export const PLOT = { x0: 70, x1: 930, yZero: 470, yPerPf: 380 / 2.4 };
export const CHIP = { x: 350, y: 175, w: 300, h: 200 };

const xOf = (i) => PLOT.x0 + (i / (TRACE_POINTS - 1)) * (PLOT.x1 - PLOT.x0);
const yOf = (pf) => PLOT.yZero - pf * PLOT.yPerPf;
export const xOfTime = (t) => PLOT.x0 + (t / TRACE_SECONDS) * (PLOT.x1 - PLOT.x0);
export const yOfPf = yOf;

// Open hand, fingers up, drawn once as an SVG path in a 0..180 x 0..240 box.
// Sampled along its length so it has the same point count as the trace.
const HAND_D =
  'M62 232 L58 164 C50 154 34 132 22 116 C14 104 26 94 34 104 L56 132 L52 64 ' +
  'C52 50 72 50 72 64 L76 116 L80 38 C80 24 100 24 100 38 L102 112 L108 44 ' +
  'C108 30 128 30 128 44 L128 116 L138 76 C140 64 158 66 156 80 L146 154 ' +
  'C144 180 138 204 132 232';

function sampleHand() {
  const ns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', HAND_D);
  const len = path.getTotalLength();
  const scale = 1.75;
  const ox = 500 - 90 * scale;
  const oy = 280 - 128 * scale;
  const pts = [];
  for (let i = 0; i < TRACE_POINTS; i += 1) {
    const p = path.getPointAtLength((i / (TRACE_POINTS - 1)) * len);
    pts.push([ox + p.x * scale, oy + p.y * scale]);
  }
  return pts;
}

let cache = null;

export function getShapes() {
  if (cache) return cache;
  const trace = buildTrace();
  const features = extractFeatures(trace);
  const raw = trace.raw.map((v, i) => [xOf(i), yOf(v)]);
  const filtered = trace.filtered.map((v, i) => [xOf(i), yOf(v)]);
  // Deploy: the trace collapses into the chip's lower half.
  const chipTrace = trace.filtered.map((v, i) => [
    CHIP.x + 34 + (i / (TRACE_POINTS - 1)) * (CHIP.w - 68),
    CHIP.y + CHIP.h - 28 - (v / 2.4) * 44,
  ]);
  cache = {
    trace,
    features,
    shapes: [raw, filtered, filtered, chipTrace, sampleHand()],
  };
  return cache;
}

export const toPathD = (pts) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

export const lerpShape = (a, b, m) => {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i += 1) {
    // left-to-right wipe: points further along the path morph slightly later
    const k = Math.min(1, Math.max(0, m * 1.5 - (i / a.length) * 0.5));
    const e = k * k * (3 - 2 * k);
    out[i] = [a[i][0] + (b[i][0] - a[i][0]) * e, a[i][1] + (b[i][1] - a[i][1]) * e];
  }
  return out;
};

// Overlay opacity for layer `layer` (0..4) while stage `idx` is current and
// its entry transition is `m` (0..1).
export const layerOpacity = (layer, idx, m) => {
  if (idx === layer) return m;
  if (idx === layer + 1) return 1 - m;
  return 0;
};
