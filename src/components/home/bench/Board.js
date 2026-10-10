import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GRID } from '../../../lib/pcbLayout';
import { benchState } from '../../../lib/benchState';

// The board: graphite solder mask, copper-pour hatch, silkscreen, tin/gold
// pads. Materials are real PBR (metalness + roughness) so the copper key
// light and blue rim light read as studio light on a physical object.

const TEX = 1024;
const SILK = new Set(['U1', 'U2', 'E1', 'J1', 'BT1']);
const COPPER = '#D9853B';
const TIN = '#C9C6BF';

function useMaskTexture(components) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = TEX;
    c.height = TEX;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#26272A';
    ctx.fillRect(0, 0, TEX, TEX);
    // ground-pour hatch, very low contrast copper
    ctx.strokeStyle = 'rgba(217, 133, 59, 0.07)';
    ctx.lineWidth = 1;
    for (let i = -TEX; i < TEX * 2; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + TEX, TEX);
      ctx.stroke();
    }
    // board outline in silkscreen
    ctx.strokeStyle = 'rgba(242, 239, 233, 0.22)';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, TEX - 28, TEX - 28);
    const px = (col, row) => [(col / GRID.cols) * TEX, (row / GRID.rows) * TEX];
    ctx.fillStyle = 'rgba(242, 239, 233, 0.6)';
    ctx.font = '500 17px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    components.forEach((cmp) => {
      if (!SILK.has(cmp.id)) return;
      const [x, y] = px(cmp.col, cmp.row + (cmp.h ?? cmp.radius ?? 0.5) / 2 + 0.5);
      ctx.fillText(cmp.designator, x, y);
    });
    ctx.textAlign = 'left';
    ctx.font = '500 20px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(242, 239, 233, 0.38)';
    ctx.fillText('WSM-REV-A · SENSE → CONDITION → INFER', TEX * 0.04, TEX * 0.965);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [components]);
}

function Substrate({ components }) {
  const map = useMaskTexture(components);
  const w = GRID.cols;
  const d = GRID.rows;
  const th = 0.6;
  return (
    <group position={[w / 2, -th / 2, d / 2]}>
      <mesh position={[0, th / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshPhysicalMaterial map={map} roughness={0.55} metalness={0.05} clearcoat={0.2} clearcoatRoughness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, th, d]} />
        <meshStandardMaterial color="#2B2C2E" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* copper edge plating */}
      <mesh position={[0, th * 0.12, 0]}>
        <boxGeometry args={[w + 0.02, th * 0.14, d + 0.02]} />
        <meshStandardMaterial color={COPPER} roughness={0.35} metalness={0.9} />
      </mesh>
    </group>
  );
}

function Instanced({ items, size, color, metalness, roughness }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    items.forEach((it, i) => {
      m.makeTranslation(it.col, (it.height ?? size[1]) / 2, it.row);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items, size]);
  if (!items.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  );
}

function Vias({ vias }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    vias.forEach((v, i) => {
      m.makeTranslation(v.col, 0.02, v.row);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [vias]);
  if (!vias.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, vias.length]}>
      <cylinderGeometry args={[0.09, 0.09, 0.03, 10]} />
      <meshStandardMaterial color={COPPER} metalness={0.9} roughness={0.35} />
    </instancedMesh>
  );
}

