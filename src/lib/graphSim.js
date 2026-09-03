// ─── Hand-rolled force-directed layout ─────────────────────────────────────
// Framework-free, no DOM/React dependency — used by useGraphCanvas.js (a
// Canvas2D host) to lay out the skill-field graph in SkillField.js. No
// d3-force or similar: at the node counts this page will ever show
// (≤44, ranked by score — see the plan's cap), an O(n²) repulsion pass is
// cheap, and hand-rolling avoids a new dependency for ~130 lines.
//
// Deterministic: seeded with a small LCG rather than Math.random(), so the
// settled layout is the same on every load — a portfolio should not look
// different each visit, and it makes visual QA/screenshots reproducible.

const K_REPEL = 900;
const K_WALL = 0.0025;
const DAMPING = 0.86;
const MAX_SPEED = 900; // px/s
const ALPHA_DECAY = 0.0228;
const ALPHA_MIN = 0.001;

// ─── Deterministic RNG (mulberry32) ───
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a simulation instance.
 *
 * @param {object} opts
 * @param {Array<{id:string,label:string,group:string,score:number}>} opts.nodes
 * @param {Array<{a:string,b:string,weight?:number}>} opts.edges
 * @param {{width:number,height:number}} opts.bounds - normalized [0,1] space
 * @param {Record<string,{x:number,y:number,w:number}>} opts.anchors - per-group
 *   anchor point in the SAME [0,1] normalized space, deliberately authored
 *   off-center per group so the settled field is asymmetric by construction
 *   (a single shared centering force produces a round, centered blob — the
 *   exact "uniform grid" mistake this component exists to avoid).
 * @param {number} [opts.seed=1]
 */
export function createSim({ nodes, edges, bounds, anchors, seed = 1 }) {
  const rng = makeRng(seed);
  const w = bounds?.width ?? 1;
  const h = bounds?.height ?? 1;
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;

  // `anchors` is authored in normalized [0,1] space (resolution-independent,
  // easy to reason about when placing groups off-center) — convert once to
  // absolute bounds-space here, since node.x/y/vx/vy are all in that space.
  const absAnchors = {};
  for (const key of Object.keys(anchors)) {
    const a = anchors[key];
    absAnchors[key] = { x: a.x * w, y: a.y * h, w: a.w ?? 1 };
  }
  const defaultAnchor = { x: cx, y: cy, w: 1 };

  const simNodes = nodes.map((n) => {
    const anchor = absAnchors[n.group] || defaultAnchor;
    // Seed near the node's own group anchor (jittered) rather than fully
    // random — settles faster and avoids an initial frame of total chaos.
    const jitterR = Math.min(w, h) * 0.18;
    const angle = rng() * Math.PI * 2;
    const dist = rng() * jitterR;
    return {
      ...n,
      x: anchor.x + Math.cos(angle) * dist,
      y: anchor.y + Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      r: 4 + Math.sqrt(Math.max(1, n.score ?? 50)) * 1.1,
      mass: 0.6 + (n.score ?? 50) / 100,
      pinned: false,
      dim: false,
    };
  });

  const byId = new Map(simNodes.map((n) => [n.id, n]));
  const simEdges = edges
    .map((e) => ({
      a: byId.get(e.a),
      b: byId.get(e.b),
      weight: e.weight ?? 1,
      rest: Math.min(w, h) * 0.16,
    }))
    .filter((e) => e.a && e.b);

  let alpha = 1;
  let alphaTarget = 0;
  let interacting = false;

  function reheat(target = 0.35) {
    alphaTarget = target;
    alpha = Math.max(alpha, target * 0.6);
  }

  function step(dt) {
    if (alpha < ALPHA_MIN && alphaTarget === 0) return;

    alpha += (alphaTarget - alpha) * ALPHA_DECAY;
    if (alpha < ALPHA_MIN) alpha = 0;

    const n = simNodes.length;

    // 1. Repulsion — O(n²), fine at this node count.
    for (let i = 0; i < n; i++) {
      const ni = simNodes[i];
      if (ni.pinned) continue;
      for (let j = i + 1; j < n; j++) {
        const nj = simNodes[j];
        let dx = nj.x - ni.x;
        let dy = nj.y - ni.y;
        const dist2 = Math.max(dx * dx + dy * dy, 0.0004);
        const f = (K_REPEL * ni.mass * nj.mass * alpha) / dist2;
        const dist = Math.sqrt(dist2);
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        ni.vx -= fx;
        ni.vy -= fy;
        if (!nj.pinned) {
          nj.vx += fx;
          nj.vy += fy;
        }
      }
    }

    // 2. Springs.
    for (const e of simEdges) {
      const dx = e.b.x - e.a.x;
      const dy = e.b.y - e.a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.001);
      const ext = dist - e.rest;
      const f = ext * 0.02 * e.weight * alpha;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      if (!e.a.pinned) {
        e.a.vx += fx;
        e.a.vy += fy;
      }
      if (!e.b.pinned) {
        e.b.vx -= fx;
        e.b.vy -= fy;
      }
    }

    // 3. Anisotropic per-group anchoring — the composition-breaking force.
    for (const node of simNodes) {
      if (node.pinned) continue;
      const anchor = absAnchors[node.group] || defaultAnchor;
      node.vx += (anchor.x - node.x) * 0.012 * anchor.w * alpha;
      node.vy += (anchor.y - node.y) * 0.012 * anchor.w * alpha;
    }

    // 4. Soft elliptical wall.
    for (const node of simNodes) {
      if (node.pinned) continue;
      const nx = (node.x - cx) / rx;
      const ny = (node.y - cy) / ry;
      const r2 = nx * nx + ny * ny;
      if (r2 > 0.85) {
        const over = r2 - 0.85;
        node.vx -= nx * over * K_WALL * rx * 40;
        node.vy -= ny * over * K_WALL * ry * 40;
      }
    }

    // 5. Damping + velocity cap + integrate.
    for (const node of simNodes) {
      if (node.pinned) continue;
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      const speed = Math.hypot(node.vx, node.vy);
      if (speed > MAX_SPEED) {
        const s = MAX_SPEED / speed;
        node.vx *= s;
        node.vy *= s;
      }
      node.x += node.vx * dt;
      node.y += node.vy * dt;
    }
  }

  function isSettled() {
    return alpha < 0.005 && !interacting;
  }

  function setPinned(id, pos) {
    const node = byId.get(id);
    if (!node) return;
    if (pos) {
      node.pinned = true;
      node.x = pos.x;
      node.y = pos.y;
      node.vx = 0;
      node.vy = 0;
      interacting = true;
      reheat(0.3);
    } else if (node.pinned) {
      node.pinned = false;
      interacting = false;
    }
  }

  function setDim(predicate) {
    for (const node of simNodes) node.dim = predicate ? predicate(node) : false;
  }

  return {
    nodes: simNodes,
    edges: simEdges,
    step,
    reheat,
    isSettled,
    setPinned,
    setDim,
    getNode: (id) => byId.get(id),
  };
}
