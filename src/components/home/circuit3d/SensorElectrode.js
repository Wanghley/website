import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { proximitySignal } from '../../../lib/proximitySignal';
import { holoGlitchSignal } from '../../../lib/holoGlitchSignal';
import { sensorSignal } from '../../../lib/sensorSignal';
import { figureStateSignal } from '../../../lib/figureStateSignal';

const GOLD = '#C99A4A'; // brand orange desaturated ~40%, ENIG-finish gold
const HOLO_BLUE = '#3AAFF1';

// Scratch vector for the world-position→screen-space projection below —
// module-scope and reused every frame rather than allocated per-frame,
// same precedent as CharacterHead.js's own tmpWorldPos.
const tmpWorldPos = new THREE.Vector3();

// The projection cone's footprint at the pad roughly matches the guard
// ring's own radius (1.32, below) so the beam reads as emanating from the
// whole electrode, not a pinprick; it narrows toward the head's base.
const CONE_BASE_RADIUS = 1.3;
const CONE_TOP_RADIUS = 0.24;

function buildConeGeometry(height) {
  // openEnded: true — a beam, not a solid capped cylinder. Translated so
  // the geometry's local origin is the base (y=0) rather than three's
  // default vertical centering, matching how this group's other elements
  // are positioned relative to the pad.
  const geometry = new THREE.CylinderGeometry(CONE_TOP_RADIUS, CONE_BASE_RADIUS, height, 28, 1, true);
  geometry.translate(0, height / 2, 0);
  return geometry;
}

