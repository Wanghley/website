import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { benchState, smoothstep } from '../../../lib/benchState';

// The capacitive electrode: a concentric copper coil in a guard ring.
// It is the one object whose brightness answers the cursor: the copper
// gets emissive as proximity rises, and thin signal-blue field rings
// expand outward (the field the hand disturbs).
const RADII = [0.35, 0.55, 0.75, 0.95, 1.15];

export default function Coil({ position }) {
  const matsRef = useRef([]);
  const ringRefs = useRef([]);
  const coreRef = useRef(null);

  useFrame(() => {
    const p = benchState.p;
    matsRef.current.forEach((m, i) => {
      if (!m) return;
      // coil lights from the centre outward as the hand approaches
      const k = smoothstep(i * 0.12, 0.5 + i * 0.1, p);
      m.emissiveIntensity = 0.05 + k * 1.5;
    });
    if (coreRef.current) coreRef.current.emissiveIntensity = 0.3 + p * 2.2;
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = (benchState.t * 0.5 + i / 3) % 1;
      const r = 1.3 + phase * (0.8 + p * 1.6);
      mesh.scale.setScalar(r);
      mesh.material.opacity = p * 0.35 * (1 - phase);
    });
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.25, 1.33, 56]} />
        <meshStandardMaterial color="#D9853B" metalness={0.95} roughness={0.28} />
      </mesh>
      {RADII.map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, i % 2 ? Math.PI : 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[r - 0.07, r, 44, 1, 0, Math.PI * 1.7]} />
          <meshStandardMaterial
            ref={(m) => { matsRef.current[i] = m; }}
            color="#D9853B"
            emissive="#F0A460"
            emissiveIntensity={0.05}
            metalness={0.95}
            roughness={0.28}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
        <meshStandardMaterial
          ref={coreRef}
          color="#3AAFF1"
          emissive="#3AAFF1"
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { ringRefs.current[i] = el; }} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
          <ringGeometry args={[0.985, 1, 64]} />
          <meshBasicMaterial color="#3AAFF1" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
