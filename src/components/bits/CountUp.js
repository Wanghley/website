import React, { useEffect, useRef, useState } from 'react';

/**
 * rAF cubic-out count-up, ported from GambiarraImpact.js's StatValue so the
 * Identity stat cards get the same battle-tested easing/formatting instead
 * of a second implementation.
 *
 * `format(value)` receives the *current* eased number each frame (already
 * rounded is not assumed — callers round as needed) and returns the string
 * to render. `run` gates the animation start (pair with an IntersectionObserver
 * so it plays once, the first time the card is visible).
 */
export default function CountUp({
  target,
  format = (v) => String(Math.round(v)),
  finalText,
  run = true,
  duration = 1200,
  reduced = false,
  className,
}) {
  const [display, setDisplay] = useState(reduced ? finalText ?? format(target) : format(0));
  const startedRef = useRef(false);

  useEffect(() => {
    if (!run || reduced || startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // cubic-out
    let raf;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = ease(t);
      setDisplay(format(eased * target));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(finalText ?? format(target));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, reduced, target, duration, format, finalText]);

  return (
    <span className={`count-up ${className ?? ''}`.trim()} aria-label={finalText ?? format(target)}>
      {display}
    </span>
  );
}
