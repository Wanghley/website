// ─── Procedural PCB layout ──────────────────────────────────────────────
// Generates 40–60 component placements + trace routes from a handful of
// placement RULES (MCU centered, a decoupling ring around it, a power
// cluster near the connector, an analog-front-end chain toward the sensor
// pad, an LED cluster, mounting holes in the corners, remaining slots
// filled with passives/vias) rather than hand-authoring every coordinate —
// data/circuitBoard.js did that by hand at 11-component scale; this does
// the same shape of data at 40–60-component scale.
//
// Deterministic: a fixed seed means the layout never shifts between
// reloads (mulberry32, a tiny seeded PRNG — no dependency needed for
// something this small) while still reading as organic rather than a
// perfect grid, via small randomized jitter on top of rule-based anchors.

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GRID = { cols: 18, rows: 12 };

function overlaps(a, b, pad = 0.35) {
  const aw = (a.w ?? a.radius * 2 ?? 0.5) / 2 + pad;
  const ah = (a.h ?? a.radius * 2 ?? 0.5) / 2 + pad;
  const bw = (b.w ?? b.radius * 2 ?? 0.5) / 2 + pad;
  const bh = (b.h ?? b.radius * 2 ?? 0.5) / 2 + pad;
  return Math.abs(a.col - b.col) < aw + bw && Math.abs(a.row - b.row) < ah + bh;
}

function fits(candidate, placed) {
  if (candidate.col < 0.6 || candidate.row < 0.6) return false;
  if (candidate.col > GRID.cols - 0.6 || candidate.row > GRID.rows - 0.6) return false;
  return !placed.some((p) => overlaps(candidate, p));
}

// Simple two-segment orthogonal route between grid points — not full
// obstacle-avoiding pathfinding, but a lightweight collision check picks
// whichever bend order (H-then-V or V-then-H) clears other components,
// which is enough for a stylized board at this density.
function routeBetween(from, to, placed, skipIds) {
  const corner1 = [to.col, from.row];
  const corner2 = [from.col, to.row];
  const crosses = (cx, cy) =>
    placed.some(
      (p) =>
        !skipIds.has(p.id) &&
        Math.abs(p.col - cx) < (p.w ?? p.radius * 2 ?? 0.5) / 2 + 0.15 &&
        Math.abs(p.row - cy) < (p.h ?? p.radius * 2 ?? 0.5) / 2 + 0.15
    );
  const useCorner1 = !crosses(corner1[0], corner1[1]);
  const bend = useCorner1 ? corner1 : corner2;
  return [
    [from.col, from.row],
    bend,
    [to.col, to.row],
  ];
}

