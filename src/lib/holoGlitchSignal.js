// Shared mutable signal, same pattern as proximitySignal.js: CharacterHead
// is the source of truth for the hologram's glitch timing (it owns the
// schedule — see its glitchRef), and SensorElectrode reads this each frame
// to pulse the electrode rings/projection cone in sync with the head's
// flicker, without prop-drilling a ref between two sibling components.
export const holoGlitchSignal = { active: false };
