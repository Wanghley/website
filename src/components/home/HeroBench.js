import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import useCanRender3D from '../../hooks/useCanRender3D';
import {
  benchState,
  CLASSIFY_AT,
  CLASSIFY_LABEL,
  LOOP_SECONDS,
  pfFromProximity,
  proximityAtLoop,
  smoothstep,
} from '../../lib/benchState';
import BENCH_ASSET from '../../data/benchAsset';
import './css/HeroBench.css';

// The bench scene (three + fiber + drei) is its own chunk, fetched only
// after first paint and only on devices that can run it.
const BenchScene = lazy(() => import('./bench/BenchScene'));

const MOBILE_MAX = 767;

function useMode(reducedMotion) {
  const can3D = useCanRender3D();
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_MAX : false
  );
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth <= MOBILE_MAX);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  if (reducedMotion) return 'still';
  if (narrow) return 'video';
  return can3D ? 'live' : 'still';
}

// Live pF readout: the number the whole hero is about. Written straight to
// the DOM every frame from benchState (never React state).
export function SenseValue({ className }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const tick = () => {
      if (ref.current) ref.current.textContent = pfFromProximity(benchState.p).toFixed(2);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref} className={className}>0.18</span>;
}

export default function HeroBench({ className = '', reducedMotion }) {
  const mode = useMode(reducedMotion);
  const boxRef = useRef(null);
  const labelRef = useRef(null);
  const videoRef = useRef(null);
  const [mounted3D, setMounted3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  // Defer the 3D chunk until after first paint so text is the LCP.
  useEffect(() => {
    if (mode !== 'live') return undefined;
    const go = () => setMounted3D(true);
    const id = 'requestIdleCallback' in window
      ? window.requestIdleCallback(go, { timeout: 600 })
      : window.setTimeout(go, 200);
    return () => ('cancelIdleCallback' in window ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, [mode]);

  // Pause everything when off-screen or the tab is hidden.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const vis = () => { if (document.hidden) setVisible(false); };
    document.addEventListener('visibilitychange', vis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vis); };
  }, []);

  // Pointer -> proximity to the real pad position (live mode, fine pointer).
  useEffect(() => {
    if (mode !== 'live' || coarse) return undefined;
    const move = (e) => {
      const el = boxRef.current;
      if (!el || !benchState.pad.ready) return;
      const r = el.getBoundingClientRect();
      const sx = r.left + benchState.pad.x * r.width;
      const sy = r.top + benchState.pad.y * r.height;
      const maxDist = Math.hypot(window.innerWidth, window.innerHeight) * 0.28;
      const raw = Math.min(1, Math.max(0, 1 - Math.hypot(e.clientX - sx, e.clientY - sy) / maxDist));
      benchState.pTarget = 1 - (1 - raw) ** 2;
      benchState.lookTargetX = (e.clientX / window.innerWidth) * 2 - 1;
      benchState.lookTargetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const leave = () => { benchState.pTarget = 0; benchState.lookTargetX = 0; benchState.lookTargetY = 0; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
      leave();
    };
  }, [mode, coarse]);

  // Still: the energised end-state. Video: proximity follows the loop.
  useEffect(() => {
    if (mode === 'still') { benchState.p = 1; return undefined; }
    if (mode !== 'video') return undefined;
    let raf;
    const tick = () => {
      const v = videoRef.current;
      if (v && !v.paused) benchState.p = proximityAtLoop(v.currentTime % LOOP_SECONDS);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (visible) v.play().catch(() => {}); else v.pause();
  }, [visible, mode]);

  // Classify label: sits on the MCU, appears once the chain is energised.
  useEffect(() => {
    let raf;
    const tick = () => {
      const el = labelRef.current;
      if (el) {
        const pos = mode === 'live' && benchState.mcu.ready ? benchState.mcu : BENCH_ASSET.mcu;
        el.style.left = `${(pos.x * 100).toFixed(2)}%`;
        el.style.top = `${(pos.y * 100).toFixed(2)}%`;
        el.style.opacity = smoothstep(CLASSIFY_AT - 0.06, CLASSIFY_AT, benchState.p).toFixed(3);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const live = mode === 'live' && mounted3D;
  const poster = `${BENCH_ASSET.base}.webp`;

  return (
    <div
      ref={boxRef}
      className={`hero-bench hero-bench--${mode}${ready ? ' is-ready' : ''} ${className}`}
      style={{ '--bench-aspect': BENCH_ASSET.width / BENCH_ASSET.height }}
      role="img"
      aria-label="A circuit board with a capacitive sensing pad and a figure of Wanghley standing on it. As the cursor nears the copper pad, the board's capacitance reading rises and the signal is classified as a hand."
    >
      {mode === 'still' && (
        <picture>
          <source srcSet={`${BENCH_ASSET.base}.avif`} type="image/avif" />
          <img
            className="hero-bench__still"
            src={poster}
            width={BENCH_ASSET.width}
            height={BENCH_ASSET.height}
            alt=""
            decoding="async"
            fetchpriority="high"
            onLoad={() => setReady(true)}
          />
        </picture>
      )}

      {mode === 'video' && (
        <video
          ref={videoRef}
          className="hero-bench__still"
          width={BENCH_ASSET.width}
          height={BENCH_ASSET.height}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onLoadedData={() => setReady(true)}
        >
          <source src={`${BENCH_ASSET.base}-loop.webm`} type="video/webm" />
          <source src={`${BENCH_ASSET.base}-loop.mp4`} type="video/mp4" />
        </video>
      )}

      {live && (
        <div className="hero-bench__canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <BenchScene
              active={visible}
              autoLoop={coarse}
              shadows
              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
      )}

      <p ref={labelRef} className="hero-bench__label" aria-hidden="true">
        {CLASSIFY_LABEL}
      </p>
    </div>
  );
}