export function generatePcbLayout() {
  const rand = mulberry32(2409);
  const jitter = (amount) => (rand() - 0.5) * 2 * amount;

  const components = [];
  const traces = [];
  const center = { col: GRID.cols * 0.52, row: GRID.rows * 0.42 };

  // ── Anchors ──
  const mcu = {
    id: 'U1',
    designator: 'U1',
    label: 'ESP32-S3',
    kind: 'mcu',
    col: center.col,
    row: center.row,
    w: 2.6,
    h: 1.9,
    height: 0.85,
    callout: 'U1 · ESP32-S3 · runs the model',
  };
  components.push(mcu);

  const sensor = {
    id: 'E1',
    designator: 'E1',
    label: 'CAPACITIVE ELECTRODE',
    kind: 'sensor',
    col: center.col - 6.4,
    row: center.row + 1.6,
    radius: 1.5,
    height: 0.15,
    callout: 'E1 · capacitive electrode · reads without contact',
  };
  components.push(sensor);

  const afe = {
    id: 'U2',
    designator: 'U2',
    label: 'ANALOG FRONT-END',
    kind: 'ic',
    col: center.col - 3.3,
    row: center.row + 1.1,
    w: 1.2,
    h: 0.9,
    height: 0.55,
    callout: 'U2 · analog front-end · conditions the signal',
  };
  components.push(afe);

  const powerConnector = {
    id: 'J1',
    designator: 'J1',
    label: 'POWER IN',
    kind: 'connector',
    col: GRID.cols - 2.2,
    row: GRID.rows - 2.6,
    w: 1.1,
    h: 0.9,
    height: 0.5,
    callout: 'J1 · power input',
  };
  components.push(powerConnector);

  const battery = {
    id: 'BT1',
    designator: 'BT1',
    label: 'COIN CELL',
    kind: 'battery',
    col: GRID.cols - 4.4,
    row: GRID.rows - 2.2,
    radius: 1.05,
    height: 0.45,
    callout: 'BT1 · coin-cell backup power',
  };
  components.push(battery);

  // The board's one real display — a small e-paper/OLED showing the last
  // hover-head capture, dithered and cycling (see
  // circuit3d/OledDisplay.js). Was a plain silver "debug header" connector
  // at this same spot/footprint; footprint nudged from the header's 2.8:1
  // strip toward a ~4:3 display aspect (closer to the 128x96 content it
  // now renders), position/height unchanged.
  const display = {
    id: 'DISP1',
    designator: 'DISP1',
    label: 'DISPLAY',
    kind: 'display',
    col: 1.6,
    row: 1.4,
    w: 1.4,
    h: 1.0,
    height: 0.4,
    callout: 'DISP1 · e-paper display · last capture',
  };
  components.push(display);

  // ── Decoupling ring around the MCU ──
  const ringCount = 6;
  for (let i = 0; i < ringCount; i += 1) {
    const angle = (i / ringCount) * Math.PI * 2 + jitter(0.3);
    const radius = 1.9 + jitter(0.25);
    const candidate = {
      id: `C${i + 1}`,
      designator: `C${i + 1}`,
      label: 'DECOUPLING CAP',
      kind: 'passive',
      col: mcu.col + Math.cos(angle) * radius,
      row: mcu.row + Math.sin(angle) * radius,
      w: 0.45,
      h: 0.45,
      height: 0.3,
      callout: `C${i + 1} · decoupling cap`,
    };
    if (fits(candidate, components)) components.push(candidate);
  }

  // ── Analog front-end support passives (R/C around U2) ──
  ['R2', 'R3', 'C7', 'C8'].forEach((id, i) => {
    const angle = (i / 4) * Math.PI * 2 + jitter(0.4);
    const candidate = {
      id,
      designator: id,
      label: id.startsWith('R') ? 'GAIN RESISTOR' : 'FILTER CAP',
      kind: 'passive',
      col: afe.col + Math.cos(angle) * 1.1,
      row: afe.row + Math.sin(angle) * 0.9,
      w: 0.4,
      h: 0.4,
      height: 0.28,
      callout: `${id} · analog front-end ${id.startsWith('R') ? 'resistor' : 'capacitor'}`,
    };
    if (fits(candidate, components)) components.push(candidate);
  });

  // ── Power cluster near the connector ──
  ['C9', 'C10', 'L1'].forEach((id, i) => {
    const candidate = {
      id,
      designator: id,
      label: id.startsWith('L') ? 'POWER INDUCTOR' : 'BULK CAP',
      kind: 'passive',
      col: powerConnector.col - 1.4 - i * 0.9 + jitter(0.15),
      row: powerConnector.row - 0.6 + jitter(0.3),
      w: 0.5,
      h: 0.5,
      height: 0.3,
      callout: `${id} · power supply ${id.startsWith('L') ? 'inductor' : 'capacitor'}`,
    };
    if (fits(candidate, components)) components.push(candidate);
  });

  // ── LED cluster ──
  for (let i = 0; i < 3; i += 1) {
    const candidate = {
      id: `D${i + 1}`,
      designator: `D${i + 1}`,
      label: 'STATUS LED',
      kind: 'led',
      col: GRID.cols - 2.4 + jitter(0.2),
      row: 1.6 + i * 0.9,
      w: 0.4,
      h: 0.4,
      height: 0.25,
      callout: `D${i + 1} · status LED`,
    };
    if (fits(candidate, components)) components.push(candidate);
  }

  // ── Mounting holes (four corners — purely visual, no traces) ──
  const mountMargin = 1;
  [
    [mountMargin, mountMargin],
    [GRID.cols - mountMargin, mountMargin],
    [mountMargin, GRID.rows - mountMargin],
    [GRID.cols - mountMargin, GRID.rows - mountMargin],
  ].forEach(([col, row], i) => {
    components.push({
      id: `MH${i + 1}`,
      designator: '',
      label: 'MOUNTING HOLE',
      kind: 'mount',
      col,
      row,
      radius: 0.35,
      height: 0.05,
    });
  });

  // ── Fill remaining slots with generic passives + vias up to target count ──
  const targetPassives = 26;
  let extraIndex = components.filter((c) => c.kind === 'passive').length + 1;
  let attempts = 0;
  while (
    components.filter((c) => c.kind === 'passive').length < targetPassives &&
    attempts < 400
  ) {
    attempts += 1;
    const candidate = {
      id: `P${extraIndex}`,
      designator: rand() > 0.5 ? `R${extraIndex}` : `C${extraIndex}`,
      label: 'PASSIVE',
      kind: 'passive',
      col: 1 + rand() * (GRID.cols - 2),
      row: 1 + rand() * (GRID.rows - 2),
      w: 0.35,
      h: 0.35,
      height: 0.22,
    };
    if (fits(candidate, components)) {
      components.push(candidate);
      extraIndex += 1;
    }
  }

  // ── Ground-stitch vias, scattered near the board edges ──
  const vias = [];
  for (let i = 0; i < 60; i += 1) {
    const edge = Math.floor(rand() * 4);
    let col;
    let row;
    if (edge === 0) { col = 0.6 + rand() * (GRID.cols - 1.2); row = 0.6 + rand() * 1.2; }
    else if (edge === 1) { col = 0.6 + rand() * (GRID.cols - 1.2); row = GRID.rows - 0.6 - rand() * 1.2; }
    else if (edge === 2) { col = 0.6 + rand() * 1.2; row = 0.6 + rand() * (GRID.rows - 1.2); }
    else { col = GRID.cols - 0.6 - rand() * 1.2; row = 0.6 + rand() * (GRID.rows - 1.2); }
    vias.push({ col, row });
  }

  // ── Traces ──
  const skip = new Set(['MH1', 'MH2', 'MH3', 'MH4']);
  const connectTo = (comp, target = mcu, powered = false, toSensor = false) => {
    traces.push({
      id: `t-${comp.id}`,
      from: comp.id,
      to: target.id,
      powered,
      toSensor,
      points: routeBetween(comp, target, components, skip),
    });
  };

  components.forEach((c) => {
    if (c.id === mcu.id || c.kind === 'mount') return;
    if (c.id === sensor.id) return; // routed explicitly via the AFE below
    if (c.id === afe.id) {
      connectTo(afe, mcu, false, true);
      return;
    }
    if (c.id === powerConnector.id || c.id === battery.id) {
      connectTo(c, mcu, true);
      return;
    }
    connectTo(c, mcu, false);
  });
  // Sensor connects through the analog front-end, not straight to the MCU.
  traces.push({
    id: 't-E1',
    from: afe.id,
    to: sensor.id,
    toSensor: true,
    points: routeBetween(afe, sensor, components, skip),
  });

  return { components, traces, vias, mcu, sensor, grid: GRID };
}
