import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Environment, Lightformer } from '@react-three/drei';
import { generatePcbLayout, GRID } from '../../../lib/pcbLayout';
import { benchState, proximityAtLoop } from '../../../lib/benchState';
import Board from './Board';
import Traces from './Traces';
import Coil from './Coil';
import Funko from './Funko';

// Where the figure stands, in board grid units. Everything within
// CLEAR_RADIUS of it is removed from the layout so he stands on bare board.
export const FUNKO_SPOT = { col: 8.4, row: 2.7 };
const CLEAR_RADIUS = 1.5;
const FIGURE_HEIGHT = 6.8;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - (1 - x) ** 3;

function useLayout() {
  return useMemo(() => {
    const base = generatePcbLayout();
    const away = (c) => Math.hypot(c.col - FUNKO_SPOT.col, c.row - FUNKO_SPOT.row) > CLEAR_RADIUS;
    const keep = base.components.filter((c) => away(c) || ['U1', 'U2', 'E1'].includes(c.id));
    const ids = new Set(keep.map((c) => c.id));
    return {
      ...base,
      components: keep,
      vias: base.vias.filter(away),
      traces: base.traces.filter((t) => ids.has(t.from) && ids.has(t.to)),
    };
  }, []);
}

// Load choreography (seconds): board fades up from shadow 0-0.45, traces
// draw in outward from the pad 0.2-0.95, figure drops and settles 0.75-1.2.
// Whole sequence under 1.6s. Text is in the DOM from the first frame.
function Driver({ capture, autoLoop }) {
  useFrame((state, delta) => {
    if (capture) return;
    const el = state.clock.elapsedTime;
    // frame-rate independent damping (about 0.1 per frame at 60fps)
    const k = 1 - Math.exp(-delta * 6.5);
    benchState.t = el;
    benchState.fade = easeOut(clamp01(el / 0.45));
    benchState.draw = easeOut(clamp01((el - 0.2) / 0.75));
    benchState.drop = clamp01((el - 0.75) / 0.45);
    const target = autoLoop ? proximityAtLoop(el - 1.4) : benchState.pTarget;
    benchState.p += (target - benchState.p) * k;
    benchState.lookX += ((autoLoop ? 0 : benchState.lookTargetX) - benchState.lookX) * k;
    benchState.lookY += ((autoLoop ? 0 : benchState.lookTargetY) - benchState.lookY) * k;
  });
  return null;
}

// A soft dark blob under the feet: sells contact with the board in every
// render path (the directional shadow alone detaches at this camera angle).
function FootShadow({ position }) {
  const map = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} />
    </mesh>
  );
}

const v = new THREE.Vector3();

// Publish where the pad and MCU land on screen (fractions of the canvas) so
// the DOM can aim at them: the pointer proximity maths and the label.
function Projector({ boardRef, layout }) {
  useFrame((state) => {
    const board = boardRef.current;
    if (!board) return;
    board.updateWorldMatrix(true, false);
    const put = (target, col, row, y) => {
      v.set(col, y, row).applyMatrix4(board.matrixWorld).project(state.camera);
      target.x = v.x * 0.5 + 0.5;
      target.y = 1 - (v.y * 0.5 + 0.5);
      target.ready = true;
    };
    put(benchState.pad, layout.sensor.col, layout.sensor.row, 0.05);
    put(benchState.mcu, layout.mcu.col, layout.mcu.row, 0.9);
  });
  return null;
}

function Camera() {
  const { width, height } = useThree((s) => s.size);
  const zoom = Math.min(50, width / 21, height / 19);
  return (
    <OrthographicCamera
      makeDefault
      position={[16, 15, 16]}
      zoom={zoom}
      near={0.1}
      far={100}
      onUpdate={(c) => c.lookAt(0, 1.4, 0)}
    />
  );
}

// Studio light, no network fetch: copper key from the front-left, signal-blue
// rim from behind-right, a soft overhead fill.
function Studio({ shadows }) {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.0} color="#FFC48F" position={[-7, 5, 6]} scale={[9, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.4} color="#46AAE0" position={[8, 4, -7]} scale={[8, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#F2EFE9" position={[0, 9, 0]} scale={[14, 14, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.0} color="#F2EFE9" position={[9, 3, 9]} scale={[8, 5, 1]} target={[0, 0, 0]} />
      </Environment>
      <ambientLight intensity={0.35} color="#F2EFE9" />
      <directionalLight
        position={[-8, 12, 9]}
        intensity={2.0}
        color="#FFC48F"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      <directionalLight position={[10, 6, -10]} intensity={1.5} color="#46AAE0" />
    </>
  );
}

function CaptureAPI() {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    window.__bench = {
      set(values) {
        Object.assign(benchState, values);
        advance(performance.now() / 1000);
        advance(performance.now() / 1000 + 0.001);
      },
      get state() { return benchState; },
      canvas: gl.domElement,
    };
    window.__benchReady = true;
    return () => { delete window.__bench; window.__benchReady = false; };
  }, [advance, gl]);
  return null;
}

function Scene({ capture, autoLoop, shadows }) {
  const layout = useLayout();
  const boardRef = useRef(null);
  return (
    <>
      <Camera />
      <Studio shadows={shadows} />
      <Driver capture={capture} autoLoop={autoLoop} />
      <group ref={boardRef} position={[-GRID.cols / 2, 0, -GRID.rows / 2]}>
        <Projector boardRef={boardRef} layout={layout} />
        <Board layout={layout} />
        <Traces layout={layout} />
        <Coil position={[layout.sensor.col, 0.01, layout.sensor.row]} />
        <Suspense fallback={null}>
          <Funko position={[FUNKO_SPOT.col, 0.02, FUNKO_SPOT.row]} height={FIGURE_HEIGHT} />
        </Suspense>
        <FootShadow position={[FUNKO_SPOT.col, 0.045, FUNKO_SPOT.row]} />
      </group>
      {capture && <CaptureAPI />}
    </>
  );
}

export default function BenchScene({ active = true, capture = false, autoLoop = false, shadows = true, onReady }) {
  return (
    <Canvas
      shadows={shadows}
      dpr={capture ? 1 : [1, 1.5]}
      frameloop={capture ? 'never' : active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: capture }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      onCreated={() => onReady && onReady()}
    >
      <Scene capture={capture} autoLoop={autoLoop} shadows={shadows} />
    </Canvas>
  );
}
