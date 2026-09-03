import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { STAGES, STAGE_EDGES } from '../../data/signalChain';

const nodeById = new Map(STAGES.map((s) => [s.id, s]));

/**
 * The schematic SVG diagram — right-angle routed polylines (not organic
 * curves), deliberately a different genus from SkillField's physics field
 * so the two "graph" moments on the page don't read as the same trick
 * twice. Exposes an imperative `setProgress(scaled)` API (scaled = a
 * continuous 0..STAGES.length value) so the parent's ScrollTrigger
 * onUpdate can drive it directly via refs — cheap, no React re-render per
 * scroll frame.
 *
 * Static and fully legible with zero JS: every edge/node is real SVG
 * markup with real <title> text, so even before setProgress is ever
 * called (or on the reduced-motion path, which never calls it) the
 * diagram reads correctly at its default (rest) state.
 */
const SignalChainDiagram = forwardRef(function SignalChainDiagram({ staticFull = false }, ref) {
  const edgeRefs = useRef([]);
  const nodeRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    setProgress(scaled) {
      edgeRefs.current.forEach((path, i) => {
        if (!path) return;
        const t = Math.min(1, Math.max(0, scaled - i));
        path.style.strokeDashoffset = String(1 - t);
      });
      const activeIdx = Math.min(STAGES.length - 1, Math.floor(scaled));
      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        node.classList.toggle('is-active', i === activeIdx);
        node.classList.toggle('is-passed', i < activeIdx);
      });
    },
  }));

  const edgePaths = useMemo(
    () =>
      STAGE_EDGES.map((edge) => {
        const a = nodeById.get(edge.a).node;
        const b = nodeById.get(edge.b).node;
        const midX = (a.x + b.x) / 2;
        return `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`;
      }),
    []
  );

  return (
    <svg
      className="signal-chain-diagram"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="signal-chain-diagram-title"
    >
      <title id="signal-chain-diagram-title">
        Signal chain: sense, condition, infer, deploy, impact
      </title>
      <defs>
        <filter id="signal-chain-node-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {STAGE_EDGES.map((edge, i) => (
        <path
          key={`${edge.a}-${edge.b}`}
          ref={(el) => {
            edgeRefs.current[i] = el;
          }}
          className="signal-chain-diagram__edge"
          d={edgePaths[i]}
          pathLength="1"
          style={staticFull ? undefined : { strokeDasharray: 1, strokeDashoffset: 1 }}
        />
      ))}

      {STAGES.map((stage, i) => (
        <g
          key={stage.id}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          className={`signal-chain-diagram__node${staticFull ? ' is-passed' : ''}`}
        >
          <title>{stage.heading}</title>
          <circle cx={stage.node.x} cy={stage.node.y} r="15" />
          <circle
            cx={stage.node.x}
            cy={stage.node.y}
            r="15"
            className="signal-chain-diagram__node-glow"
          />
          <text x={stage.node.x} y={stage.node.y - 28} textAnchor="middle">
            {String(i + 1).padStart(2, '0')} · {stage.label}
          </text>
        </g>
      ))}
    </svg>
  );
});

export default SignalChainDiagram;
