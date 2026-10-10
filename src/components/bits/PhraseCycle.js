import React, { useEffect, useRef, useState } from 'react';

/**
 * Replaces the typewriter (bits/TypeCycle.js) for the hero tagline — that
 * mechanic left a truncated phrase on screen most of the time ("I build
 * circuits, from" mid-type reads as broken, not as an animation). This
 * always shows a COMPLETE phrase: swap every `holdMs`, a fast crossfade
 * (fade + 8px rise/drop) between the outgoing and incoming phrase, never a
 * partial-word state at any point in the transition.
 *
 * TypeCycle.js itself isn't deleted — still a reasonable component, just
 * not the right fit for a headline someone reads once and moves past.
 */
export default function PhraseCycle({
  words,
  className,
  cursorClassName,
  holdMs = 3500,
  transitionMs = 300,
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reducedRef.current) return undefined;
    if (phase === 'in') {
      const id = setTimeout(() => setPhase('out'), holdMs);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setPhase('in');
    }, transitionMs);
    return () => clearTimeout(id);
  }, [phase, holdMs, transitionMs, words.length]);

  const current = words[index] || '';

  return (
    <span className="phrase-cycle" aria-label={`I build ${current}`}>
      <span
        className={`${className} phrase-cycle__word${phase === 'out' ? ' is-leaving' : ' is-entering'}`}
        style={{ transitionDuration: `${transitionMs}ms` }}
        aria-hidden="true"
      >
        {current}
      </span>
      {/* Cursor sits after a always-complete phrase — a static punctuation
          mark, not an implication that typing is in progress. */}
      <span className={cursorClassName} aria-hidden="true" />
    </span>
  );
}
