import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { benchState, smoothstep } from '../../../lib/benchState';

// Every copper trace on the board is ONE mesh with ONE shader: flat ribbons
// laid on the solder mask. Three things are encoded per vertex:
//   aDist  distance from the sensor pad (grid units): traces draw in
//          outward from the pad during the load sequence.
//   aS     0..1 position along the signal path pad -> front-end -> MCU,
//          or -1 for traces that aren't on it. Energy flows along this.
//   aAcross -1..1 across the ribbon, for soft edges.
const Y = 0.035;
const WIDTH = 0.11;

function buildPath(layout) {
  const toSensor = layout.traces.find((t) => t.id === 't-E1'); // front-end -> pad
  const toMcu = layout.traces.find((t) => t.id === 't-U2'); // front-end -> MCU
  if (!toSensor || !toMcu) return [];
  const a = [...toSensor.points].reverse(); // pad -> front-end
  return [...a, ...toMcu.points.slice(1)];
}

export function signalPath(layout) {
  return buildPath(layout);
}

function buildGeometry(layout) {
  const path = buildPath(layout);
  const sensor = layout.sensor;
  const pos = [];
  const dist = [];
  const s = [];
  const across = [];
  const idx = [];

  // Cumulative length along the signal path
  const cum = [0];
  for (let i = 1; i < path.length; i += 1) {
    cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  }
  const total = cum[cum.length - 1] || 1;

  const addSegment = (p0, p1, s0, s1) => {
    const dx = p1[0] - p0[0];
    const dz = p1[1] - p0[1];
    const len = Math.hypot(dx, dz);
    if (len < 1e-4) return;
    const nx = (-dz / len) * (WIDTH / 2);
    const nz = (dx / len) * (WIDTH / 2);
    // extend by half a width at both ends so corners join cleanly
    const ex = (dx / len) * (WIDTH / 2);
    const ez = (dz / len) * (WIDTH / 2);
    const corners = [
      [p0[0] - ex + nx, p0[1] - ez + nz, -1, s0],
      [p0[0] - ex - nx, p0[1] - ez - nz, 1, s0],
      [p1[0] + ex + nx, p1[1] + ez + nz, -1, s1],
      [p1[0] + ex - nx, p1[1] + ez - nz, 1, s1],
    ];
    const base = pos.length / 3;
    corners.forEach(([x, z, a, sv]) => {
      pos.push(x, Y, z);
      dist.push(Math.hypot(x - sensor.col, z - sensor.row));
      s.push(sv);
      across.push(a);
    });
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  };

  layout.traces.forEach((t) => {
    if (t.id === 't-E1' || t.id === 't-U2') return; // drawn from the path below
    for (let i = 0; i < t.points.length - 1; i += 1) addSegment(t.points[i], t.points[i + 1], -1, -1);
  });
  for (let i = 0; i < path.length - 1; i += 1) {
    addSegment(path[i], path[i + 1], cum[i] / total, cum[i + 1] / total);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
  g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 1));
  g.setAttribute('aAcross', new THREE.Float32BufferAttribute(across, 1));
  g.setIndex(idx);
  return { geometry: g, maxDist: Math.max(...dist) };
}

const vertexShader = /* glsl */ `
  attribute float aDist;
  attribute float aS;
  attribute float aAcross;
  varying float vDist;
  varying float vS;
  varying float vAcross;
  void main() {
    vDist = aDist; vS = aS; vAcross = aAcross;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uDraw;
  uniform float uMaxDist;
  uniform float uProg;
  uniform float uPulse;
  uniform float uGlobal;
  uniform float uFade;
  uniform vec3 uDim;
  uniform vec3 uLit;
  uniform vec3 uHot;
  varying float vDist;
  varying float vS;
  varying float vAcross;
  void main() {
    float front = uDraw * (uMaxDist + 1.0);
    float visible = 1.0 - smoothstep(front - 1.0, front, vDist);
    float edge = 1.0 - smoothstep(0.55, 1.0, abs(vAcross));
    vec3 col = uDim;
    float onPath = step(0.0, vS);
    float lit = onPath * (1.0 - smoothstep(uProg - 0.05, uProg, vS));
    // whole-board warm-up (other traces glow faintly as the pad is approached)
    col = mix(col, uLit, (1.0 - onPath) * uGlobal * 0.22);
    col = mix(col, uLit, lit);
    float pulse = onPath * exp(-pow((vS - uPulse) * 11.0, 2.0)) * step(vS, uProg + 0.02);
    col += uHot * pulse * 0.9;
    gl_FragColor = vec4(col, visible * edge * uFade);
    #include <colorspace_fragment>
  }
`;

export default function Traces({ layout }) {
  const { geometry, maxDist } = useMemo(() => buildGeometry(layout), [layout]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
        uniforms: {
          uDraw: { value: 1 },
          uMaxDist: { value: maxDist },
          uProg: { value: 0 },
          uPulse: { value: 0 },
          uGlobal: { value: 0 },
          uFade: { value: 1 },
          uDim: { value: new THREE.Color('#A8642A') },
          uLit: { value: new THREE.Color('#F0A460') },
          uHot: { value: new THREE.Color('#FFE2B8') },
        },
      }),
    [maxDist]
  );

  useFrame(() => {
    const u = material.uniforms;
    const p = benchState.p;
    const prog = smoothstep(0.12, 0.92, p);
    u.uDraw.value = benchState.draw;
    u.uFade.value = benchState.fade;
    u.uProg.value = prog;
    u.uGlobal.value = p;
    // one pulse travels the lit part of the path, repeating while energised
    u.uPulse.value = prog > 0.02 ? ((benchState.t * 0.55) % 1) * Math.min(1, prog + 0.1) : -1;
  });

  return <mesh geometry={geometry} material={material} renderOrder={2} frustumCulled={false} />;
}
