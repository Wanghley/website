import React, { useEffect, useRef, useState } from 'react';

/**
 * Terminal-style type-in/delete word cycler — sibling to DecryptedText, same
 * "always fully opaque, never fading" philosophy. The hero's previous word
 * cycler crossfaded + blurred between words via framer-motion, which meant
 * a real stretch of every rotation was rendered at partial opacity; that's
 * what read as "nearly invisible" against the void background. A typewriter
 * has no such state — every character on screen is either fully there or
 * not there yet, so there's nothing to fix at the color level once the
 * fade is gone.
 *
 * Under prefers-reduced-motion, renders the first word statically and never
 * advances — matches every other reduced-motion path in this component.
 */
export default function TypeCycle({
  words,
  className,
  cursorClassName,
  typeSpeed = 55,
  deleteSpeed = 28,
  holdMs = 1400,
  pauseMs = 400,
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | holding | deleting | pausing
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedRef.current) setCharCount(words[0]?.length ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reducedRef.current) return undefined;
    const current = words[wordIndex] || '';
    let timeoutId;

    if (phase === 'typing') {
      timeoutId =
        charCount < current.length
          ? setTimeout(() => setCharCount((c) => c + 1), typeSpeed)
          : setTimeout(() => setPhase('deleting'), holdMs);
    } else if (phase === 'deleting') {
      timeoutId =
        charCount > 0
          ? setTimeout(() => setCharCount((c) => c - 1), deleteSpeed)
          : setTimeout(() => {
              setWordIndex((i) => (i + 1) % words.length);
              setPhase('typing');
            }, pauseMs);
    }

    return () => clearTimeout(timeoutId);
  }, [phase, charCount, wordIndex, words, typeSpeed, deleteSpeed, holdMs, pauseMs]);

  const current = words[wordIndex] || '';
  const display = reducedRef.current ? current : current.slice(0, charCount);

  return (
    <span className={className} aria-label={`I build ${current}`}>
      <span aria-hidden="true">{display}</span>
      <span className={cursorClassName} aria-hidden="true" />
    </span>
  );
}
