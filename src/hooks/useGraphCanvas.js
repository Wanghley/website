import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';

/**
 * Canvas2D host for a graphSim.js simulation: DPR-aware sizing, resize +
 * intersection observers, pointer hover/drag hit-testing, and a render loop
 * driven by gsap.ticker (the same frame clock Lenis/ScrollTrigger use — see
 * lib/gsap.js) that REMOVES ITSELF from the ticker once the sim settles and
 * re-adds on any interaction. That self-idling is the single most important
 * perf property here: an ambient force-graph should cost zero CPU at rest.
 *
 * `draw(ctx, sim, { width, height, hoveredId })` does the actual rendering —
 * this hook only owns the canvas lifecycle, sizing, and interaction, so it
 * stays reusable beyond the skill-field graph if needed later.
 */
export default function useGraphCanvas({ canvasRef, sim, draw, enabled = true }) {
  const [hoveredId, setHoveredId] = useState(null);
  const hoveredRef = useRef(null);
  const draggingRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const tickerFnRef = useRef(null);
  const tickerActiveRef = useRef(false);
  const visibleRef = useRef(true);
  const lastTimeRef = useRef(null);

  const ensureTicking = () => {
    if (tickerActiveRef.current || !tickerFnRef.current) return;
    gsap.ticker.add(tickerFnRef.current);
    tickerActiveRef.current = true;
  };

  const stopTicking = () => {
    if (!tickerActiveRef.current || !tickerFnRef.current) return;
    gsap.ticker.remove(tickerFnRef.current);
    tickerActiveRef.current = false;
  };

  // DPR-aware sizing, re-measured on container resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || !sim) return undefined;
    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sim.reheat(0.4);
      ensureTicking();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sim, canvasRef]);

  // Suspend entirely when scrolled far off-screen — matches AmbientShader's
  // gating pattern (see components/three/AmbientShader.js).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) ensureTicking();
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(canvas);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, canvasRef]);

  // The render/step loop itself.
  useEffect(() => {
    if (!enabled || !sim) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const tick = (time) => {
      if (!visibleRef.current) return;
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 1 / 30);
      lastTimeRef.current = time;

      sim.step(dt);
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      draw?.(ctx, sim, { width, height, hoveredId: hoveredRef.current });

      if (sim.isSettled()) stopTicking();
    };

    tickerFnRef.current = tick;
    ensureTicking();

    return () => {
      stopTicking();
      tickerFnRef.current = null;
      lastTimeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sim, draw, canvasRef]);

  // Pointer hover + drag.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || !sim) return undefined;

    const hitTest = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      let closest = null;
      let closestDist = Infinity;
      for (const node of sim.nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        const d2 = dx * dx + dy * dy;
        const hitR = node.r + 8;
        if (d2 < hitR * hitR && d2 < closestDist) {
          closest = node;
          closestDist = d2;
        }
      }
      return closest;
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (draggingRef.current) {
        sim.setPinned(draggingRef.current, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        ensureTicking();
        return;
      }
      const hit = hitTest(e.clientX, e.clientY);
      const id = hit?.id ?? null;
      if (id !== hoveredRef.current) {
        hoveredRef.current = id;
        setHoveredId(id);
        ensureTicking();
      }
    };

    const handleDown = (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;
      draggingRef.current = hit.id;
      const rect = canvas.getBoundingClientRect();
      sim.setPinned(hit.id, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      ensureTicking();
    };

    const handleUp = () => {
      if (!draggingRef.current) return;
      sim.setPinned(draggingRef.current, null);
      draggingRef.current = null;
      ensureTicking();
    };

    const handleLeave = () => {
      if (hoveredRef.current !== null) {
        hoveredRef.current = null;
        setHoveredId(null);
      }
    };

    canvas.addEventListener('pointermove', handleMove, { passive: true });
    canvas.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    canvas.addEventListener('pointerleave', handleLeave);
    return () => {
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      canvas.removeEventListener('pointerleave', handleLeave);
    };
  }, [enabled, sim, canvasRef]);

  return { hoveredId };
}
