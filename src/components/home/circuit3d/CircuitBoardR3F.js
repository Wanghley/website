import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Environment, ContactShadows } from '@react-three/drei';
import { generatePcbLayout, GRID } from '../../../lib/pcbLayout';
import BoardMesh from './BoardMesh';
import Traces from './Traces';
import Components from './Components';
import SensorElectrode from './SensorElectrode';
import { figureStateSignal } from '../../../lib/figureStateSignal';
// A direct (not React.lazy) import, deliberately — verified directly that
// wrapping this component in a <Suspense> boundary (which React.lazy
// requires) silently breaks its useFrame registration in this R3F version
// (8.15.12), even once nothing inside it actually suspends (see
// SourceCaptures.js's own file-level comment for the full story). Its
// photo textures are loaded manually (not via Suspense) for the same
// reason, so there's no async resource here that lazy-loading would have
// been deferring anyway.
import SourceCaptures from './SourceCaptures';

// Lazy-loaded after the board itself: the board renders and is interactive
// first, the head's chunk (component + a useGLTF fetch of the ~350KB
// public/models/wsm-head.glb, preloaded from CharacterHead.js's module
// scope) resolves in the background and fades in once ready — see
// HeroCircuitBoard.js for the same pattern one level up (the whole R3F
// scene vs. its SVG fallback).
const CharacterHead = React.lazy(() => import('./CharacterHead'));

// Tilt is intentionally driven by R3F's own pointer state (canvas-local,
// direction only) rather than the shared --proximity value (which encodes
// magnitude relative to the real sensor pad position in screen space, not
// direction) — see lib/proximitySignal.js for the value every reactive
// material in this scene reads instead.
// Tenth pass — "hovering the board or the figure" materializes the
// hologram head into the full-color figure. A single manual raycast (see
// CharacterHead.js's own file-level comment for why manual, not JSX
// pointer props, in this exact R3F setup) against TWO targets in one
// shot: a dedicated invisible plane spanning the board's whole footprint
// (so hovering anywhere over the PCB counts, including areas visually
// covered by a raised component — intersectObject tests the ray against
// that ONE mesh's own geometry regardless of what else occludes it from
// the camera, so this doesn't need to enumerate every component/trace
// mesh) and the figure's own rendered group (once it exists). Enter/exit
// each debounced independently so a brief flicker across a trace gap
// doesn't retrigger the transition.
const HOVER_ENTER_MS = 120;
const HOVER_EXIT_MS = 350;

function BoardHoverTrigger({ hitPlaneRef, figureGroupRef }) {
  const sinceRef = useRef({ hitSince: null, missSince: null });
  const hoveringRef = useRef(false);

  useFrame((state) => {
    const targets = [];
    if (hitPlaneRef.current) targets.push(hitPlaneRef.current);
    if (figureGroupRef.current) targets.push(figureGroupRef.current);
    const isHit = targets.length > 0 && state.raycaster.intersectObjects(targets, true).length > 0;
    const now = state.clock.elapsedTime;
    const s = sinceRef.current;

    if (isHit) {
      s.missSince = null;
      if (s.hitSince == null) s.hitSince = now;
    } else {
      s.hitSince = null;
      if (s.missSince == null) s.missSince = now;
    }

    if (!hoveringRef.current && isHit && now - s.hitSince >= HOVER_ENTER_MS / 1000) {
      hoveringRef.current = true;
    }
    if (hoveringRef.current && !isHit && now - s.missSince >= HOVER_EXIT_MS / 1000) {
      hoveringRef.current = false;
    }
    figureStateSignal.hoverTarget = hoveringRef.current;
  });

  return null;
}

function TiltGroup({ children, reducedMotion }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (reducedMotion || !ref.current) return;
    const targetX = -state.pointer.y * 0.07;
    const targetZ = state.pointer.x * 0.07;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.06;
    ref.current.rotation.z += (targetZ - ref.current.rotation.z) * 0.06;
  });
  return <group ref={ref}>{children}</group>;
}

