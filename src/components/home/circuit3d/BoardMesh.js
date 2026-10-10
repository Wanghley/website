import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GRID } from '../../../lib/pcbLayout';

const BOARD_LABEL = 'WSM-REV-A';

const TEX_SIZE = 1024;

// Silkscreen is drawn once to an offscreen 2D canvas and applied as a
// texture on the substrate's top face — crisp text at any zoom without
// per-glyph 3D geometry (hundreds of characters would otherwise mean
// hundreds of extra meshes).
function useSilkscreenTexture(components) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#14242C';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Faint ground-pour hatch, low contrast.
    ctx.strokeStyle = 'rgba(58, 175, 241, 0.05)';
    ctx.lineWidth = 1;
    for (let i = -TEX_SIZE; i < TEX_SIZE * 2; i += 18) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + TEX_SIZE, TEX_SIZE);
      ctx.stroke();
    }

    const toPx = (col, row) => ({
      x: (col / GRID.cols) * TEX_SIZE,
      y: (row / GRID.rows) * TEX_SIZE,
    });

    ctx.fillStyle = 'rgba(232, 228, 218, 0.55)';
    ctx.font = '16px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    components.forEach((c) => {
      if (!c.designator || c.kind === 'mount') return;
      const p = toPx(c.col, c.row + (c.h ?? c.radius ?? 0.4) / 2 + 0.35);
      ctx.fillText(c.designator, p.x, p.y);
    });

    ctx.textAlign = 'left';
    ctx.font = '20px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(232, 228, 218, 0.3)';
    ctx.fillText(BOARD_LABEL, TEX_SIZE * 0.03, TEX_SIZE * 0.97);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [components]);
}

export default function BoardMesh({ components }) {
  const silkTexture = useSilkscreenTexture(components);
  const w = GRID.cols;
  const d = GRID.rows;
  const thickness = 0.6;

  return (
    <group position={[w / 2, -thickness / 2, d / 2]}>
      {/* Solder-mask top face — the silkscreen texture lives here. */}
      <mesh position={[0, thickness / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshPhysicalMaterial
          map={silkTexture}
          color="#14242C"
          roughness={0.6}
          metalness={0.05}
          clearcoat={0.12}
          clearcoatRoughness={0.5}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Laminated edge — a lighter core between two darker mask layers,
          so the board reads as a real stacked object from the iso angle. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, thickness, d]} />
        <meshStandardMaterial color="#0E1A22" roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w + 0.01, thickness * 0.3, d + 0.01]} />
        <meshStandardMaterial color="#243A7A" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}
