import React, { useCallback } from 'react';

// Native scrolling. The page used to run Lenis smooth-scroll; it is gone on
// purpose (the scroll should feel like the browser's own). This module keeps
// its old exports so existing imports keep working.
export default function LenisRoot({ children }) {
  return <>{children}</>;
}

export function useLenis() {
  return null;
}

/** Scrolls to a section; honours prefers-reduced-motion. */
export function useScrollToSection() {
  return useCallback((target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);
}