// Minimal custom shader rather than onBeforeCompile-patching a built-in
// material: the cone only needs a height-based opacity falloff (bright at
// the pad, transparent at the top) plus the same upward-scrolling scan
// lines as CharacterHead's hologram material — cheap enough to write
// directly rather than fight a lighting model this element doesn't need.
function buildConeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(HOLO_BLUE) },
      uHeight: { value: 1 },
      uBottomOpacity: { value: 0.2 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying float vLocalY;
      void main() {
        vLocalY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uHeight;
      uniform float uBottomOpacity;
      uniform float uTime;
      varying float vLocalY;
      void main() {
        float t = clamp(vLocalY / uHeight, 0.0, 1.0);
        float fade = uBottomOpacity * (1.0 - t);
        float band = mod(floor((vLocalY - uTime * 0.9) * 9.0), 5.0);
        float scan = band < 2.0 ? 1.15 : 0.9;
        gl_FragColor = vec4(uColor, fade * scan);
      }
    `,
  });
}

// The one hand-detailed object on the board, per spec — an interdigitated
// comb approximated as concentric partial rings (cheap, reads as "etched
// spiral pad" at the board's actual on-screen scale) inside a guard ring,
// plus the expanding field-line rings and the hologram projection cone
// rising toward CharacterHead.
// reducedMotion isn't threaded through internally: useCanRender3D() already
// routes reduced-motion visitors to the SVG board entirely, so this
// component only ever mounts for visitors who get the full animation —
// see CharacterHead.js (which the electrode's glitch sync depends on) for
// the same reasoning spelled out where it actually matters.
export default function SensorElectrode({ position, tetherHeight = 0 }) {
  const groupRef = useRef(null);
  const ringRefs = useRef([]);
  const coreRef = useRef(null);
  const coneMaterialRef = useRef(null);
  const coneMeshRef = useRef(null);
  const poolMaterialRef = useRef(null);

  const coneGeometry = useMemo(() => (tetherHeight > 0 ? buildConeGeometry(tetherHeight) : null), [tetherHeight]);
  const coneMaterial = useMemo(() => (tetherHeight > 0 ? buildConeMaterial() : null), [tetherHeight]);

  // Nothing left publishing real coordinates once this unmounts —
  // HeroChamber.js's pointer effect must fall back to its own tuned
  // approximation, not stale numbers (same discipline CharacterHead.js's
  // headSignal cleanup used to follow).
  useEffect(() => () => {
    sensorSignal.ready = false;
  }, []);

  useFrame((state) => {
    const p = proximitySignal.value;
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const base = 0.9 + i * 0.55;
      const scale = base + p * (1.6 + i * 0.9);
      mesh.scale.setScalar(scale);
      mesh.material.opacity = Math.max(0, p * (0.32 - i * 0.09));
    });

    // Electrode core + guard-adjacent rings pulse in sync with the head's
    // glitch (holoGlitchSignal, written by CharacterHead) — a brief bright
    // pop rather than the smooth proximity-driven brightening the rest of
    // the frame already does.
    const glitchBoost = holoGlitchSignal.active ? 1.8 : 1;
    if (coreRef.current) {
      coreRef.current.emissiveIntensity = (0.6 + p * 2.4) * glitchBoost;
    }

    if (tetherHeight > 0 && coneMaterialRef.current) {
      coneMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      coneMaterialRef.current.uniforms.uBottomOpacity.value = (0.08 + p * 0.32) * glitchBoost;
    }
    // Tenth pass: as the hologram head materializes into the full figure
    // (figureStateSignal.t -> 1), the beam collapses down into a flat
    // platform glow under its feet instead of still reaching up to a head
    // that's no longer floating there — scaling the MESH (not rebuilding
    // the geometry) about its own base-anchored origin (see
    // buildConeGeometry's translate call), so this is one cheap per-frame
    // assignment, not a geometry rebuild.
    if (tetherHeight > 0 && coneMeshRef.current) {
      const ft = figureStateSignal.t;
      coneMeshRef.current.scale.set(1 + ft * 0.5, Math.max(0.02, 1 - ft), 1 + ft * 0.5);
    }
    if (poolMaterialRef.current) {
      poolMaterialRef.current.opacity = (0.08 + p * 0.22) * glitchBoost;
    }

    // Publish the pad's real on-screen position for HeroChamber.js's
    // proximity calc (src/lib/sensorSignal.js) — every frame, mirroring
    // CharacterHead.js's own headSignal-style projection. This group sits
    // under TiltGroup + the board's outer offset group (CircuitBoardR3F.js),
    // so the full world matrix is needed, not the raw `position` prop.
    if (groupRef.current) {
      groupRef.current.updateWorldMatrix(true, false);
      tmpWorldPos.setFromMatrixPosition(groupRef.current.matrixWorld);
      tmpWorldPos.project(state.camera);
      sensorSignal.x = (tmpWorldPos.x * 0.5 + 0.5) * state.size.width;
      sensorSignal.y = (1 - (tmpWorldPos.y * 0.5 + 0.5)) * state.size.height;
      sensorSignal.ready = true;
    }
  });

  const combRadii = [0.35, 0.55, 0.75, 0.95, 1.15];

  return (
    <group ref={groupRef} position={position}>
      {/* Guard ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[1.25, 1.32, 48]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.2} />
      </mesh>

      {/* Interdigitated comb, approximated as alternating partial rings */}
      {combRadii.map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, i % 2 === 0 ? 0 : Math.PI]} position={[0, 0.012, 0]}>
          <ringGeometry args={[r - 0.06, r, 40, 1, 0, Math.PI * 1.7]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* Center pad — the emissive core, brightens sharply with proximity
          and pops with the head's glitch. */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
        <meshStandardMaterial ref={coreRef} color={HOLO_BLUE} emissive={HOLO_BLUE} emissiveIntensity={0.6} metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Field-line rings — invisible at rest, expand + brighten with proximity */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.03, 0]}
        >
          <ringGeometry args={[1, 1.04, 48]} />
          <meshBasicMaterial color={HOLO_BLUE} transparent opacity={0} />
        </mesh>
      ))}

      {/* Soft light pool under the cone, so the board and the projected
          head read as sharing one light source. Not a real light (cheap,
          always-camera-facing decal) — the pointLight below is the actual
          illumination. */}
      {tetherHeight > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
          <circleGeometry args={[CONE_BASE_RADIUS * 1.4, 32]} />
          <meshBasicMaterial
            ref={poolMaterialRef}
            color={HOLO_BLUE}
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Projection cone — replaces the old flat ring-stack tether. Holo­
          grams don't cast/receive shadows, so this intentionally carries
          no shadow props. */}
      {tetherHeight > 0 && coneGeometry && coneMaterial && (
        <mesh ref={coneMeshRef} geometry={coneGeometry}>
          <primitive object={coneMaterial} ref={coneMaterialRef} attach="material" />
        </mesh>
      )}

      {tetherHeight > 0 && (
        <pointLight position={[0, 0.6, 0]} color={HOLO_BLUE} intensity={0.6} distance={4} decay={2} />
      )}
    </group>
  );
}
