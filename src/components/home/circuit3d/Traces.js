import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { proximitySignal } from '../../../lib/proximitySignal';

// World-space convention shared by every circuit3d/* component: grid
// column -> world X, grid row -> world Z, "height"/extrusion -> world Y.
// The substrate's top face sits at Y = 0 (see BoardMesh.js) so anything
// drawn at y >= 0 sits on or above the board.
const TRACE_Y = 0.015;
const TRACE_WIDTH = 0.09;
const TRACE_HEIGHT = 0.02;

function Segment({ from, to, revealAt }) {
  const meshRef = useRef(null);
  const litRef = useRef(null);

  const { length, angle, midX, midZ } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    return {
      length: Math.hypot(dx, dz),
      angle: Math.atan2(dz, dx),
      midX: (from[0] + to[0]) / 2,
      midZ: (from[1] + to[1]) / 2,
    };
  }, [from, to]);

  useFrame(() => {
    const p = proximitySignal.value;
    const lit = Math.min(1, Math.max(0, (p - revealAt) * 5));
    if (litRef.current) {
      litRef.current.emissiveIntensity = lit * 3;
      litRef.current.opacity = lit;
    }
  });

  if (length < 0.001) return null;

  return (
    <group position={[midX, TRACE_Y, midZ]} rotation={[0, -angle, 0]}>
      {/* Unlit copper — always visible, faint metal under the mask. */}
      <mesh castShadow>
        <boxGeometry args={[length, TRACE_HEIGHT, TRACE_WIDTH]} />
        <meshStandardMaterial color="#2A4A6B" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Lit overlay — emissive intensity ramps with proximity, this is
          what the bloom pass picks up. Rendered as a hair-thin transparent
          box floating just above the copper strip. */}
      <mesh position={[0, TRACE_HEIGHT, 0]} ref={meshRef}>
        <boxGeometry args={[length, TRACE_HEIGHT * 0.6, TRACE_WIDTH * 0.7]} />
        <meshStandardMaterial
          ref={litRef}
          color="#3AAFF1"
          emissive="#3AAFF1"
          emissiveIntensity={0}
          transparent
          opacity={0}
          metalness={0.2}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default function Traces({ traces }) {
  return (
    <>
      {traces.map((t, ti) => {
        const revealAt = (ti / traces.length) * 0.6;
        return t.points.slice(0, -1).map((pt, i) => (
          <Segment
            key={`${t.id}-${i}`}
            from={pt}
            to={t.points[i + 1]}
            revealAt={t.toSensor || t.powered ? revealAt * 0.5 : revealAt}
          />
        ));
      })}
    </>
  );
}
