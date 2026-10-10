import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = '01ABCDEFXYZ#$%&*/\\';

// `once`-guarded instances mark themselves here on completion — module
// scope, so it survives a remount (a re-render that swaps this component
// out and back in via a key change, or a parent conditional flipping off
// and on) within the same page session. Without this, a remount would
// replay the full scramble on text that had already resolved, which is
// exactly the "still scrambling" look a one-shot boot effect shouldn't
// have after its first run.
const onceSeen = new Set();

/**
 * Telemetry-style decrypt effect: scrambles through random glyphs before
 * resolving to `text`, character by character, left to right. Used for
 * channel marks / HUD labels — kept intentionally short/cheap (no GSAP
 * dependency) since it's a lot of instances on one page.
 *
 * `trigger`: when false, renders `text` plain and never animates (used to
 * gate the effect behind IntersectionObserver / prefers-reduced-motion from
 * the parent, matching every other reveal on this page).
 *
 * `once`: when true, plays the scramble at most once per `text` for the
 * life of the page — a second mount (or a re-trigger) renders the resolved
 * text immediately instead of replaying it. For a "first boot only, never
 * on scroll/resize" effect like the hero HUD's NOMINAL readout.
 */
export default function DecryptedText({
  text,
  trigger = true,
  speed = 28,
  className,
  as: Tag = 'span',
  once = false,
}) {
  const alreadyPlayed = once && onceSeen.has(text);
  const [display, setDisplay] = useState(text);
  const startedRef = useRef(alreadyPlayed);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!trigger || reducedRef.current || startedRef.current) return undefined;
    startedRef.current = true;

    // Same nominal total this always used (3 ticks/character at `speed`ms
    // each) — but driven by ELAPSED REAL TIME against that target via rAF,
    // not a fixed tick counter via setInterval. That distinction matters
    // here: the hero mounts this right as a multi-hundred-KB R3F chunk
    // (three/fiber/drei/postprocessing) is being fetched/parsed/executed
    // on the same main thread, which can legitimately block it for
    // seconds. A tick-counted setInterval has no way to "catch up" —
    // each delayed/coalesced tick still only advances one character, so
    // contention that skips ticks just pushes the WHOLE animation later,
    // and it was caught still scrambling many seconds after boot (verified
    // directly: ~8.6s to resolve in a contended run, not the ~460ms the
    // tick math implied). Computing revealCount from elapsed/duration on
    // whatever frame actually gets to run self-corrects instead: the very
    // next frame that runs past the target duration snaps straight to the
    // fully resolved text, so it can only ever be visibly scrambled for at
    // most `duration` real milliseconds regardless of how much the main
    // thread was blocked in between.
    const duration = text.length * 3 * speed;
    const startedAt = performance.now();
    let rafId;

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= duration) {
        setDisplay(text);
        if (once) onceSeen.add(text);
        return;
      }
      const revealCount = Math.floor((elapsed / duration) * text.length);
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
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [trigger, text, speed, once]);

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