// The orthographic camera's default frustum (drei's OrthographicCamera,
// see node_modules) is sized to exactly `size.width`/`size.height` world
// units before `zoom` scales it — so `zoom` alone is px-per-world-unit,
// constant regardless of container size. Below ~1050px the board's own
// container (.hero-chamber__collage) shrinks per HeroChamber.css's
// responsive clamps, but a fixed zoom would keep rendering the board/head
// at the same WORLD size, i.e. smaller and smaller on screen as the canvas
// shrinks — this is the actual cause of the tablet-range "board scaled
// down but composition doesn't fit" complaint. Scaling zoom down with the
// canvas keeps the composition's on-screen proportions constant instead of
// shrinking twice. 50 is the tuned desktop value (unchanged above 1050px).
//
// height/18 is the height-axis equivalent of the width/21 cap — both are
// "how many px-per-zoom-unit-of-50 at the tuned baseline." This is a
// min-of-three cap, not a multiplicative rescale against a design frame:
// it only ever pulls zoom DOWN from the existing width-based value when
// height is the tighter constraint (a short viewport like 1500x773, where
// .hero-chamber__collage's CSS `top: calc(var(--navbar-height) + 40px)`
// leaves less height than the width-based zoom assumes), and is a no-op
// at every size that already looks right — deliberately not
// `min(vw/1440, vh/900)*50`, which would shrink the board on ordinary
// desktop widths too (the collage caps at 1050px wide, below 1440, so
// that formula is always <50 even when nothing is actually constrained).
function ResponsiveOrthoCamera() {
  const { width, height } = useThree((state) => state.size);
  const zoom = Math.min(50, width / 21, height / 18);
  return (
    <OrthographicCamera
      makeDefault
      position={[16, 15, 16]}
      zoom={zoom}
      near={0.1}
      far={100}
      onUpdate={(camera) => camera.lookAt(0, 0, 0)}
    />
  );
}

function Scene({ reducedMotion, isTablet }) {
  const layout = useMemo(() => generatePcbLayout(), []);
  const hitPlaneRef = useRef(null);
  const figureGroupRef = useRef(null);
  // Raw grid coordinates, not pre-offset: SensorElectrode is a child of the
  // same outer <group position={[-GRID.cols/2, 0, -GRID.rows/2]}> as
  // Components/Traces below, which already applies that offset once for
  // everything inside it — subtracting it again here placed the sensor a
  // full board-width away from where it actually sits on the substrate.
  const sensorWorld = [layout.sensor.col, 0.01, layout.sensor.row];
  // The head floats directly above the sensor pad — same (x,z), just
  // lifted in Y — sized relative to the WANGHLEY wordmark per the plan;
  // tuned visually against the board's own scale, not derived from it.
  // Was 2.6: the bounding-box gap to the pad looked fine on paper (~25% of
  // head height) but not in the render — BASE_PITCH's forward tilt, the
  // outline mesh's 1.035 scale, and Bloom's edge expansion all push the
  // beard's *visual* bottom lower than the geometry's own bounds suggest,
  // and the pad showed through it. Raised until that cleared, verified via
  // screenshot rather than trusted from the math above.
  const headBaseHeight = 3.3;
  const headScale = 3.4;
  const headPosition = [sensorWorld[0], headBaseHeight, sensorWorld[2]];

  return (
    <>
      <ambientLight intensity={0.12} color="#3AAFF1" />
      <directionalLight
        position={[-10, 14, -6]}
        intensity={1.6}
        color="#eef2ff"
        castShadow={!reducedMotion && !isTablet}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {/* Dim rim light for the head only, additive to the board's existing
          setup above — doesn't touch the board's own lighting. */}
      <directionalLight position={[6, 8, -10]} intensity={0.5} color="#2770B5" />
      <Environment preset="night" environmentIntensity={0.35} />

      <TiltGroup reducedMotion={reducedMotion}>
        <group position={[-GRID.cols / 2, 0, -GRID.rows / 2]}>
          <BoardMesh components={layout.components} />
          <Traces traces={layout.traces} />
          <Components components={layout.components} vias={layout.vias} />
          <SensorElectrode position={sensorWorld} tetherHeight={headBaseHeight} />
          {/* Invisible, board-footprint-sized hover target for
              BoardHoverTrigger below — same local space as the raw grid
              coordinates everything else in this group already uses (see
              the sensorWorld/headPosition comment above), sized to
              BoardMesh's own w x d so "hovering the board" covers its
              whole visible area, including the space under raised
              components (see BoardHoverTrigger's own comment for why one
              flat plane is enough for that). */}
          <mesh ref={hitPlaneRef} position={[GRID.cols / 2, 0.31, GRID.rows / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[GRID.cols, GRID.rows]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <Suspense fallback={null}>
            <CharacterHead
              position={headPosition}
              scale={headScale}
              groundY={sensorWorld[1]}
              reducedMotion={reducedMotion}
              onGroupRef={(self) => {
                figureGroupRef.current = self;
              }}
            />
          </Suspense>
          {!reducedMotion && <BoardHoverTrigger hitPlaneRef={hitPlaneRef} figureGroupRef={figureGroupRef} />}
          {!reducedMotion && <SourceCaptures headPosition={headPosition} headScale={headScale} />}
        </group>
      </TiltGroup>

      <ContactShadows position={[0, -0.32, 0]} opacity={0.55} scale={26} blur={2.2} far={4} />
    </>
  );
}

export default function CircuitBoardR3F({ reducedMotion, isTablet = false }) {
  return (
    <Canvas
      shadows={!reducedMotion && !isTablet}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance', localClippingEnabled: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ResponsiveOrthoCamera />
      <Scene reducedMotion={reducedMotion} isTablet={isTablet} />
    </Canvas>
  );
}
