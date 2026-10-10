import React, { useEffect, useRef } from 'react';
import { proximitySignal } from '../../lib/proximitySignal';
import { sourceCaptureSignal } from '../../lib/sourceCaptureSignal';
import { figureStateSignal } from '../../lib/figureStateSignal';

/**
 * The hero HUD's "live reading" — reads lib/proximitySignal.js (written by
 * HeroChamber's pointermove handler, see HeroChamber.js) on its own rAF
 * loop and writes straight to the DOM (path `d` + text content), same
 * "no React re-render per frame" approach as scrollSignal's consumers
 * elsewhere in this codebase. Decorative: the pF value isn't a real
 * capacitance reading, so it's marked aria-hidden with a plain-language
 * aria-label on the wrapper instead.
 */
export default function OscilloscopeReadout({ reducedMotion }) {
  const pathRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) {
      if (textRef.current) textRef.current.textContent = 'SENSE 0.31 pF';
      if (pathRef.current) pathRef.current.setAttribute('d', 'M0,10 L120,10');
      return undefined;
    }

    let raf;
    const points = new Array(24).fill(0.1);
    const tick = () => {
      const p = proximitySignal.value;
      points.shift();
      const jitter = (Math.random() - 0.5) * 0.06;
      points.push(Math.min(1, Math.max(0, p + jitter)));

      if (pathRef.current) {
        const w = 120;
        const h = 16;
        const step = w / (points.length - 1);
        const d = points
          .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - v * (h - 2) - 1).toFixed(1)}`)
          .join(' ');
        pathRef.current.setAttribute('d', d);
      }
      if (textRef.current) {
        // Swaps to the hover-head photo ring's own readout while it's open
        // (circuit3d/SourceCaptures.js writes sourceCaptureSignal), or to
        // the tenth pass's materialize readout (CharacterHead.js writes
        // figureStateSignal) — same rAF loop, no separate consumer pattern
        // needed either time.
        const isLive = figureStateSignal.state === 'figure';
        textRef.current.classList.toggle('hero-chamber__hud-osc-value--live', isLive);
        if (sourceCaptureSignal.open) {
          const idx = String(sourceCaptureSignal.index + 1).padStart(2, '0');
          const count = String(sourceCaptureSignal.count).padStart(2, '0');
          textRef.current.textContent = `SRC ${idx}/${count}`;
        } else if (figureStateSignal.state === 'materializing' || figureStateSignal.state === 'dissolving') {
          textRef.current.textContent = 'SUBJ · WSM · MATERIALIZING…';
        } else if (isLive) {
          textRef.current.textContent = 'SUBJ · WSM · LIVE';
        } else {
          const pf = (0.18 + p * 2.4 + (Math.random() - 0.5) * 0.03).toFixed(2);
          textRef.current.textContent = `SENSE ${pf} pF`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <span
      className="hero-chamber__hud-osc"
      role="img"
      aria-label="Decorative live sensor visualization"
    >
      <span ref={textRef} className="hero-chamber__hud-osc-value">SENSE 0.00 pF</span>
      <svg className="hero-chamber__hud-osc-wave" viewBox="0 0 120 16" aria-hidden="true" focusable="false">
        <path ref={pathRef} d="M0,10 L120,10" />
      </svg>
    </span>
  );
}
