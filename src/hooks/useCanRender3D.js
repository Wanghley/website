import { useEffect, useState } from 'react';

/**
 * Gate for anything expensive: the R3F ambient shader canvas, heavy GSAP
 * timelines, etc. Mirrors the gating already used by the legacy Hero.js
 * three.js scene, centralized so every consumer agrees on the same rules.
 *
 * Returns `false` (skip the expensive path) when any of:
 *  - the user has requested reduced motion
 *  - the device reports < 4GB RAM (navigator.deviceMemory)
 *  - the device reports < 4 logical cores (navigator.hardwareConcurrency)
 *  - it's a small-viewport touch device (coarse pointer + width < 768px)
 *  - a WebGL context can't actually be created
 *
 * Any signal not exposed by the browser is treated as "unknown" and does
 * NOT disqualify — we only downgrade on explicit low-end signals.
 */
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

function evaluate({ requireWebGL = true } = {}) {
  if (typeof window === 'undefined') return false;

  const reducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (reducedMotion) return false;

  const lowMemory =
    typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4;
  if (lowMemory) return false;

  const lowCores =
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency < 4;
  if (lowCores) return false;

  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
  const isSmallViewport = window.innerWidth < 768;
  if (isCoarsePointer && isSmallViewport) return false;

  if (requireWebGL && !detectWebGL()) return false;

  return true;
}

function useGate(options) {
  const [canRender, setCanRender] = useState(() => evaluate(options));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setCanRender(evaluate(options));
    mq.addEventListener('change', handler);
    // Viewport can cross the 768px threshold on rotate/resize.
    window.addEventListener('resize', handler);
    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('resize', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canRender;
}

export default function useCanRender3D() {
  return useGate({ requireWebGL: true });
}

/**
 * Same low-end/reduced-motion signals as useCanRender3D(), minus the WebGL
 * probe — for Canvas2D consumers (the skill-field force graph) that don't
 * need a WebGL context and shouldn't be disqualified by its absence.
 */
export function useCanAnimateCanvas() {
  return useGate({ requireWebGL: false });
}
