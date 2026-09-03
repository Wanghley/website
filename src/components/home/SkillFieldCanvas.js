import React, { useEffect, useMemo, useRef } from 'react';
import { createSim } from '../../lib/graphSim';
import useGraphCanvas from '../../hooks/useGraphCanvas';
import { getLinkedSkillNames } from '../../data/skillGraph';

// Deliberately off-center per group — a single shared centering force
// produces a round, centered blob (the exact "uniform grid" mistake this
// component exists to avoid). Normalized [0,1]; graphSim.js converts to
// bounds-space. Matched against the real categories returned by
// fetchFeaturedSkills() (Software, Data, DevOps, Engineering, Other).
const GROUP_ANCHORS = {
  Software: { x: 0.26, y: 0.32, w: 1 },
  Data: { x: 0.74, y: 0.24, w: 1 },
  DevOps: { x: 0.56, y: 0.78, w: 1 },
  Engineering: { x: 0.16, y: 0.7, w: 1 },
  Other: { x: 0.88, y: 0.6, w: 0.7 },
};
// Any category not covered above (unexpected new CMS type) falls back to
// createSim's own internal center anchor — no local default needed here.

const COLOR_ACCENT = '#3AAFF1';
const COLOR_ACCENT_BRIGHT = '#68C8F7';
const COLOR_DIM = 'rgba(176, 186, 196, 0.28)';
const COLOR_TEXT = '#F5F0E8';

function buildGraph(skills) {
  const nodes = skills.map((s) => ({
    id: s.name,
    label: s.name,
    group: s.type || 'Other',
    score: typeof s.score === 'number' && !Number.isNaN(s.score) ? s.score : 50,
    level: s.level,
    icon: s.icon,
  }));

  const byLowerName = new Map(nodes.map((n) => [n.id.toLowerCase(), n]));
  const edgeKeys = new Set();
  const edges = [];
  for (const node of nodes) {
    for (const linkedName of getLinkedSkillNames(node.id)) {
      const target = byLowerName.get(linkedName);
      if (!target || target.id === node.id) continue;
      const key = [node.id, target.id].sort().join('::');
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({ a: node.id, b: target.id, weight: 1 });
    }
  }
  return { nodes, edges };
}

/** Manual char-by-char draw with a fixed advance — avoids ctx.letterSpacing
 * (Chrome 99+/Safari 17+ only) to get the wide-tracked telemetry look. */
function drawTrackedText(ctx, text, x, y, { size = 10, tracking = 1.6, color = COLOR_TEXT, align = 'left' } = {}) {
  ctx.font = `600 ${size}px ${'"JetBrains Mono", monospace'}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';

  let totalWidth = 0;
  const widths = [];
  for (const ch of text) {
    const w = ctx.measureText(ch).width + tracking;
    widths.push(w);
    totalWidth += w;
  }

  let cursor = x;
  if (align === 'center') cursor = x - totalWidth / 2;
  else if (align === 'right') cursor = x - totalWidth;

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cursor, y);
    cursor += widths[i];
  }
}

export default function SkillFieldCanvas({ skills, activeId, onHoverChange, dimGroup }) {
  const canvasRef = useRef(null);
  const activeIdRef = useRef(activeId);
  const dimGroupRef = useRef(dimGroup);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    dimGroupRef.current = dimGroup;
  }, [dimGroup]);

  const { nodes, edges } = useMemo(() => buildGraph(skills), [skills]);

  const sim = useMemo(() => {
    if (!nodes.length) return null;
    return createSim({
      nodes,
      edges,
      bounds: { width: 1000, height: 620 },
      anchors: GROUP_ANCHORS,
      seed: 7,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  // Linked-neighbor lookup for the active node, recomputed only when it changes.
  const activeLinks = useMemo(() => {
    if (!activeId || !sim) return new Set();
    const names = getLinkedSkillNames(activeId).map((n) => n.toLowerCase());
    const set = new Set();
    for (const node of sim.nodes) {
      if (names.includes(node.id.toLowerCase())) set.add(node.id);
    }
    return set;
  }, [activeId, sim]);

  const draw = useMemo(
    () => (ctx, activeSim, { width, height, hoveredId }) => {
      const active = activeIdRef.current || hoveredId;
      const dimTo = dimGroupRef.current;

      const isHighlighted = (node) => node.id === active || activeLinks.has(node.id);
      const isDimmed = (node) => {
        if (dimTo && node.group !== dimTo) return true;
        if (active && !isHighlighted(node)) return true;
        return false;
      };

      // Edges — additive blend, gentle quadratic curve (not a straight
      // line) so the field reads as organic rather than a wiring diagram.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const edge of activeSim.edges) {
        const hot = edge.a.id === active || edge.b.id === active;
        const dim = isDimmed(edge.a) && isDimmed(edge.b);
        const mx = (edge.a.x + edge.b.x) / 2 + (edge.a.y - edge.b.y) * 0.06;
        const my = (edge.a.y + edge.b.y) / 2 + (edge.b.x - edge.a.x) * 0.06;
        ctx.strokeStyle = `rgba(58, 175, 241, ${hot ? 0.65 : dim ? 0.03 : 0.12})`;
        ctx.lineWidth = hot ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.quadraticCurveTo(mx, my, edge.b.x, edge.b.y);
        ctx.stroke();
      }
      ctx.restore();

      // Nodes — normal blend; shadowBlur (the expensive Canvas2D op)
      // restricted to the handful of currently-highlighted nodes.
      let labelCount = 0;
      for (const node of activeSim.nodes) {
        const hot = node.id === active;
        const linked = activeLinks.has(node.id);
        const dim = isDimmed(node);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        if (hot || linked) {
          ctx.shadowColor = COLOR_ACCENT;
          ctx.shadowBlur = hot ? 18 : 9;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = dim ? COLOR_DIM : hot ? COLOR_ACCENT_BRIGHT : COLOR_ACCENT;
        ctx.globalAlpha = dim ? 0.35 : 1;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.strokeStyle = dim ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)';
        ctx.stroke();

        // Labels only for hovered/active/large nodes — cheap at this count.
        const isLarge = node.r > 11;
        if ((hot || linked || isLarge) && labelCount < 10) {
          labelCount += 1;
          drawTrackedText(ctx, node.label.toUpperCase(), node.x, node.y - node.r - 10, {
            size: hot ? 11 : 9,
            color: dim ? 'rgba(245,240,232,0.35)' : hot ? '#FFFFFF' : 'rgba(245,240,232,0.85)',
            align: 'center',
          });
        }
      }
    },
    [activeLinks]
  );

  const { hoveredId } = useGraphCanvas({ canvasRef, sim, draw, enabled: !!sim });

  useEffect(() => {
    onHoverChange?.(hoveredId);
  }, [hoveredId, onHoverChange]);

  return (
    <canvas
      ref={canvasRef}
      className="skill-field__canvas-el"
      role="presentation"
      aria-hidden="true"
    />
  );
}
