import React, { useCallback, useEffect, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

/**
 * Mounts a global Lenis instance for the whole app (root: true, so no wrapper
 * DOM, it just intercepts window scroll). Gentle smoothing (lerp 0.1), driven
 * by Lenis's own rAF. Skipped entirely under prefers-reduced-motion: native
 * scroll is used instead.
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

  if (!enabled) return children;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
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
