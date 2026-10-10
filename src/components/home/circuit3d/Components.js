import React, { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { proximitySignal } from '../../../lib/proximitySignal';
import OledDisplay from './OledDisplay';

const GOLD = '#C99A4A'; // brand orange (#F5A623) desaturated ~40%, per the ENIG-finish spec

// ── Instanced small parts — passives, their end-caps, mounting holes, and
// ground-stitch vias all repeat dozens of times; one draw call per kind
// instead of one mesh per part keeps 40-60 components + ~60 vias cheap. ──

function InstancedBoxes({ items, size, color, metalness, roughness, yOffset = 0 }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    items.forEach((it, i) => {
      m.makeTranslation(it.col, (it.height ?? size[1]) / 2 + yOffset, it.row);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items, size, yOffset]);

  if (items.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  );
}

function InstancedVias({ vias }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || !vias.length) return;
    const m = new THREE.Matrix4();
    vias.forEach((v, i) => {
      m.makeTranslation(v.col, 0.012, v.row);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [vias]);

  if (!vias.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, vias.length]} receiveShadow>
      <cylinderGeometry args={[0.09, 0.09, 0.02, 10]} />
      <meshStandardMaterial color="#B0B0B0" metalness={0.85} roughness={0.35} />
    </instancedMesh>
  );
}

function IcPins({ comp }) {
  const count = 8;
  const pins = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    const side = Math.floor(t * 4);
    const along = (t * 4) % 1;
    let x = 0;
    let z = 0;
    const hw = comp.w / 2 + 0.04;
    const hd = comp.h / 2 + 0.04;
    if (side === 0) { x = -comp.w / 2 + along * comp.w; z = -hd; }
    else if (side === 1) { x = hw; z = -comp.h / 2 + along * comp.h; }
    else if (side === 2) { x = comp.w / 2 - along * comp.w; z = hd; }
    else { x = -hw; z = comp.h / 2 - along * comp.h; }
    pins.push([x, z]);
  }
  return (
    <group>
      {pins.map(([x, z], i) => (
        <mesh key={i} position={[comp.col + x, 0.05, comp.row + z]}>
          <boxGeometry args={[0.06, 0.03, 0.14]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Led({ comp }) {
  const matRef = useRef(null);
  useFrame(() => {
    const p = proximitySignal.value;
    const stagger = (comp.id.charCodeAt(comp.id.length - 1) % 3) * 0.15;
    const wave = Math.max(0, Math.min(1, (p - stagger) * 3));
    if (matRef.current) matRef.current.emissiveIntensity = 0.4 + wave * 2.2;
  });
  return (
    <mesh position={[comp.col, comp.height / 2, comp.row]} castShadow>
      <boxGeometry args={[comp.w, comp.height * 0.4, comp.h]} />
      <meshStandardMaterial ref={matRef} color="#6FCF97" emissive="#6FCF97" emissiveIntensity={0.4} />
    </mesh>
  );
}

function NamedComponent({ comp }) {
  if (comp.kind === 'led') return <Led comp={comp} />;

  // Before the generic connector/mcu-fallthrough branches below — a new
  // `kind` would otherwise fall through to the mcu/ic default, since the
  // `named` filter above only excludes passive/mount/sensor.
  if (comp.kind === 'display') return <OledDisplay comp={comp} />;

  if (comp.kind === 'battery') {
    return (
      <mesh position={[comp.col, comp.height / 2, comp.row]} castShadow receiveShadow>
        <cylinderGeometry args={[comp.radius, comp.radius, comp.height * 0.3, 24]} />
        <meshStandardMaterial color="#C8C8CC" metalness={1} roughness={0.3} />
      </mesh>
    );
  }

  if (comp.kind === 'connector') {
    return (
      <mesh position={[comp.col, comp.height / 2, comp.row]} castShadow receiveShadow>
        <boxGeometry args={[comp.w, comp.height * 0.6, comp.h]} />
        <meshStandardMaterial color="#B8BCC2" metalness={1} roughness={0.35} />
      </mesh>
    );
  }

  // mcu + ic
  return (
    <group>
      <mesh position={[comp.col, comp.height / 2, comp.row]} castShadow receiveShadow>
        <boxGeometry args={[comp.w, comp.height * 0.55, comp.h]} />
        <meshStandardMaterial color="#0A0D12" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Laser-etched marking + pin-1 dot */}
      <mesh position={[comp.col, comp.height * 0.55 + 0.005, comp.row]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[comp.w * 0.6, comp.h * 0.3]} />
        <meshStandardMaterial color="#4A4E58" roughness={0.6} />
      </mesh>
      <mesh position={[comp.col - comp.w / 2 + 0.1, comp.height * 0.55 + 0.006, comp.row - comp.h / 2 + 0.1]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#8A8E98" />
      </mesh>
      <IcPins comp={comp} />
    </group>
  );
}

export default function Components({ components, vias }) {
  const passives = components.filter((c) => c.kind === 'passive');
  const mounts = components.filter((c) => c.kind === 'mount');
  const named = components.filter((c) => !['passive', 'mount', 'sensor'].includes(c.kind));

  return (
    <group>
      <InstancedBoxes items={passives} size={[0.32, 0.28, 0.32]} color="#1c1f26" metalness={0.1} roughness={0.6} />
      {/* End-caps: two per passive, offset along X — a cheap approximation
          of a ceramic body with metallic terminals rather than separate
          per-part geometry. */}
      <InstancedBoxes
        items={passives.flatMap((p) => [
          { col: p.col - 0.13, row: p.row, height: p.height },
          { col: p.col + 0.13, row: p.row, height: p.height },
        ])}
        size={[0.07, 0.3, 0.34]}
        color="#C8C8CC"
        metalness={1}
        roughness={0.25}
      />
      <InstancedBoxes items={mounts} size={[0.5, 0.05, 0.5]} color="#05070a" metalness={0} roughness={1} />
      <InstancedVias vias={vias} />
      {named.map((c) => (
        <NamedComponent key={c.id} comp={c} />
      ))}
    </group>
  );
}
