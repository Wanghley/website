// Shared mutable signal, same pattern as proximitySignal.js/holoGlitchSignal.js
// — circuit3d/SourceCaptures.js (the hover-head photo ring) is the source
// of truth for whether the ring is open and which capture is frontmost,
// and two OTHER components need to react to that without prop-drilling
// through Scene: CharacterHead.js de-rezzes while `open`, and
// bits/OscilloscopeReadout.js swaps its HUD text to `SRC 0X/08` while open.
export const sourceCaptureSignal = {
  open: false,
  index: 0,
  count: 8,
};
