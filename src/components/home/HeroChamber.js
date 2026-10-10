import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePostHog } from '@posthog/react';
import { gsap } from '../../lib/gsap';
import SplitText from '../bits/SplitText';
import DecryptedText from '../bits/DecryptedText';
import PhraseCycle from '../bits/PhraseCycle';
import OscilloscopeReadout from '../bits/OscilloscopeReadout';
import Magnet from '../bits/Magnet';
import { useScrollToSection } from '../../lib/LenisRoot';
import HeroCircuitBoard from './HeroCircuitBoard';
import { proximitySignal } from '../../lib/proximitySignal';
import { sensorSignal } from '../../lib/sensorSignal';
import './css/HeroChamber.css';

// The hero itself demonstrates non-contact biosensing rather than just
// describing it — see CircuitBoardScene.js. This list stays short and
// concrete, no generic industry buzzwords.
const WORDS = [
  'non-contact biosensing',
  'AI that fits on a microcontroller',
  'wearables that read the body',
  'circuits, from schematic to silicon',
];

const BOOT_SESSION_KEY = 'hero-board-booted';

// Per-frame damping rate for the proximity/tilt/cursor lerp below — applied
// as `current += (target - current) * LERP_RATE` every rAF tick, not a
// fixed-duration tween, so it self-corrects smoothly regardless of frame
// timing. 0.1 lands in the brief's specified 0.08–0.12 range.
const LERP_RATE = 0.1;

