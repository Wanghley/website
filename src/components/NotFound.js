import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './css/notFound.css';

/* ── Sparse EEG: 3 calm channels ─────────────────────────────────── */
const BG_CHANNELS = [
  { delta: 0.05, theta: 0.10, alpha: 0.62, beta: 0.18, noise: 0.03, phase: [0.0, 1.1, 2.3, 0.7] },
  { delta: 0.28, theta: 0.42, alpha: 0.18, beta: 0.14, noise: 0.04, phase: [1.4, 0.5, 3.1, 1.9] },
  { delta: 0.04, theta: 0.07, alpha: 0.78, beta: 0.11, noise: 0.02, phase: [2.1, 0.9, 1.7, 0.3] },
];

function eegSample(t, ch) {
  let v = 0;
  v += ch.delta * Math.sin(t * 0.018 + ch.phase[0]) * (0.8 + 0.4 * Math.sin(t * 0.007));
  v += ch.theta * Math.sin(t * 0.072 + ch.phase[1]) * (0.9 + 0.2 * Math.sin(t * 0.019));
  v += ch.alpha * Math.sin(t * 0.138 + ch.phase[2]) * (0.6 + 0.6 * Math.abs(Math.sin(t * 0.011)));
  v += ch.beta  * Math.sin(t * 0.240 + ch.phase[3]);
  v += ch.beta  * 0.40 * Math.sin(t * 0.310 + ch.phase[3] + 1.2);
  v += (Math.random() - 0.5) * ch.noise;
  if (Math.random() < 0.0004) v += (Math.random() > 0.5 ? 1 : -1) * 1.4;
  return v;
}

/* ── Motion variants — mirrors Hero.js pattern exactly ───────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1,
            transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: 0.30 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,
            transition: { duration: 0.60, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const NotFound = () => {
  const canvasRef      = useRef(null);
  const stateRef       = useRef({ t: 0, histories: BG_CHANNELS.map(() => []) });
  const rafRef         = useRef(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => { document.title = '404 · Signal Not Found'; }, []);

  /* — EEG background canvas — */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const st  = stateRef.current;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const STEP = 1; /* slow, meditative sweep */

    const draw = () => {
      const w   = canvas.offsetWidth;
      const h   = canvas.offsetHeight;
      const chH = h / BG_CHANNELS.length;

      /* light background */
      ctx.fillStyle = '#f1f4f9';
      ctx.fillRect(0, 0, w, h);

      /* one faint divider per channel boundary — no grid */
      ctx.lineWidth   = 0.5;
      ctx.strokeStyle = 'rgba(13,26,46,0.06)';
      for (let i = 1; i < BG_CHANNELS.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * chH);
        ctx.lineTo(w, i * chH);
        ctx.stroke();
      }

      /* advance signal, draw traces */
      st.t += 1;
      const maxPts = Math.ceil(w / STEP) + 4;

      BG_CHANNELS.forEach((ch, ci) => {
        st.histories[ci].push(eegSample(st.t, ch));
        if (st.histories[ci].length > maxPts) st.histories[ci].shift();

        const pts  = st.histories[ci];
        if (pts.length < 2) return;

        const midY = ci * chH + chH * 0.52;
        const amp  = chH * 0.32;
        const xOff = w - (pts.length - 1) * STEP;

        ctx.strokeStyle = 'rgba(13,26,46,0.38)';
        ctx.lineWidth   = 0.9;
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        ctx.moveTo(xOff, midY - pts[0] * amp);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(xOff + i * STEP, midY - pts[i] * amp);
        }
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const initial = prefersReduced ? 'show' : 'hidden';

  return (
    <div className="nf">
      <canvas ref={canvasRef} className="nf__canvas" aria-hidden="true" />

      <div className="nf__content">

        {/* Card entrance */}
        <motion.div
          className="nf__card"
          variants={cardVariants}
          initial={initial}
          animate="show"
        >
          {/* Staggered children */}
          <motion.div
            variants={containerVariants}
            initial={initial}
            animate="show"
            className="nf__card-inner"
          >

            <motion.div className="nf__eyebrow" variants={itemVariants}>
              <span className="nf__eye-dot" />
              <span>HTTP · STATUS 404</span>
              <span className="nf__sep">·</span>
              <span>ENDPOINT NULL</span>
            </motion.div>

            {/* 404 — the "0" floats continuously */}
            <motion.div className="nf__code" aria-label="404" variants={itemVariants}>
              <span>4</span>
              <motion.span
                className="nf__zero"
                animate={prefersReduced ? {} : { y: [0, -5, 0] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
              >
                0
              </motion.span>
              <span>4</span>
            </motion.div>

            <motion.h1 className="nf__heading" variants={itemVariants}>
              SIGNAL NOT FOUND
            </motion.h1>

            <motion.p className="nf__body" variants={itemVariants}>
              The route you requested returned no signal. The endpoint may have
              been removed, renamed, or never existed in this domain.
            </motion.p>

            <motion.div className="nf__chips" variants={itemVariants}>
              <div className="nf__chip">
                <span className="nf__chip-key">LAST_ROUTE</span>
                <span className="nf__chip-val">UNKNOWN</span>
              </div>
              <div className="nf__chip">
                <span className="nf__chip-key">STACK_DEPTH</span>
                <span className="nf__chip-val">0x00</span>
              </div>
              <div className="nf__chip nf__chip--err">
                <span className="nf__chip-key">RETURN_CODE</span>
                <span className="nf__chip-val">E_NOTFOUND</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to="/" className="nf__cta">
                <span className="nf__cta-arrow">←</span>
                Return to base
              </Link>
            </motion.div>

          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFound;
