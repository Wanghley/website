import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import {
  CHIP,
  VIEW,
  PLOT,
  getShapes,
  layerOpacity,
  lerpShape,
  toPathD,
  xOfTime,
  yOfPf,
} from './shapes';

const STAGES = 5;
const ENTER = 0.4; // fraction of each stage's scroll spent morphing in

const ease = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// Opacities for every overlay layer at stage `idx`, entry progress `m`.
function layersAt(idx, m) {
  return {
    axes: idx <= 2 ? 1 : idx === 3 ? 1 - m : 0,
    features: layerOpacity(2, idx, m),
    chip: layerOpacity(3, idx, m),
    outcome: layerOpacity(4, idx, m),
  };
}

/**
 * The one waveform. `ref.setProgress(0..1)` is called from the pinned
 * ScrollTrigger and writes straight to the DOM (no React re-render per
 * frame). With `stage` set it renders that stage as a still, which is the
 * designed end-state for reduced motion and small screens.
 */
const ChainFigure = forwardRef(function ChainFigure({ stage = null, title }, ref) {
  const { shapes, features, trace } = useMemo(() => getShapes(), []);
  const pathRef = useRef(null);
  const layerRefs = useRef({});

  const initial = stage == null ? layersAt(0, 1) : layersAt(stage, 1);
  const d0 = toPathD(shapes[stage == null ? 0 : stage]);

  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      const s = Math.min(STAGES - 1e-6, Math.max(0, progress * STAGES));
      const idx = Math.floor(s);
      const local = s - idx;
      const m = idx === 0 ? 1 : ease(local / ENTER);
      const from = shapes[Math.max(0, idx - 1)];
      const to = shapes[idx];
      if (pathRef.current) {
        pathRef.current.setAttribute('d', toPathD(idx === 0 ? to : lerpShape(from, to, m)));
      }
      const l = layersAt(idx, m);
      Object.keys(l).forEach((k) => {
        const el = layerRefs.current[k];
        if (el) el.style.opacity = l[k].toFixed(3);
      });
    },
  }));

  const setLayer = (k) => (el) => { layerRefs.current[k] = el; };
  const f = features;
  const onsetX = xOfTime(f.onset.t);
  const offsetX = xOfTime(f.offset.t);
  const peakX = xOfTime(f.peak.t);
  const peakY = yOfPf(f.peak.v);

  return (
    <svg
      className="chain-figure"
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      role="img"
      aria-label={title || 'One capacitive-sensor waveform, transformed at each stage: raw, filtered, features marked, running on a chip, recognised as a hand.'}
    >
      <text className="chain-figure__tag" x={VIEW.w - 10} y="22" textAnchor="end">
        ILLUSTRATIVE · SIMULATED TRACE
      </text>

      {/* axes */}
      <g ref={setLayer('axes')} style={{ opacity: initial.axes }}>
        <line className="chain-figure__axis" x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.yZero} y2={PLOT.yZero} />
        {[0, 1, 2].map((pf) => (
          <g key={pf}>
            <line className="chain-figure__grid" x1={PLOT.x0} x2={PLOT.x1} y1={yOfPf(pf)} y2={yOfPf(pf)} />
            <text className="chain-figure__tick" x={PLOT.x0 - 10} y={yOfPf(pf) + 4} textAnchor="end">{pf}</text>
          </g>
        ))}
        <text className="chain-figure__tick" x={PLOT.x0 - 10} y={yOfPf(2.4) + 4} textAnchor="end">pF</text>
        {[0, 1, 2, 3].map((s) => (
          <text key={s} className="chain-figure__tick" x={xOfTime(s)} y={PLOT.yZero + 22} textAnchor="middle">
            {s}{s === 3 ? ' s' : ''}
          </text>
        ))}
      </g>

      {/* features (stage 3: infer) */}
      <g ref={setLayer('features')} style={{ opacity: initial.features }}>
        <line className="chain-figure__guide" x1={onsetX} x2={onsetX} y1={yOfPf(f.onset.v)} y2={PLOT.yZero} />
        <line className="chain-figure__guide" x1={offsetX} x2={offsetX} y1={yOfPf(f.offset.v)} y2={PLOT.yZero} />
        <line className="chain-figure__guide" x1={peakX} x2={peakX} y1={peakY} y2={PLOT.yZero} />
        <line className="chain-figure__bracket" x1={onsetX} x2={offsetX} y1={PLOT.yZero + 44} y2={PLOT.yZero + 44} />
        <circle className="chain-figure__dot" cx={onsetX} cy={yOfPf(f.onset.v)} r="6" />
        <circle className="chain-figure__dot" cx={peakX} cy={peakY} r="6" />
        <circle className="chain-figure__dot" cx={offsetX} cy={yOfPf(f.offset.v)} r="6" />
        <text className="chain-figure__mark" x={onsetX - 12} y={yOfPf(f.onset.v) - 6} textAnchor="end">onset {f.onset.t.toFixed(1)} s</text>
        <text className="chain-figure__mark" x={peakX} y={peakY - 16} textAnchor="middle">peak {f.peak.v.toFixed(2)} pF</text>
        <text className="chain-figure__mark" x={(onsetX + offsetX) / 2} y={PLOT.yZero + 64} textAnchor="middle">dwell {f.dwell.toFixed(1)} s</text>
      </g>

      {/* chip (stage 4: deploy) */}
      <g ref={setLayer('chip')} style={{ opacity: initial.chip }}>
        <rect className="chain-figure__chip" x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx="10" />
        {Array.from({ length: 8 }, (_, i) => {
          const px = CHIP.x + 30 + i * ((CHIP.w - 60) / 7);
          const py = CHIP.y + 30 + i * ((CHIP.h - 60) / 7);
          return (
            <g key={i} className="chain-figure__pin">
              <line x1={px} x2={px} y1={CHIP.y - 16} y2={CHIP.y} />
              <line x1={px} x2={px} y1={CHIP.y + CHIP.h} y2={CHIP.y + CHIP.h + 16} />
              <line x1={CHIP.x - 16} x2={CHIP.x} y1={py} y2={py} />
              <line x1={CHIP.x + CHIP.w} x2={CHIP.x + CHIP.w + 16} y1={py} y2={py} />
            </g>
          );
        })}
        <text className="chain-figure__chip-label" x={CHIP.x + 22} y={CHIP.y + 34}>MCU</text>
        <text className="chain-figure__chip-main" x={CHIP.x + 22} y={CHIP.y + 82}>classify()</text>
        <text className="chain-figure__chip-sub" x={CHIP.x + 22} y={CHIP.y + 112}>0.4 ms · 38 µW*</text>
      </g>

      {/* the one waveform */}
      <path ref={pathRef} className="chain-figure__path" d={d0} />

      {/* outcome (stage 5: impact) */}
      <g ref={setLayer('outcome')} style={{ opacity: initial.outcome }}>
        <text className="chain-figure__outcome" x={500} y={VIEW.h - 24} textAnchor="middle">open hand · recognised</text>
      </g>

      <desc>{trace.t.length} samples, simulated for illustration.</desc>
    </svg>
  );
});

export default ChainFigure;
