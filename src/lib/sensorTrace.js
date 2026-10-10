// Simulated capacitive-sensor trace for the signal-chain section.
//
// ILLUSTRATIVE, NOT A RECORDING. There is no captured data yet, so this
// generates a plausible one: a hand approaches the electrode, dwells, and
// withdraws (0.18 pF baseline to 2.14 pF, the same range as the hero's live
// readout), with mains hum, white noise and drift on top. The section labels
// it "illustrative" on screen. Replace `buildTrace()` with a CSV loader the
// day a real capture exists; nothing else in the section needs to change.
// [[PLACEHOLDER: real capacitive-sensor capture (time, pF) CSV]]

export const TRACE_POINTS = 200;
export const TRACE_SECONDS = 3.2;
export const PF_BASE = 0.18;
export const PF_PEAK = 2.14;

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller
function gaussian(rand) {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

// Zero-phase moving average, run twice (a crude low-pass, like the real
// front-end's first filter stage). Edges are clamped, not zero-padded.
export function smooth(values, window = 9, passes = 2) {
  let out = values.slice();
  const half = Math.floor(window / 2);
  for (let p = 0; p < passes; p += 1) {
    const src = out;
    out = src.map((_, i) => {
      let sum = 0;
      let n = 0;
      for (let k = -half; k <= half; k += 1) {
        const j = Math.min(src.length - 1, Math.max(0, i + k));
        sum += src[j];
        n += 1;
      }
      return sum / n;
    });
  }
  return out;
}

export function buildTrace() {
  const rand = mulberry32(1987);
  const t = [];
  const ideal = [];
  const raw = [];
  for (let i = 0; i < TRACE_POINTS; i += 1) {
    const s = (i / (TRACE_POINTS - 1)) * TRACE_SECONDS;
    t.push(s);
    const rise = 1 / (1 + Math.exp(-(s - 0.95) / 0.14));
    const fall = 1 / (1 + Math.exp(-(s - 2.35) / 0.16));
    const level = rise - fall;
    const pf = PF_BASE + (PF_PEAK - PF_BASE) * level * (1 + 0.035 * Math.sin(2 * Math.PI * 1.3 * s));
    ideal.push(pf);
    // mains hum (aliased at this sample rate), white noise, slow drift
    const hum = 0.1 * Math.sin(2 * Math.PI * 9.3 * s + 0.6);
    const noise = 0.11 * gaussian(rand);
    const drift = 0.07 * Math.sin(0.9 * s + 1);
    raw.push(pf + hum + noise + drift);
  }
  // Calibrate so the filtered peak lands exactly on PF_PEAK and the floor on
  // PF_BASE (the same affine map is applied to the raw trace, so they stay
  // consistent with each other and with the hero's 0.18 to 2.14 pF readout).
  const smoothed = smooth(raw);
  const lo = Math.min(...smoothed);
  const hi = Math.max(...smoothed);
  const k = (PF_PEAK - PF_BASE) / (hi - lo);
  const cal = (v) => PF_BASE + (v - lo) * k;
  return { t, raw: raw.map(cal), filtered: smoothed.map(cal) };
}

// Features read off the filtered trace: when the hand arrives, how high the
// field goes, how long it dwells.
export function extractFeatures(trace) {
  const { t, filtered } = trace;
  const threshold = PF_BASE + (PF_PEAK - PF_BASE) * 0.15;
  const onset = filtered.findIndex((v) => v > threshold);
  let offset = filtered.length - 1;
  while (offset > 0 && filtered[offset] < threshold) offset -= 1;
  let peak = 0;
  filtered.forEach((v, i) => { if (v > filtered[peak]) peak = i; });
  return {
    onset: { i: onset, t: t[onset], v: filtered[onset] },
    peak: { i: peak, t: t[peak], v: filtered[peak] },
    offset: { i: offset, t: t[offset], v: filtered[offset] },
    dwell: t[offset] - t[onset],
  };
}
