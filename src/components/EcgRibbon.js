import React, { useEffect, useRef, useState } from 'react';
import './css/EcgRibbon.css';

/**
 * EcgRibbon — live ECG canvas with normal sinus rhythm and
 * occasional PVC (premature ventricular contraction) events.
 * IntersectionObserver-gated to pause when off-screen.
 *
 * Props:
 *   height: pixel height of the canvas (default 84)
 *   label:  optional override for the right-side status text
 */
const EcgRibbon = ({ height = 84, label = 'NORMAL SINUS · 88 BPM' }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    x: 0,
    points: [],
    beatTimer: 0,
    beatInterval: 32,        // frames between beats
    inBeat: false,
    beatPhase: 0,
    isPvc: false,
    pvcCooldown: 0,
    visible: true,
    reducedMotion: false,
  });
  const [status, setStatus] = useState({ pvc: false, label });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const st = stateRef.current;

    st.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    /* — Resize handling — */
    const resize = () => {
      const w = wrap.clientWidth;
      const h = height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    /* — IntersectionObserver pause/resume — */
    const io = new IntersectionObserver(
      ([entry]) => {
        st.visible = entry.isIntersecting;
        if (st.visible && !rafRef.current) loop();
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    /* — ECG waveform generator —
       Each "beat" is a PQRST sequence: small P, sharp QRS, smaller T.
       A PVC replaces the standard beat with a wider, inverted complex
       and triggers the arrhythmia color state.                          */
    const beatStandard = (phase) => {
      if (phase < 0.10) return Math.sin(phase * Math.PI * 10) * 0.06;
      if (phase < 0.18) return 0;
      if (phase < 0.22) return -0.10;
      if (phase < 0.27) return 0.95;
      if (phase < 0.32) return -0.35;
      if (phase < 0.38) return -0.05;
      if (phase < 0.55) return Math.sin((phase - 0.38) * Math.PI * 5.88) * 0.22;
      return 0;
    };

    const beatPvc = (phase) => {
      if (phase < 0.10) return Math.sin(phase * Math.PI * 5) * -0.30;
      if (phase < 0.25) return -0.75;
      if (phase < 0.35) return 0.55;
      if (phase < 0.55) return Math.sin((phase - 0.35) * Math.PI * 5) * -0.18;
      return 0;
    };

    /* — Main loop — */
    const draw = () => {
      const w = wrap.clientWidth;
      const h = height;
      const midY = h * 0.55;
      const amp = h * 0.36;

      /* Trail with low-opacity rect for slight afterglow */
      ctx.fillStyle = 'rgba(2, 17, 10, 0.20)';
      ctx.fillRect(0, 0, w, h);

      /* Re-draw grid pattern on top of trail (very faint) */
      ctx.strokeStyle = 'rgba(111, 207, 151, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = (st.x % 30); gx < w; gx += 30) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
      }
      for (let gy = 0; gy < h; gy += 16) {
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
      }
      ctx.stroke();

      /* Advance state & sample new value */
      const stepX = 2;
      const stepsPerFrame = st.reducedMotion ? 0 : 1;

      for (let s = 0; s < stepsPerFrame; s++) {
        if (st.inBeat) {
          st.beatPhase += 1 / 18;
          if (st.beatPhase >= 1) {
            st.inBeat = false;
            st.beatPhase = 0;
            if (st.isPvc) {
              st.pvcCooldown = 6 * st.beatInterval;
              st.isPvc = false;
              setStatus({ pvc: false, label: 'NORMAL SINUS · 88 BPM' });
            }
            st.beatTimer = 0;
          }
        } else {
          st.beatTimer += 1;
          if (st.beatTimer >= st.beatInterval) {
            st.inBeat = true;
            st.beatPhase = 0;
            /* Roll for PVC every ~12 beats once cooldown clears */
            if (st.pvcCooldown <= 0 && Math.random() < 0.08) {
              st.isPvc = true;
              setStatus({ pvc: true, label: 'PVC DETECTED · ANOMALY' });
            }
            if (st.pvcCooldown > 0) st.pvcCooldown -= st.beatInterval;
          }
        }

        let val = 0;
        if (st.inBeat) {
          val = st.isPvc ? beatPvc(st.beatPhase) : beatStandard(st.beatPhase);
        } else {
          val = (Math.random() - 0.5) * 0.015;
        }

        const y = midY - val * amp;
        st.points.push({ y, pvc: st.isPvc && st.inBeat });
        if (st.points.length > Math.ceil(w / stepX) + 4) {
          st.points.shift();
        }
        st.x += stepX;
      }

      /* Draw the waveform */
      if (st.points.length > 1) {
        const colorNormal = '#6FCF97';
        const colorPvc = '#E84A5F';
        const xStart = w - (st.points.length - 1) * stepX;

        // Glow pass
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(xStart, st.points[0].y);
        for (let i = 1; i < st.points.length; i++) {
          ctx.lineTo(xStart + i * stepX, st.points[i].y);
        }
        const anyPvc = st.points.some((p) => p.pvc);
        ctx.shadowColor = anyPvc ? 'rgba(232, 74, 95, 0.55)' : 'rgba(111, 207, 151, 0.45)';
        ctx.strokeStyle = anyPvc ? colorPvc : colorNormal;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Crisp top pass
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(xStart, st.points[0].y);
        for (let i = 1; i < st.points.length; i++) {
          ctx.lineTo(xStart + i * stepX, st.points[i].y);
        }
        ctx.strokeStyle = anyPvc ? '#FF8395' : '#A8E6C1';
        ctx.stroke();

        // Leading-edge dot
        const last = st.points[st.points.length - 1];
        ctx.beginPath();
        ctx.arc(xStart + (st.points.length - 1) * stepX, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = anyPvc ? colorPvc : colorNormal;
        ctx.fill();
      }
    };

    const loop = () => {
      if (!st.visible) {
        rafRef.current = 0;
        return;
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      io.disconnect();
    };
  }, [height]);

  return (
    <div
      ref={wrapRef}
      className={`ecg-ribbon${status.pvc ? ' ecg-ribbon--pvc' : ''}`}
      role="img"
      aria-label="Live ECG ribbon showing normal sinus rhythm with occasional arrhythmia detection"
    >
      <canvas ref={canvasRef} className="ecg-ribbon__canvas" />
      <div className="ecg-ribbon__overlay">
        <span className="ecg-ribbon__channel">CH:ECG · LEAD II</span>
        <span className="ecg-ribbon__status">
          <span className="ecg-ribbon__dot" />
          {status.label}
        </span>
      </div>
    </div>
  );
};

export default EcgRibbon;
