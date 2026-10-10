// Shared mutable signal, same pattern as proximitySignal.js/holoGlitchSignal.js
// — SensorElectrode.js is the source of truth for where the sensor pad
// actually sits on screen (it owns the mesh's world position), and
// HeroChamber.js's pointermove handler reads this every frame to compute
// proximity against the pad's REAL projected position instead of a
// hardcoded percentage DOM anchor (the root cause of the "tracking freezes"
// bug — see HeroChamber.js's pointer-effect comment for the full story).
//
// `ready` is false whenever nothing is actively publishing real coordinates
// — the SVG fallback board, reduced motion, or the R3F chunk not yet
// mounted. Consumers must fall back to their own approximation in that case
// rather than trusting stale x/y left over from a previous mount.
export const sensorSignal = {
  ready: false,
  x: 0,
  y: 0,
};
