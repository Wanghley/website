import React, { useCallback, useEffect, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap, ScrollTrigger } from './gsap';
import { writeScrollSignal, startScrollSignalFallback, stopScrollSignalFallback } from './scrollSignal';

// ─── Lenis ↔ ScrollTrigger bridge ──────────────────────────────────────────
// Lenis owns the scroll loop (autoRaf: false below); gsap.ticker drives it so
// GSAP animations and Lenis's smoothing stay on the exact same frame clock.
// Without `lenis.on('scroll', ScrollTrigger.update)`, pinned/scrubbed
// ScrollTriggers silently drift out of sync with the smoothed scroll position.
function LenisScrollTriggerBridge() {
  const lenis = useLenis((instance) => {
    ScrollTrigger.update();
    // The shader (AmbientShader's useFrame) and the skill-field canvas tick
    // both live outside this React tree (a separate R3F reconciler, and a
    // plain gsap.ticker callback respectively) — scrollSignal is how they
    // read live scroll velocity without a context bridge. See lib/scrollSignal.js.
    writeScrollSignal(instance);
  });

  useEffect(() => {
    if (!lenis) return undefined;
    const update = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [lenis]);

  return null;
}

/**
 * Mounts a global Lenis instance for the whole app (root: true → no wrapper
 * DOM, just intercepts window scroll). Skipped entirely under
 * prefers-reduced-motion — the design system already zeroes all motion
 * tokens under that query, and native scroll + ScrollTrigger's built-in
 * scroll-event fallback keep everything else working unsmoothed.
 */
export default function LenisRoot({ children }) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setEnabled(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // When Lenis isn't mounted, scrollSignal still needs a live writer — a
  // native-scroll fallback — so reactive consumers read honest (settling
  // to 0) values instead of a stale velocity from before reduced-motion
  // was toggled on.
  useEffect(() => {
    if (enabled) {
      stopScrollSignalFallback();
      return undefined;
    }
    startScrollSignalFallback();
    return () => stopScrollSignalFallback();
  }, [enabled]);

  if (!enabled) {
    return children;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, autoRaf: false }}>
      <LenisScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}

export { useLenis };

/**
 * Smooth-scroll to a section/element, Lenis-aware. Falls back to native
 * `scrollIntoView` when Lenis isn't mounted (reduced motion, or before the
 * instance initializes on first paint) so anchor links always work.
 *
 * `offset` defaults to -96 to clear the fixed navbar (--ds-navbar-height).
 */
export function useScrollToSection() {
  const lenis = useLenis();

  return useCallback(
    (target, options = {}) => {
      const el =
        typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      if (lenis) {
        lenis.scrollTo(el, { offset: -96, duration: 1.2, ...options });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [lenis]
  );
}