function Pins({ comp }) {
  const pins = [];
  const n = 12;
  for (let i = 0; i < n; i += 1) {
    const side = Math.floor((i / n) * 4);
    const a = ((i / n) * 4) % 1;
    const hw = comp.w / 2 + 0.05;
    const hd = comp.h / 2 + 0.05;
    let x = 0;
    let z = 0;
    if (side === 0) { x = -comp.w / 2 + a * comp.w; z = -hd; }
    else if (side === 1) { x = hw; z = -comp.h / 2 + a * comp.h; }
    else if (side === 2) { x = comp.w / 2 - a * comp.w; z = hd; }
    else { x = -hw; z = comp.h / 2 - a * comp.h; }
    pins.push([x, z]);
  }
  return (
    <group>
      {pins.map(([x, z], i) => (
        <mesh key={i} position={[comp.col + x, 0.05, comp.row + z]}>
          <boxGeometry args={[0.07, 0.03, 0.15]} />
          <meshStandardMaterial color={TIN} metalness={1} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Led({ comp }) {
  const ref = useRef(null);
  useFrame(() => {
    if (ref.current) ref.current.emissiveIntensity = 0.12 + benchState.p * 1.2;
  });
  return (
    <mesh position={[comp.col, comp.height / 2, comp.row]} castShadow>
      <boxGeometry args={[comp.w, comp.height * 0.6, comp.h]} />
      <meshStandardMaterial ref={ref} color="#6FCF97" emissive="#6FCF97" emissiveIntensity={0.15} roughness={0.4} />
    </mesh>
  );
}

function Named({ comp }) {
  if (comp.kind === 'led') return <Led comp={comp} />;
  const y = comp.height / 2;
  if (comp.kind === 'battery') {
    return (
      <mesh position={[comp.col, y, comp.row]} castShadow receiveShadow>
        <cylinderGeometry args={[comp.radius, comp.radius, comp.height * 0.5, 28]} />
        <meshStandardMaterial color="#B9BCC2" metalness={1} roughness={0.32} />
      </mesh>
    );
  }
  if (comp.kind === 'connector') {
    return (
      <mesh position={[comp.col, y, comp.row]} castShadow receiveShadow>
        <boxGeometry args={[comp.w, comp.height * 0.8, comp.h]} />
        <meshStandardMaterial color="#B9BCC2" metalness={1} roughness={0.38} />
      </mesh>
    );
  }
  if (comp.kind === 'display') {
    return (
      <group>
        <mesh position={[comp.col, y, comp.row]} castShadow receiveShadow>
          <boxGeometry args={[comp.w, comp.height * 0.7, comp.h]} />
          <meshStandardMaterial color="#0B0C0D" roughness={0.25} metalness={0.3} />
        </mesh>
        <mesh position={[comp.col, comp.height * 0.7 + 0.004, comp.row]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[comp.w * 0.84, comp.h * 0.8]} />
          <meshStandardMaterial color="#2A2B2D" roughness={0.2} metalness={0.2} />
        </mesh>
      </group>
    );
  }
  // mcu + ic
  return (
    <group>
      <mesh position={[comp.col, y, comp.row]} castShadow receiveShadow>
        <boxGeometry args={[comp.w, comp.height * 0.7, comp.h]} />
        <meshStandardMaterial color="#0C0D0E" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[comp.col, comp.height * 0.7 + 0.004, comp.row]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[comp.w * 0.62, comp.h * 0.3]} />
        <meshStandardMaterial color="#4A4B4E" roughness={0.6} />
      </mesh>
      <Pins comp={comp} />
    </group>
  );
}

export default function Board({ layout }) {
  const { components, vias } = layout;
  const passives = components.filter((c) => c.kind === 'passive');
  const mounts = components.filter((c) => c.kind === 'mount');
  const named = components.filter((c) => !['passive', 'mount', 'sensor'].includes(c.kind));
  return (
    <group>
      <Substrate components={components} />
      <Instanced items={passives} size={[0.34, 0.28, 0.34]} color="#17181A" metalness={0.1} roughness={0.55} />
      <Instanced
        items={passives.flatMap((p) => [
          { col: p.col - 0.14, row: p.row, height: p.height },
          { col: p.col + 0.14, row: p.row, height: p.height },
        ])}
        size={[0.07, 0.3, 0.36]}
        color={TIN}
        metalness={1}
        roughness={0.28}
      />
      <Instanced items={mounts} size={[0.5, 0.05, 0.5]} color="#070708" metalness={0} roughness={1} />
      <Vias vias={vias} />
      {named.map((c) => (
        <Named key={c.id} comp={c} />
      ))}
    </group>
  );
}
