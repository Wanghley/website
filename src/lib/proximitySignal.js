// ─── Proximity signal singleton ────────────────────────────────────────────
// Mirrors lib/scrollSignal.js's pattern exactly: a plain mutable object, not
// React state — read directly inside rAF loops / gsap.ticker callbacks by
// consumers that have no direct relationship to each other in the component
// tree (CircuitBoardScene's own CSS-var-driven visuals, and the HUD
// oscilloscope readout in HeroChamber.js). Avoids both prop drilling and a
// React re-render on every pointermove, which neither consumer needs —
// they each read the latest value on their own schedule.
//
// nx/ny are the lerped, WINDOW-normalized cursor direction (-1..1 across
// the full viewport) — added so CharacterHead.js's head yaw/pitch follow
// can track the cursor everywhere on the page, not just over the R3F
// canvas. R3F's own `state.pointer` is canvas-local and simply stops
// updating once the cursor leaves the canvas element, which is what made
// the head "snap forward and stop tracking" outside the board's bounds.
export const proximitySignal = {
  // 0 (cursor far from the sensor pad, or hero not hovered) .. 1 (touching it)
  value: 0,
  nx: 0,
  ny: 0,
};
