import React, { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './ambient.glsl';
import { scrollSignal } from '../../lib/scrollSignal';

const COLOR_A = new THREE.Color('#3AAFF1');
const COLOR_B = new THREE.Color('#313131');
const COLOR_VOID = new THREE.Color('#0E0F10');

// drei's shaderMaterial() builds a THREE.ShaderMaterial subclass and
// registers it as a fiber intrinsic — `extend()` below is what makes
// `<ambientMaterial />` usable as JSX.
const AmbientMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uColorA: COLOR_A,
    uColorB: COLOR_B,
    uColorVoid: COLOR_VOID,
    uIntensity: 1,
    uVelocity: 0,
    uScroll: 0,
  },
  vertexShader,
  fragmentShader
);

// Registered here (module scope, once) rather than inside the component so
// remounts of AmbientShader never re-register the intrinsic.
extend({ AmbientMaterial: AmbientMaterialImpl });

function Plane({ intensity }) {
  const matRef = useRef();
  const { size, viewport } = useThree();
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const dampedMouse = useRef(new THREE.Vector2(0, 0));
  const dampedVelocity = useRef(0);

  useEffect(() => {
    const handlePointerMove = (e) => {
      targetMouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    // Cap the per-frame advance so a tab returning from the background
    // doesn't jump the animation forward.
    mat.uTime += Math.min(delta, 1 / 30);
    // Loosened from 0.04 — the original lerp made pointer parallax nearly
    // imperceptible even with the mouse-multiplier bump in the shader.
    dampedMouse.current.lerp(targetMouse.current, 0.09);
    mat.uMouse = dampedMouse.current;
    mat.uResolution.set(size.width, size.height);
    // scrollSignal is a module-scope singleton (see lib/scrollSignal.js) —
    // this <Plane> renders inside R3F's own reconciler, so it can't reach
    // Lenis/ScrollTrigger via React context. Damped locally so a single
    // fast flick doesn't snap the shader's reactivity on and back off.
    dampedVelocity.current += (scrollSignal.velocity - dampedVelocity.current) * 0.12;
    mat.uVelocity = dampedVelocity.current;
    mat.uScroll = scrollSignal.progress;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <ambientMaterial ref={matRef} uIntensity={intensity} />
    </mesh>
  );
}

/**
 * The actual WebGL layer. Never import this directly — go through
 * `AmbientBackdrop`, which lazy-loads this module and gates it behind
 * `useCanRender3D()` + an IntersectionObserver, exactly mirroring the
 * dynamic `import('three')` pattern the legacy Hero.js used to keep the
 * ~600KB three.js payload off reduced-motion / low-end visitors.
 */
export default function AmbientShader({ intensity = 1 }) {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(true);

  // Second, finer-grained gate: even once mounted, fully stop the render
  // loop (frameloop="never") whenever the canvas scrolls out of view —
  // there is no reason to keep painting an ambient background nobody sees.
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '200px 0px',
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={({ gl }) => gl.setClearColor('#0E0F10', 1)}
      >
        <Plane intensity={intensity} />
      </Canvas>
    </div>
  );
}
