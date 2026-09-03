import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = '01ABCDEFXYZ#$%&*/\\';

/**
 * Telemetry-style decrypt effect: scrambles through random glyphs before
 * resolving to `text`, character by character, left to right. Used for
 * channel marks / HUD labels — kept intentionally short/cheap (no GSAP
 * dependency) since it's a lot of instances on one page.
 *
 * `trigger`: when false, renders `text` plain and never animates (used to
 * gate the effect behind IntersectionObserver / prefers-reduced-motion from
 * the parent, matching every other reveal on this page).
 */
export default function DecryptedText({
  text,
  trigger = true,
  speed = 28,
  className,
  as: Tag = 'span',
}) {
  const [display, setDisplay] = useState(text);
  const startedRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!trigger || reducedRef.current || startedRef.current) return undefined;
    startedRef.current = true;

    let frame = 0;
    const totalFrames = text.length * 3;
    let intervalId;

    intervalId = setInterval(() => {
      frame += 1;
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      setDisplay(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            if (i < revealCount) return text[i];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [trigger, text, speed]);

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
