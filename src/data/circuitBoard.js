// ─── Circuit board data — drives CircuitBoardScene.js ──────────────────────
// Plain data in isometric GRID units (col, row), not pixels — the renderer
// converts through iso() at render time (see CircuitBoardScene.js), so
// nothing here needs manual pixel arithmetic. Mirrors the data/signalChain.js
// split: this file owns "what's on the board," the component owns "how to
// draw it."

export const BOARD = {
  cols: 11,
  rows: 7,
  thickness: 16, // px extrusion depth of the substrate slab, in screen space
};

export const BOARD_LABEL = 'WSM-REV-A';
export const SENSOR_ID = 'E1';
export const POWER_ID = 'J1';

// kind drives the footprint shape + color in CircuitBoardScene:
//  'mcu'       — largest rectangular IC, silkscreen part name shown
//  'ic'        — smaller rectangular IC
//  'passive'   — small square (cap/resistor)
//  'led'       — small square, glows when lit
//  'connector' — rectangular header
//  'battery'   — circular coin-cell footprint
//  'sensor'    — the capacitive electrode: a flat spiral/circular copper pad,
//                the proximity focal point (see SENSOR_ID above)
export const COMPONENTS = [
  { id: 'U1', designator: 'U1', label: 'ESP32-S3', kind: 'mcu', col: 6, row: 2, w: 2, h: 1.4, height: 10, callout: 'U1 · ESP32-S3 · runs the model' },
  { id: 'E1', designator: 'E1', label: 'CAPACITIVE ELECTRODE', kind: 'sensor', col: 2, row: 4.5, radius: 1.15, height: 2, callout: 'E1 · capacitive electrode · reads without contact' },
  { id: 'U2', designator: 'U2', label: 'ANALOG FRONT-END', kind: 'ic', col: 3.3, row: 3.7, w: 1, h: 0.8, height: 8, callout: 'U2 · analog front-end · conditions the signal' },
  { id: 'C1', designator: 'C1', label: 'DECOUPLING CAP', kind: 'passive', col: 4.6, row: 1.4, w: 0.5, h: 0.5, height: 6, callout: 'C1 · decoupling cap' },
  { id: 'C2', designator: 'C2', label: 'FILTER CAP', kind: 'passive', col: 8, row: 3, w: 0.5, h: 0.5, height: 6, callout: 'C2 · filter cap' },
  { id: 'C3', designator: 'C3', label: 'BYPASS CAP', kind: 'passive', col: 3, row: 2.1, w: 0.5, h: 0.5, height: 6, callout: 'C3 · bypass cap' },
  { id: 'R1', designator: 'R1', label: 'PULL-UP', kind: 'passive', col: 6.6, row: 4.2, w: 0.6, h: 0.35, height: 4, callout: 'R1 · pull-up resistor' },
  { id: 'D1', designator: 'D1', label: 'STATUS LED', kind: 'led', col: 9, row: 1.4, w: 0.5, h: 0.5, height: 5, callout: 'D1 · status LED' },
  { id: 'J1', designator: 'J1', label: 'POWER IN', kind: 'connector', col: 9.4, row: 5.2, w: 1, h: 0.8, height: 8, callout: 'J1 · power input' },
  { id: 'J2', designator: 'J2', label: 'DEBUG HEADER', kind: 'connector', col: 1, row: 1, w: 1.4, h: 0.5, height: 6, callout: 'J2 · debug header' },
  { id: 'BT1', designator: 'BT1', label: 'COIN CELL', kind: 'battery', col: 7.6, row: 5.6, radius: 0.9, height: 7, callout: 'BT1 · coin-cell backup power' },
];

// Waypoints in grid units — 45°/90° iso bends only, no diagonal-through-
// components. `powered` traces light first (from the power connector) in
// the boot sequence; `toSensor` traces are the ones the boot/pulse system
// treats as running "toward" the sensor pad.
export const TRACES = [
  { id: 't1', from: 'J1', to: 'U1', powered: true, points: [[9.4, 5.2], [9.4, 3], [6, 3], [6, 2]] },
  { id: 't2', from: 'U1', to: 'U2', toSensor: true, points: [[6, 2], [3.3, 2], [3.3, 3.7]] },
  { id: 't3', from: 'U2', to: 'E1', toSensor: true, points: [[3.3, 3.7], [2, 3.7], [2, 4.5]] },
  { id: 't4', from: 'U1', to: 'C1', points: [[6, 2], [4.6, 2], [4.6, 1.4]] },
  { id: 't5', from: 'U1', to: 'C2', points: [[6, 2], [8, 2], [8, 3]] },
  { id: 't6', from: 'U1', to: 'C3', points: [[6, 2], [3, 2], [3, 2.1]] },
  { id: 't7', from: 'U1', to: 'R1', points: [[6, 2], [6.6, 2], [6.6, 4.2]] },
  { id: 't8', from: 'U1', to: 'D1', points: [[6, 2], [9, 2], [9, 1.4]] },
  { id: 't9', from: 'U1', to: 'J2', points: [[6, 2], [1, 2], [1, 1]] },
  { id: 't10', from: 'J1', to: 'BT1', powered: true, points: [[9.4, 5.2], [7.6, 5.2], [7.6, 5.6]] },
];
