import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from '../../lib/gsap';

/**
 * Splits `text` into per-character spans and reveals them in. Pure GSAP (no
 * SplitText plugin — that's a GSAP Club plugin we don't have; this
 * hand-rolls the same effect with a plain string split, which is all a
 * single-line heading needs).
 *
 * Two modes, via the `mode` prop:
 *  - "glow" (default): chars fade/rise in with a text-shadow glow flash.
 *  - "mask": each char sits in its own overflow:hidden clip box and slides
 *    up from below it (yPercent 110 → 0) — for oversized display type where
 *    a glow flash would be lost against a busy background.
 *
 * Under prefers-reduced-motion the timeline is skipped and every character
 * is set to its end state immediately — content is never invisible.
 */
export default function SplitText({
  text,
  as: Tag = 'span',
  className,
  charClassName,
  delay = 0,
  stagger = 0.035,
  glowColor = '#3AAFF1',
  mode = 'glow',
  once = true,
}) {
  const containerRef = useRef(null);
  const chars = useMemo(() => text.split(''), [text]);
  const isMask = mode === 'mask';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = containerRef.current?.querySelectorAll('[data-split-char]');
      if (!els || !els.length) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isMask) {
        const inner = containerRef.current.querySelectorAll('[data-split-inner]');
        if (reduced) {
          gsap.set(inner, { yPercent: 0 });
          return;
        }
        gsap.set(inner, { yPercent: 110 });
        gsap.to(inner, {
          yPercent: 0,
          duration: 0.85,
          ease: 'expo.out',
          stagger,
          delay,
        });
        return;
      }

      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0, textShadow: '0 0 0px transparent' });
        return;
      }

      gsap.set(els, { opacity: 0, y: '0.6em', textShadow: `0 0 0px ${glowColor}` });
      gsap
        .timeline({ delay })
        .to(els, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          stagger,
        })
        .to(
          els,
          {
            textShadow: `0 0 18px ${glowColor}`,
            duration: 0.25,
            ease: 'power1.out',
            stagger,
            yoyo: true,
            repeat: 1,
          },
          `<0.1`
        );
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, once, isMask]);

  if (isMask) {
    return (
      <Tag ref={containerRef} className={className} aria-label={text}>
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            data-split-char
            className={charClassName}
            style={{ display: 'inline-block', overflow: 'hidden' }}
            aria-hidden="true"
          >
            <span
              data-split-inner
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              {char}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={containerRef} className={className} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={`${char}-${i}`}
          data-split-char
          className={charClassName}
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          aria-hidden="true"
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </Tag>
  );
}
