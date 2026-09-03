// ─── Scroll signal singleton ───────────────────────────────────────────────
// A module-scope mutable object, deliberately NOT React state or context.
//
// Why: R3F's <Canvas> mounts a second, independent React reconciler. Hooks
// like useLenis() only work inside the tree rendered by the *outer*
// reconciler — calling them from a component rendered inside <Canvas> (e.g.
// AmbientShader's <Plane>) returns nothing, because there is no React
// context bridge across that boundary. A plain object read directly inside
// useFrame()/gsap.ticker callbacks sidesteps the problem entirely and avoids
// a React re-render on every scroll frame, which the shader loop and the
// graph-canvas tick don't need anyway — they read the latest value each
// frame regardless of whether React re-rendered in between.
export const scrollSignal = {
  // Normalized 0..1 "how fast is the user scrolling right now" — consumers
  // use this to drive reactive intensity (shader smear, canvas motion) that
  // decays back toward 0 as the user settles.
  velocity: 0,
  // Lenis's own 0..1 scroll progress across the whole page.
  progress: 0,
  // 1 | -1 | 0
  direction: 0,
};

// Empirically chosen so ordinary trackpad/wheel scrolling maps to roughly
// the 0..1 range; genuinely fast flicks clamp at 1 rather than blowing past
// it and making the reactive effects look broken instead of energetic.
const VELOCITY_NORMALIZER = 40;

/**
 * Called from LenisRoot's useLenis() callback, which receives the Lenis
 * instance itself (not an event object) per the Lenis API.
 */
export function writeScrollSignal(lenis) {
  scrollSignal.velocity = Math.min(1, Math.abs(lenis.velocity) / VELOCITY_NORMALIZER);
  scrollSignal.progress = lenis.progress;
  scrollSignal.direction = lenis.direction;
}

let fallbackHandle = null;

/**
 * Covers the reduced-motion path, where LenisRoot renders children bare and
 * no Lenis instance ever exists. Without this, scrollSignal.velocity would
 * stay frozen at whatever it last was (harmless, since consumers also
 * respect reduced-motion independently and skip the reactive path — but the
 * value should still be honest at rest, i.e. 0, rather than stale).
 */
export function startScrollSignalFallback() {
  if (fallbackHandle || typeof window === 'undefined') return;

  let lastY = window.scrollY;
  let lastT = performance.now();

  const onScroll = () => {
    const y = window.scrollY;
    const t = performance.now();
    const dt = Math.max(1, t - lastT);
    const rawVelocity = ((y - lastY) / dt) * 16.6; // approx px/frame at 60fps
    scrollSignal.velocity = Math.min(1, Math.abs(rawVelocity) / VELOCITY_NORMALIZER);
    scrollSignal.direction = y === lastY ? 0 : y > lastY ? 1 : -1;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollSignal.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    lastY = y;
    lastT = t;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  fallbackHandle = onScroll;
}

export function stopScrollSignalFallback() {
  if (!fallbackHandle) return;
  window.removeEventListener('scroll', fallbackHandle);
  fallbackHandle = null;
}
