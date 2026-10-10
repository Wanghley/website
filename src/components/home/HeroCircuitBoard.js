import React, { Suspense, lazy, useEffect, useState } from 'react';
import useCanRender3D from '../../hooks/useCanRender3D';
import CircuitBoardScene from './CircuitBoardScene';
import './css/HeroCircuitBoard.css';

// The R3F chunk (three + fiber + drei + postprocessing) never touches the
// main bundle or a low-end visitor's network — only fetched once
// useCanRender3D() clears (same reduced-motion/device-memory/core-count/
// coarse-touch/WebGL gate already built for the old ambient shader, see
// hooks/useCanRender3D.js). Everyone else — reduced-motion, low-end
// desktops, and small-viewport touch devices, which already covers mobile
// — gets the SVG/CSS board (CircuitBoardScene.js): it's not a diagram-
// quality downgrade of a "real" experience, it's the same interaction
// model that was independently built and verified working (proximity,
// pulses, callouts, boot sequence) before this pass added the R3F
// version, so it's a fully-featured fallback rather than a static image.
const CircuitBoardR3F = lazy(() => import('./circuit3d/CircuitBoardR3F'));

const TABLET_BREAKPOINT = 1024; // matches HeroChamber.css's own breakpoint
const MOBILE_BREAKPOINT = 768; // matches useCanRender3D.js's own threshold

function useViewportWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : TABLET_BREAKPOINT
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export default function HeroCircuitBoard({ className = '', rootRef, sensorRef, reducedMotion }) {
  const canRender3D = useCanRender3D();
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const isTablet = viewportWidth < TABLET_BREAKPOINT;
  // Fades this subtree in on ITS OWN readiness (this component having
  // mounted, meaning the R3F chunk already resolved) rather than the
  // hero's unrelated boot-telemetry timer (`booted`, ~900ms) — that timer
  // has nothing to do with when the 3D chunk/Canvas is actually ready, and
  // gating opacity on it was the actual cause of a blank-looking hero on a
  // cold load (see HeroChamber.js's contentContainer for the other half of
  // that fix). One rAF so the opacity transition still has something to
  // transition from.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
      performance.mark('hero-board-ready');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Below 768px: no board at all, live OR SVG — a static composite image
  // (see scripts/build-hero-composite.js) of the finished board+head at
  // its "near" state. useCanRender3D() already refuses the R3F path here
  // (narrowDisqualifies, hooks/useCanRender3D.js), but the SVG fallback is
  // also a full interactive scene wired to a pointermove handler that
  // never fires meaningfully on touch — shipping it here would just be a
  // second, quieter version of the "live scene on a phone" bug this pass
  // exists to fix. sensorRef is deliberately left unbound: the hero's
  // proximity calc is pointer-driven and already a no-op without a cursor.
  if (isMobile) {
    return (
      <div ref={rootRef} className={`hero-chamber__composite-wrap${ready ? ' is-ready' : ''} ${className}`}>
        <img
          className="hero-chamber__composite"
          src="/hero/mobile-composite.webp"
          width="800"
          height="500"
          alt=""
          decoding="async"
          fetchpriority="high"
          onLoad={() => performance.mark('hero-board-ready')}
        />
        {/* Bottom gradient fade into the page background so the banner
            doesn't end in a hard line — a sibling div, not a ::after on the
            <img> itself, since generated content doesn't apply to replaced
            elements. */}
        <div className="hero-chamber__composite-fade" aria-hidden="true" />
      </div>
    );
  }

  if (!canRender3D) {
    return (
      <CircuitBoardScene className={className} rootRef={rootRef} sensorRef={sensorRef} reducedMotion={reducedMotion} />
    );
  }

  return (
    <div ref={rootRef} className={`hero-circuit-r3f${ready ? ' is-ready' : ''} ${className}`}>
      {/* Invisible anchor at the sensor pad's approximate on-screen
          position for this camera framing — HeroChamber's proximity
          calc reads getBoundingClientRect() off whatever sensorRef
          points at, SVG <g> or this marker, identically. */}
      <div ref={sensorRef} className="hero-circuit-r3f__sensor-anchor" aria-hidden="true" />
      {/* SVG board as the Suspense fallback, not `null` — something
          correct is on screen immediately while the three/drei/
          postprocessing chunk downloads, instead of a blank gap. It's
          already fully interactive on its own (see CircuitBoardScene.js),
          not a static placeholder.
          Deliberately NOT given rootRef/sensorRef here: both are already
          bound to stable siblings above (this outer div, the anchor
          below) for the whole lifetime of this component. Binding the
          same ref objects to this fallback's own internal elements too
          would have them briefly stolen away and then, on the swap to the
          real child once the chunk resolves, left null — nothing in this
          subtree would re-attach them afterward since the anchor/wrapper
          above aren't part of what re-renders when Suspense resolves. */}
      <Suspense fallback={<CircuitBoardScene className={className} reducedMotion={reducedMotion} />}>
        <CircuitBoardR3F reducedMotion={reducedMotion} isTablet={isTablet} />
      </Suspense>
    </div>
  );
}
