import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BOARD, BOARD_LABEL, SENSOR_ID, COMPONENTS, TRACES } from '../../data/circuitBoard';
// Static duotone still of the hologram head (see build-head-precompute.js),
// rendered at its "near" state — this SVG/CSS path serves both mobile and
// prefers-reduced-motion visitors (useCanRender3D() routes both here), and
// neither gets the animated R3F CharacterHead, so a static resolved image
// is the whole treatment rather than a partial/degraded one.
import wsmHeadHolo from '../../assets/3d_model/precomputed/wsm-head-holo.png';
import './css/CircuitBoardScene.css';

// ─── Isometric projection ───────────────────────────────────────────────
// Every shape below is authored in grid (col, row) units and converted to
// screen points through iso() at render time — nothing is hand-computed
// pixel-by-pixel, so the board layout lives entirely in data/circuitBoard.js.
const STEP_X = 34;
const STEP_Y = 20;
const ORIGIN_X = 260;
const ORIGIN_Y = 30;
const VIEWBOX = '0 0 680 430';

function iso(col, row) {
  return { x: ORIGIN_X + (col - row) * STEP_X, y: ORIGIN_Y + (col + row) * STEP_Y };
}

function ptsStr(pts) {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function pathD(waypoints) {
  return waypoints
    .map(([c, r], i) => {
      const p = iso(c, r);
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');
}

// Extrudes a closed top-face loop (screen points, in order) downward by
// `height`, returning the top polygon plus the two side faces adjacent to
// the frontmost (max-y — nearest the viewer in this projection) vertex.
// Used for the substrate slab and every boxy component alike.
function extrude(topScreen, height) {
  let frontIdx = 0;
  topScreen.forEach((p, i) => {
    if (p.y > topScreen[frontIdx].y) frontIdx = i;
  });
  const n = topScreen.length;
  const front = topScreen[frontIdx];
  const prev = topScreen[(frontIdx - 1 + n) % n];
  const next = topScreen[(frontIdx + 1) % n];
  const drop = (p) => ({ x: p.x, y: p.y + height });
  return {
    top: topScreen,
    faceLeft: [prev, front, drop(front), drop(prev)],
    faceRight: [front, next, drop(next), drop(front)],
  };
}

function boxTopScreen(col, row, w, h) {
  return [iso(col, row), iso(col + w, row), iso(col + w, row + h), iso(col, row + h)];
}

const BOARD_TOP = [iso(0, 0), iso(BOARD.cols, 0), iso(BOARD.cols, BOARD.rows), iso(0, BOARD.rows)];
const BOARD_SOLID = extrude(BOARD_TOP, BOARD.thickness);

export default function CircuitBoardScene({ rootRef, sensorRef, reducedMotion, className = '' }) {
  const svgRef = useRef(null);
  const [activeCallout, setActiveCallout] = useState(null);
  const lastCalloutRef = useRef(null);
  // Fades in on this component's OWN mount, not the hero's unrelated
  // boot-telemetry timer (used to be `booted`, a flat 900ms setTimeout in
  // HeroChamber.js — this component renders correctly the instant it
  // mounts, so gating its opacity on that timer only made it invisible for
  // no reason). Same fix already applied to the R3F path's wrapper, see
  // HeroCircuitBoard.js's `ready` state.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
      performance.mark('hero-board-ready');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const sensorScreen = useMemo(() => {
    const c = COMPONENTS.find((c) => c.id === SENSOR_ID);
    return iso(c.col, c.row);
  }, []);

  // Nearest-component tracking for callouts — a small, deliberately
  // throttled slice of React state (only commits when the nearest id
  // actually changes), layered on top of the CSS-var-only proximity system
  // that drives everything continuous (glow, traces, tilt, pulses).
  useEffect(() => {
    if (reducedMotion) return undefined;
    const svg = svgRef.current;
    if (!svg) return undefined;

    const handleMove = (e) => {
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;
      const scaleX = 680 / rect.width;
      const scaleY = 430 / rect.height;
      const localX = (e.clientX - rect.left) * scaleX;
      const localY = (e.clientY - rect.top) * scaleY;

      let nearestId = null;
      let nearestDist = 46; // screen-unit callout radius, in viewBox units
      COMPONENTS.forEach((c) => {
        const p = iso(c.col + (c.w ?? c.radius ?? 0) / 2, c.row + (c.h ?? c.radius ?? 0) / 2);
        const d = Math.hypot(p.x - localX, p.y - localY);
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = c.id;
        }
      });

      if (nearestId !== lastCalloutRef.current) {
        lastCalloutRef.current = nearestId;
        setActiveCallout(nearestId);
      }
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [reducedMotion]);

  const activeComponent = COMPONENTS.find((c) => c.id === activeCallout);

  return (
    <div ref={rootRef} className={`circuit-scene${ready ? ' is-ready' : ''} ${className}`}>
      <svg
        ref={svgRef}
        className="circuit-scene__svg"
        viewBox={VIEWBOX}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern id="circuit-via-grid" width="34" height="20" patternUnits="userSpaceOnUse">
            <circle cx="17" cy="10" r="1.1" fill="#2770B5" opacity="0.35" />
          </pattern>
          <filter id="circuit-drop-shadow" x="-40%" y="-20%" width="180%" height="180%">
            <feDropShadow dx="6" dy="10" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
          </filter>
          <clipPath id="circuit-board-clip">
            <polygon points={ptsStr(BOARD_TOP)} />
          </clipPath>
        </defs>

        {/* ── Substrate ── */}
        <g filter="url(#circuit-drop-shadow)">
          <polygon points={ptsStr(BOARD_SOLID.faceLeft)} className="circuit-face circuit-face--dark" />
          <polygon points={ptsStr(BOARD_SOLID.faceRight)} className="circuit-face circuit-face--mid" />
          <polygon points={ptsStr(BOARD_TOP)} className="circuit-face circuit-face--top" />
        </g>
        <polygon points={ptsStr(BOARD_TOP)} fill="url(#circuit-via-grid)" clipPath="url(#circuit-board-clip)" />

        {/* ── Traces — an always-visible dim path (unlit brand blue) with a
             bright path overlaid on top whose opacity ramps in with
             proximity, rather than swapping stroke color: two literal
             brand colors, no color-mix() dependency. ── */}
        <g clipPath="url(#circuit-board-clip)">
          {TRACES.map((t) => (
            <path key={`${t.id}-base`} d={pathD(t.points)} className="circuit-trace circuit-trace--base" />
          ))}
          {TRACES.map((t, i) => (
            <path
              key={`${t.id}-lit`}
              d={pathD(t.points)}
              className="circuit-trace circuit-trace--lit"
              style={{ '--reveal-at': ((i / TRACES.length) * 0.65).toFixed(2) }}
            />
          ))}
          {TRACES.filter((t) => t.toSensor || t.powered).map((t) => (
            <circle key={`${t.id}-pulse`} r="3" className="circuit-pulse" style={{ offsetPath: `path("${pathD(t.points)}")` }} />
          ))}
        </g>

        {/* ── Field rings around the sensor pad ── */}
        <g transform={`translate(${sensorScreen.x} ${sensorScreen.y})`}>
          <circle className="circuit-field-ring circuit-field-ring--1" />
          <circle className="circuit-field-ring circuit-field-ring--2" />
          <circle className="circuit-field-ring circuit-field-ring--3" />
        </g>

        {/* ── Components ── */}
        {COMPONENTS.map((c) => {
          const isSensor = c.id === SENSOR_ID;
          if (isSensor) {
            const p = iso(c.col, c.row);
            return (
              <g
                key={c.id}
                ref={sensorRef}
                transform={`translate(${p.x} ${p.y})`}
                className="circuit-component circuit-component--sensor"
              >
                <ellipse rx="26" ry="14" className="circuit-sensor-pad" />
                <ellipse rx="18" ry="9.5" className="circuit-sensor-pad circuit-sensor-pad--ring" fill="none" />
                <ellipse rx="10" ry="5" className="circuit-sensor-pad circuit-sensor-pad--core" fill="none" />
                <text className="circuit-silk" x="0" y="24" textAnchor="middle">{c.designator}</text>
              </g>
            );
          }

          const top = boxTopScreen(c.col, c.row, c.w ?? c.radius * 2, c.h ?? c.radius * 2);
          const { faceLeft, faceRight } = extrude(top, c.height);
          const center = iso(c.col + (c.w ?? c.radius) / 2, c.row + (c.h ?? c.radius) / 2);
          return (
            <g key={c.id} className={`circuit-component circuit-component--${c.kind}`}>
              <polygon points={ptsStr(faceLeft)} className="circuit-comp-face circuit-comp-face--dark" />
              <polygon points={ptsStr(faceRight)} className="circuit-comp-face circuit-comp-face--mid" />
              <polygon points={ptsStr(top)} className="circuit-comp-face circuit-comp-face--top" />
              <text className="circuit-silk" x={center.x} y={top[0].y - 4} textAnchor="middle">
                {c.designator}
              </text>
            </g>
          );
        })}

        {/* ── Board silkscreen name ── */}
        <text x="24" y="410" className="circuit-board-label">{BOARD_LABEL}</text>
      </svg>

      {/* Static hologram head — the mobile/reduced-motion fallback for
          CharacterHead.js's animated R3F version. Positioned above the
          sensor pad the same way `.circuit-callout` positions itself,
          percent-based off the same iso() screen coordinates. */}
      <img
        src={wsmHeadHolo}
        alt=""
        aria-hidden="true"
        className="circuit-scene__holo"
        style={{
          left: `${(sensorScreen.x / 680) * 100}%`,
          top: `${(sensorScreen.y / 430) * 100}%`,
        }}
      />

      {activeComponent && (
        <div
          className="circuit-callout"
          style={{
            left: `${(iso(activeComponent.col, activeComponent.row).x / 680) * 100}%`,
            top: `${(iso(activeComponent.col, activeComponent.row).y / 430) * 100}%`,
          }}
        >
          <span className="circuit-callout__leader" aria-hidden="true" />
          {activeComponent.callout}
        </div>
      )}
    </div>
  );
}
