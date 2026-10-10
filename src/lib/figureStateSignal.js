// Plain mutable singleton — same pattern as proximitySignal/sensorSignal/
// sourceCaptureSignal/holoGlitchSignal, all in this same directory. Bridges
// three independent R3F components that have no other reason to know about
// each other:
//
//   - CircuitBoardR3F.js's BoardHoverTrigger writes `hoverTarget`: a
//     debounced boolean, true while the pointer has been resting on the
//     board OR the figure for >=120ms (see that file for why the raycast
//     targets both in one shot).
//   - CharacterHead.js reads `hoverTarget` to drive its own `t` (0 =
//     hologram head, 1 = full-color figure), and writes `t`/`state` back
//     out every frame, plus `groupLocalPos`/`groupLocalScale` — the
//     figure's OWN group transform, in the same local space its sibling
//     components (SourceCaptures, SensorElectrode) already render in
//     (everything in Scene() shares the same TiltGroup + board-offset
//     group ancestors), so those siblings can track the figure without
//     needing true world-matrix math of their own.
//   - SensorElectrode.js reads `t` to collapse its projection cone into a
//     platform glow as the figure completes.
//   - SourceCaptures.js reads `t`/`groupLocalPos`/`groupLocalScale` to
//     anchor its photo ring on the figure's current head position and to
//     gate its own open-trigger to "fully materialized," instead of the
//     old plain head-hover dwell.
//   - bits/OscilloscopeReadout.js reads `state` for the HUD line.
export const figureStateSignal = {
  hoverTarget: false,
  t: 0,
  state: 'hologram', // 'hologram' | 'materializing' | 'figure' | 'dissolving'
  groupLocalPos: { x: 0, y: 0, z: 0 },
  groupLocalScale: 0,
};