const contentContainer = {
  hidden: {},
  // delayChildren was 1.0 with staggerChildren 0.09 — across 8 children at
  // 0.6s each, the last item didn't settle until ~2.3s in, which read as a
  // blank hero on a cold load (nothing 3D-related was blocking; this
  // animation timing was the actual cause). Headline/tagline/stats/CTAs/HUD
  // now start almost immediately instead of waiting on an arbitrary delay.
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const contentItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function HeroChamber() {
  const posthog = usePostHog();
  const scrollToSection = useScrollToSection();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [booted, setBooted] = useState(false);
  const sectionRef = useRef(null);
  const boardRef = useRef(null);
  const sensorRef = useRef(null);
  const cursorRef = useRef(null);

  // First-paint diagnostic, cheap and standard (no reporting attached —
  // just marks a future RUM/analytics pass could read via
  // performance.getEntriesByName). Content itself isn't gated on anything
  // async; this mark exists to measure that claim, not to delay it.
  useEffect(() => {
    performance.mark('hero-content-mounted');
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Boot sequence gate — plays once per browser session (sessionStorage,
  // not just component state, so it doesn't replay on client-side route
  // changes back to "/"). Reduced-motion skips straight to the booted
  // end-state, matching every other entrance animation in this file.
  useEffect(() => {
    if (prefersReducedMotion) {
      setBooted(true);
      return undefined;
    }
    if (sessionStorage.getItem(BOOT_SESSION_KEY)) {
      setBooted(true);
      return undefined;
    }
    const id = setTimeout(() => {
      setBooted(true);
      sessionStorage.setItem(BOOT_SESSION_KEY, '1');
    }, 900);
    return () => clearTimeout(id);
  }, [prefersReducedMotion]);

  // Pointer-driven light-leak + board proximity/tilt.
  //
  // Rearchitected from "write on every pointermove event" to "pointermove
  // just updates a target; a persistent rAF loop lerps toward it" — two
  // real bugs in the old version, not one:
  //
  //   1. The listener was bound to `sectionRef.current` (the whole hero,
  //      text column included) — bubbling was never the issue. The actual
  //      bug was `sensorRef`'s DOM anchor: HeroCircuitBoard.js binds it to
  //      a 1x1px div pinned at a hardcoded left:30%/top:56% of the collage
  //      box (see hero-circuit-r3f__sensor-anchor in
  //      css/HeroCircuitBoard.css), while the REAL sensor pad's on-screen
  //      position is whatever ResponsiveOrthoCamera's width-derived zoom +
  //      the collage's own aspect ratio put it at. Any drift between those
  //      two — which the viewport-height-fit change below deliberately
  //      introduces — desyncs proximity from the real pad, and with
  //      maxDist a flat 460px in window-absolute pixels, a 100-150px
  //      desync visibly dims/darkens the board in the wrong place: reads
  //      as "freezes then snaps." Fixed by reading the sensor's REAL
  //      projected position from lib/sensorSignal.js (written every R3F
  //      frame by SensorElectrode.js) instead of a DOM rect, falling back
  //      to the old sensorRef-center approach only when nothing is
  //      actively publishing (SVG board / reduced motion / R3F chunk not
  //      yet mounted).
  //   2. Nothing was ever lerped — every consumer got the raw instantaneous
  //      value. Combined with (1), a proximity that's live-but-wrong can
  //      look like it "sticks" in a region where the (mistracked) distance
  //      briefly stops changing much. Fixed by separating "what pointermove
  //      computes" (a target) from "what gets written" (a value lerped
  //      toward that target every frame, below).
  //
  // proximitySignal (lib/proximitySignal.js) also now carries nx/ny — the
  // lerped, WINDOW-normalized cursor direction — because CharacterHead.js's
  // yaw/pitch follow used to read R3F's own state.pointer (canvas-local;
  // frozen the instant the cursor left the canvas, which is the literal
  // "head snapped forward and stopped tracking" bug). It now reads the same
  // signal every other consumer does.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;

    const targetRef = { current: { proximity: 0, nx: 0, ny: 0, leakX: 0, leakY: 0, leakO: 0 } };
    const currentRef = { current: { proximity: 0, nx: 0, ny: 0, leakX: 0, leakY: 0, leakO: 0 } };

    const handlePointerMove = (e) => {
      const rect = section.getBoundingClientRect();
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      // Real projected sensor position when the R3F scene is live; the old
      // fixed-percentage DOM anchor otherwise (SVG board / reduced motion /
      // R3F chunk still loading — sensorSignal.ready is false in all three).
      let sx = null;
      let sy = null;
      if (sensorSignal.ready && boardRef.current) {
        const br = boardRef.current.getBoundingClientRect();
        sx = br.left + sensorSignal.x;
        sy = br.top + sensorSignal.y;
      } else if (sensorRef.current) {
        const sr = sensorRef.current.getBoundingClientRect();
        sx = sr.left + sr.width / 2;
        sy = sr.top + sr.height / 2;
      }

      let proximity = 0;
      if (sx != null) {
        const dist = Math.hypot(e.clientX - sx, e.clientY - sy);
        // Viewport-diagonal-normalized, not a flat px value — a flat 460px
        // (the old constant) meant the falloff radius was a different
        // FRACTION of the screen on every monitor size. 0.28 matches the
        // old constant's feel at a common ~1440x900 diagonal (~1697px *
        // 0.28 ≈ 475px) and now scales with the actual viewport.
        const maxDist = Math.hypot(window.innerWidth, window.innerHeight) * 0.28;
        const raw = Math.min(1, Math.max(0, 1 - dist / maxDist));
        // Ease-out: snappy right at the pad, gentle further out — a linear
        // falloff made the idle→active delta feel too flat across most of
        // the approach distance.
        proximity = 1 - (1 - raw) ** 2;
      }

      targetRef.current = {
        proximity,
        nx,
        ny,
        leakX: e.clientX - rect.left,
        leakY: e.clientY - rect.top,
        leakO: 1,
      };
    };

    const handlePointerLeave = () => {
      // Eased to idle by the rAF loop below over ~1.2s, not snapped.
      targetRef.current = { ...targetRef.current, proximity: 0, nx: 0, ny: 0, leakO: 0 };
    };

    let rafId;
    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      c.proximity += (t.proximity - c.proximity) * LERP_RATE;
      c.nx += (t.nx - c.nx) * LERP_RATE;
      c.ny += (t.ny - c.ny) * LERP_RATE;
      c.leakX += (t.leakX - c.leakX) * LERP_RATE;
      c.leakY += (t.leakY - c.leakY) * LERP_RATE;
      c.leakO += (t.leakO - c.leakO) * LERP_RATE;

      section.style.setProperty('--leak-x', `${c.leakX.toFixed(1)}px`);
      section.style.setProperty('--leak-y', `${c.leakY.toFixed(1)}px`);
      section.style.setProperty('--leak-o', c.leakO.toFixed(3));
      section.style.setProperty('--proximity', c.proximity.toFixed(3));
      proximitySignal.value = c.proximity;
      proximitySignal.nx = c.nx;
      proximitySignal.ny = c.ny;

      if (boardRef.current) {
        boardRef.current.style.setProperty('--tilt-x', `${(c.nx * 4).toFixed(2)}deg`);
        boardRef.current.style.setProperty('--tilt-y', `${(-c.ny * 4).toFixed(2)}deg`);
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate3d(${c.leakX.toFixed(1)}px, ${c.leakY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(1 + c.proximity * 0.6).toFixed(2)})`;
        cursorRef.current.style.opacity = c.leakO.toFixed(3);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // window, not the section/canvas — this is the fix for "tracking stops
    // over the text column": a listener scoped to any element inside the
    // page only ever sees events that land on it (or bubble through it),
    // and the R3F canvas in particular has its own internal pointer
    // handling that this must not depend on. mouseleave on <html> (not the
    // section) fires precisely when the cursor exits the browser viewport
    // — unlike mouseout/pointerout it doesn't bubble, so it can't misfire
    // from moving between child elements.
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [prefersReducedMotion]);

  // Scroll-tied board recede + headline scroll-out tween. One scrubbed
  // tween for the board (scale/rotate/drift back as the next section moves
  // in), not a scattered set of effects, per spec.
  //
  // Deliberately does NOT touch opacity: GSAP tweens set their target
  // property via inline style, which permanently outranks any CSS class
  // rule (including .circuit-scene.is-ready's opacity:1) from the moment
  // the tween is created, regardless of scroll position — even at
  // scrollTrigger progress 0, GSAP still writes the property. An earlier
  // version animated opacity here too and it raced the boot fade-in,
  // freezing the board invisible forever (whichever ran first won
  // permanently). Scale + rotate + drift alone read as "receding" without
  // a second system fighting CSS for the same property; the board also
  // just scrolls out of the viewport naturally past this point.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      if (boardRef.current) {
        gsap.to(boardRef.current, {
          scale: 0.82,
          yPercent: -6,
          rotate: -3,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            scrub: true,
            start: 'top top',
            end: 'bottom top',
          },
        });
      }
      gsap.to('.hero-chamber__name-text', {
        letterSpacing: '.06em',
        yPercent: -34,
        opacity: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom 30%',
          scrub: 0.6,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleSeeWork = () => {
    posthog?.capture('home_hero_cta_clicked', { target: 'ventures' });
    scrollToSection('#ventures');
  };

  const handleScrollHint = () => {
    posthog?.capture('home_hero_cta_clicked', { target: 'identity' });
    scrollToSection('#identity');
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="hero-chamber"
      aria-label="Introduction to Wanghley Martins"
    >
      <div className="hero-chamber__backdrop" aria-hidden="true" />
      <div className="hero-chamber__scrim" aria-hidden="true" />
      <div className="light-leak" aria-hidden="true" />
      {!prefersReducedMotion && <div ref={cursorRef} className="hero-chamber__cursor" aria-hidden="true" />}

      <HeroCircuitBoard
        className="hero-chamber__collage"
        rootRef={boardRef}
        sensorRef={sensorRef}
        reducedMotion={prefersReducedMotion}
      />

      <aside className="hero-chamber__meta" aria-hidden="true">
        HOUSTON&nbsp;29.72°N&nbsp;·&nbsp;95.40°W
      </aside>

      <div className="hero-chamber__stage">
        <motion.div
          className="hero-chamber__content"
          variants={contentContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="show"
        >
          {/* HUD moved here from an absolute top-of-viewport rail: it now
              reads as a "chapter header" for the content block instead of
              floating disconnected from it, closing the ~250px dead zone
              that used to sit between the status line and the eyebrow.
              Collapsed to one line — the "STATUS" label and the SUBJ·LOCK
              line (bits/SubjectLock.js, removed) are gone. OscilloscopeReadout
              also swaps to a SRC 0X/08 readout while the hover-head photo
              ring (circuit3d/SourceCaptures.js) is open — see that file. */}
          <motion.div className="hero-chamber__hud" variants={contentItem}>
            <div className="hero-chamber__hud-inner">
              <span className="hero-chamber__hud-seg">
                <span className="hero-chamber__hud-id">CH:00</span>
                <span className="hero-chamber__hud-dash" />
                ORIGIN
              </span>
              <span className="hero-chamber__hud-seg hero-chamber__hud-seg--status">
                <span className="hero-chamber__hud-live">
                  <span className={`telemetry__dot${booted ? '' : ' is-booting'}`} />
                  {booted ? (
                    // once: true — plays exactly once per page session (see
                    // bits/DecryptedText.js). trigger defaults to true, and
                    // this branch only ever mounts once `booted` already is,
                    // so the scramble starts the instant it mounts instead
                    // of waiting on a second, independently-timed flag —
                    // that mismatch was what let a screenshot catch it
                    // mid-run ("NOMINA#").
                    <DecryptedText text="NOMINAL" speed={22} once />
                  ) : (
                    <span>BOOTING</span>
                  )}
                </span>
              </span>
              <OscilloscopeReadout reducedMotion={prefersReducedMotion} />
            </div>
          </motion.div>

          <motion.div className="eyebrow hero-chamber__eyebrow" variants={contentItem}>
            ENGINEER · RESEARCHER · MAKER
          </motion.div>

          <SplitText
            as="h1"
            mode="mask"
            text="WANGHLEY"
            className="hero-chamber__name-text"
            delay={0.55}
          />

          <motion.div className="hero-chamber__cycler" variants={contentItem}>
            <span className="hero-chamber__cycler-lead">I build</span>
            <span className="hero-chamber__cycler-box" aria-live="polite" aria-atomic="true">
              <PhraseCycle
                words={WORDS}
                className="hero-chamber__cycler-word"
                cursorClassName="hero-chamber__cycler-cursor"
              />
            </span>
          </motion.div>

          <motion.p className="hero-chamber__context telemetry" variants={contentItem}>
            <span className="hero-chamber__role-text hero-chamber__role-text--full">
              PhD · Electrical &amp; Computer Engineering · Rice University
            </span>
            <span className="hero-chamber__role-text hero-chamber__role-text--short">
              PhD · ECE · Rice University
            </span>
          </motion.p>

          {/* Fills the stats block's old slot — one sentence, placeholder
              copy per the brief pending the site owner's final wording. */}
          <motion.p className="hero-chamber__bio" variants={contentItem}>
            Building wearable biosensors and the edge AI that runs on them, at Rice.
          </motion.p>

          <motion.div className="hero-chamber__ctas" variants={contentItem}>
            <Magnet
              as={motion.button}
              type="button"
              className="btn btn--primary hero-chamber__cta hero-chamber__cta--sensor"
              onClick={handleSeeWork}
              aria-label="See my work"
            >
              See My Work
              <span className="hero-chamber__cta-arrow">→</span>
            </Magnet>
            <a
              href="/contact"
              className="btn btn--ghost"
              onClick={() => posthog?.capture('home_hero_contact_clicked')}
            >
              Contact
            </a>
          </motion.div>

          {/* In normal flow (was absolutely bottom-anchored) — that fixed
              offset was tuned against the content column's old, shorter
              height; moving the HUD into flow above made the column
              taller, and the CTAs now render low enough to collide with
              a hint pinned a fixed distance from the section's bottom
              edge. In flow, it just always sits right after the CTAs,
              regardless of how tall anything above it gets.
              Icon-only, 40% opacity (see CSS) — the "Scroll to explore"
              label moved to aria-label so the accessible name is
              unchanged. */}
          <motion.button
            type="button"
            className="hero-chamber__hint"
            variants={contentItem}
            onClick={handleScrollHint}
            aria-label="Scroll to explore"
          >
            <span className="hero-chamber__hint-arrow" aria-hidden="true">↓</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
