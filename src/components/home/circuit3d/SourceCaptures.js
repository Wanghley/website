import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PHOTOS, shufflePhotos } from '../../../data/photos';
import { sourceCaptureSignal } from '../../../lib/sourceCaptureSignal';
import { holoGlitchSignal } from '../../../lib/holoGlitchSignal';
import { figureStateSignal } from '../../../lib/figureStateSignal';
import FIGURE_METRICS from '../../../data/figureMetrics';

// "Source captures" — the hologram was reconstructed from photos; hovering
// the head reveals them as a ring of billboarded planes around it. Lives
// entirely inside the R3F scene (not a DOM overlay, unlike the old
// ReferenceFrame.js this replaces) since it's described in inherently-3D
// terms — billboarding, ring depth, a real rotation — and is R3F-only by
// design: reduced-motion/SVG-fallback visitors never mount this component
// at all (see CircuitBoardR3F.js's `{!reducedMotion && <SourceCaptures>...`).
//
// Two real bugs were found and fixed here, verified directly via console
// instrumentation rather than assumed:
//
// 1. Textures are loaded manually via THREE.TextureLoader + local state,
//    NOT drei's `useTexture` — `useTexture`'s Suspense-based loading
//    caused this component to REMOUNT on every suspend/retry cycle in
//    this R3F version (8.15.12): each retry produced a freshly-reshuffled,
//    different-URLs `photos` array from a useMemo that should have been
//    stable, proving the fiber was being torn down and rebuilt rather
//    than resumed. That meant every retry requested a brand new random
//    8-of-39 set, never letting any single request's cache entry actually
//    resolve — an infinite loop that never opened the ring. Manual
//    loading never throws a promise, so nothing here ever suspends.
// 2. This component is rendered WITHOUT a <Suspense> wrapper, deliberately
//    — wrapping it in one (even an unused one, now that (1) means nothing
//    inside it suspends) silently broke `useFrame` registration entirely
//    in this R3F version: `useFrame`'s callback simply never fired, with
//    no error, which is what made the hit-test sphere and the whole ring
//    permanently inert. Confirmed by removing the wrapper and watching
//    `useFrame` start firing on the very next render.
// 3. Hover is detected via a MANUAL `state.raycaster.intersectObject()`
//    check inside useFrame, not JSX `onPointerEnter/Move/Leave` props.
//    While tracking down (1) and (2) above, the declarative props
//    appeared to never fire under Playwright/headless Chromium — but
//    further isolation showed `state.pointer`/`state.raycaster` themselves
//    stayed at their construction defaults ([0,0] / origin (0,0,0) / dir
//    (0,0,-1)) after `page.mouse.move()`, and only updated once a raw
//    `PointerEvent` was dispatched directly on the canvas element. That
//    points at Playwright's CDP-simulated mouse events not reliably
//    reaching this canvas's pointermove listener in headless mode — a
//    test-harness quirk, not a proven production bug (a real mouse/
//    trackpad generates the same native events the direct-dispatch test
//    used). The manual raycast here is kept anyway: it was verified
//    working end-to-end via that direct dispatch, it doesn't depend on
//    resolving whether the JSX-prop path is actually fine for real users,
//    and reading `state.raycaster` straight off R3F's own per-frame update
//    is no less idiomatic than the declarative props would be.
//
// Tenth pass: the ring no longer opens on a plain head-hover dwell — it
// now opens on a CLICK, and only once the hologram has fully materialized
// into the full-color figure (figureStateSignal.t >= 0.98). Hovering the
// head/board now triggers CharacterHead.js's own materialize transition
// instead; letting the OLD dwell-to-open logic coexist would pop this ring
// open on every ordinary head hover, competing with that transition. The
// single hit-test sphere below was widened from "around the head" to
// "around the whole standing figure" for the same reason — both the new
// click-trigger and the pre-existing hover-to-scrub/hover-to-close logic
// read it, and a figure-sized target is what "click on the figure" means
// once there's a body to click. Its position/radius track
// figureStateSignal.groupLocalPos/groupLocalScale every frame (same shared
// local space CharacterHead.js itself renders in — see that signal's own
// header comment) rather than the old static headPosition/headScale props,
// which only ever described the figure's t=0 (hologram-only) framing.

const RING_COUNT = 8;
// Invisible hit-test sphere radius, as a multiple of the figure's own
// current half-height (figureStateSignal.groupLocalScale * 0.5 — the
// model is normalized to exactly 1 unit tall). 1.15 is a light margin
// over the literal silhouette, not the old head-specific 1.9 correction
// (that number compensated for the head crop's own bushy-bearded,
// capped proportions specifically; the full body reads close to its own
// bounding sphere).
const HIT_TEST_SCALE = 1.15;
const RING_RADIUS_FACTOR = 1.2; // * headHalfWidth
const PLANE_ASPECT = 4 / 5;
const PLANE_SCREEN_PX = 120;
const ENLARGE_SCREEN_PX = 360;
const OPEN_LERP_RATE = 0.1; // ~450ms open/close fade, same convention as CharacterHead's derez
const SPIN_LERP_RATE = 0.08; // "spring-damped" scrub, hand-rolled per this codebase's own idiom
// The camera sits at [16,15,16] (CircuitBoardR3F.js) — its azimuth in this
// group's local XZ plane is atan2(16,16) = 45deg, i.e. Math.PI/4. "Front of
// ring" is defined relative to that fixed bearing, not to the ring's own
// index 0.
const FRONT_ANGLE = Math.PI / 4;
// Holo tint applied to every plane except the frontmost — a material-color
// multiply (desaturated blue) rather than a per-plane custom shader, close
// in spirit to the callout card's old grayscale/sepia/hue-rotate CSS filter
// without needing a bespoke fragment shader for 8 animated sprites.
const HOLO_TINT = [0.55, 0.68, 0.82];

export default function SourceCaptures({ headPosition, headScale }) {
  // Computed once and never again — a ref-initializer, not useMemo, is the
  // belt-and-suspenders choice here given useMemo's cache turned out not
  // to survive R3F's Suspense retry cycle (see the file-level comment).
  const photosRef = useRef(null);
  if (photosRef.current === null) {
    photosRef.current = shufflePhotos(PHOTOS).slice(0, RING_COUNT);
  }
  const photos = photosRef.current;

  const [textures, setTextures] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    Promise.all(
      photos.map(
        (photo) =>
          new Promise((resolve) => {
            loader.load(
              photo.src,
              (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                resolve(tex);
              },
              undefined,
              () => resolve(null) // a failed load just leaves that plane untextured, not broken
            );
          })
      )
    ).then((loaded) => {
      if (!cancelled) setTextures(loaded);
    });
    return () => {
      cancelled = true;
    };
    // photos is a ref-backed constant for this component's whole lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anchorGroupRef = useRef(null); // tracks the figure's current HEAD position — the ring's visual anchor
  const hitRef = useRef(null); // tracks the figure's current BODY center/radius — the click/hover/scrub target
  const ringRef = useRef(null);
  const spriteRefs = useRef([]);
  const ringItemRefs = useRef([]); // per-photo wrapper groups, repositioned each frame as ringRadius changes
  const enlargedSpriteRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  const glitchTimerRef = useRef(null);
  const rotationTargetRef = useRef(0);
  const rotationCurrentRef = useRef(0);
  const openAmountRef = useRef(0);
  const frontIndexRef = useRef(0);
  const wasHoveringRef = useRef(false);
  // Mirrors the live `headHalfWidth` computed in useFrame every frame —
  // JSX below (the enlarged-sprite's own position) can't read a
  // useFrame-local variable directly, and only ever needs this while
  // `enlargedIndex != null`, by which point the figure is settled at t=1
  // and the value isn't moving anyway.
  const headHalfWidthAtOpenRef = useRef(headScale * 0.5);

  // Precomputed once per photo set (not per frame) — the RADIUS those
  // angles are placed at changes every frame with the figure's own scale,
  // but each photo's angular slot around the ring never does.
  // photos is a ref-backed constant for this component's whole lifetime
  // (see photosRef above) — same reasoning as the texture-loading effect's
  // own exhaustive-deps override.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseAngles = useMemo(() => photos.map((_, i) => (i / photos.length) * Math.PI * 2), [photos.length]);

  useEffect(() => {
    sourceCaptureSignal.count = photos.length;
  }, [photos.length]);

  // Nothing left open once this unmounts.
  useEffect(
    () => () => {
      sourceCaptureSignal.open = false;
      clearTimeout(glitchTimerRef.current);
    },
    []
  );

  const closeRing = () => {
    if (!open) return;
    setOpen(false);
    setEnlargedIndex(null);
    sourceCaptureSignal.open = false;
    // Slight bloom pulse on the electrode as the head reforms — reuses
    // SensorElectrode.js's existing glitch-pulse machinery rather than
    // inventing new coupling.
    holoGlitchSignal.active = true;
    clearTimeout(glitchTimerRef.current);
    glitchTimerRef.current = setTimeout(() => {
      holoGlitchSignal.active = false;
    }, 150);
  };

  // Click-to-enlarge/close, and Escape — attached only while the ring is
  // actually open. A click enlarges whichever plane is currently front
  // (frontIndexRef, updated every frame below) rather than requiring a
  // precise per-sprite click target, which would hit the exact same
  // dead-pointer-event issue the hover hit-test itself worked around.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setEnlargedIndex(null);
    };
    const onPointerDown = () => {
      setEnlargedIndex((cur) => (cur != null ? null : frontIndexRef.current));
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  // Tenth pass: the OPEN trigger itself — a click on the figure, gated to
  // "fully materialized," rather than the retired head-dwell. A separate,
  // always-mounted listener from the enlarge one above (that one only
  // exists once `open`); `wasHoveringRef` is the same body-hit-test
  // boolean the useFrame below keeps current every frame, read here rather
  // than duplicating the raycast — a `pointerdown` handler has no frame of
  // its own to raycast in. Matches CharacterHead.js's own 0.9 threshold
  // for `figureStateSignal.state === 'figure'` exactly — a stricter gate
  // here (0.98 was tried first) left a real gap where the HUD already read
  // LIVE but a click still silently did nothing, caught by direct
  // instrumentation, not assumed.
  useEffect(() => {
    const onPointerDown = () => {
      if (open) return;
      if (figureStateSignal.t < 0.9) return;
      if (!wasHoveringRef.current) return;
      setOpen(true);
      sourceCaptureSignal.open = true;
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useFrame((state) => {
    // Track the figure's current HEAD position/size (ring's visual anchor)
    // and BODY center/radius (hit-test target) — both read off
    // figureStateSignal, written every frame by CharacterHead.js, which
    // renders in this exact same local space (see that signal's own
    // header comment for why no world-matrix conversion is needed here).
    // Falls back to the old static headPosition/headScale props for the
    // handful of frames before CharacterHead's own useFrame has run once.
    const groupPos = figureStateSignal.groupLocalPos;
    const groupScale = figureStateSignal.groupLocalScale || headScale / FIGURE_METRICS.headSpanHeight;
    const anchorX = groupPos ? groupPos.x : headPosition[0];
    const anchorY = groupPos ? groupPos.y + FIGURE_METRICS.headCenterY * groupScale : headPosition[1];
    const anchorZ = groupPos ? groupPos.z : headPosition[2];
    if (anchorGroupRef.current) {
      anchorGroupRef.current.position.set(anchorX, anchorY, anchorZ);
    }
    const headHalfWidth = groupScale * FIGURE_METRICS.headSpanHeight * 0.5;
    headHalfWidthAtOpenRef.current = headHalfWidth;
    const ringRadius = headHalfWidth * RING_RADIUS_FACTOR;
    ringItemRefs.current.forEach((grp, i) => {
      if (!grp) return;
      grp.position.set(Math.sin(baseAngles[i]) * ringRadius, 0, Math.cos(baseAngles[i]) * ringRadius);
    });

    if (hitRef.current) {
      hitRef.current.position.set(groupPos ? groupPos.x : headPosition[0], groupPos ? groupPos.y : headPosition[1], groupPos ? groupPos.z : headPosition[2]);
      hitRef.current.scale.setScalar(groupScale * 0.5 * HIT_TEST_SCALE);
    }

    // Manual hover detection (see the file-level comment #3) — raycast the
    // hit-test sphere directly off R3F's own per-frame raycaster/pointer,
    // rather than relying on onPointerEnter/Move/Leave props. Now sized to
    // the whole figure (see the file-level "tenth pass" comment above),
    // this same boolean feeds the click-to-open effect above, the scrub
    // rotation below, and the close-on-leave below — one hit test, three
    // consumers.
    let isHovering = false;
    if (hitRef.current) {
      const hits = state.raycaster.intersectObject(hitRef.current, false);
      isHovering = hits.length > 0;
      if (isHovering && open && enlargedIndex == null && hits[0].uv) {
        rotationTargetRef.current = hits[0].uv.x * Math.PI * 2;
      }
      if (!isHovering && wasHoveringRef.current) {
        closeRing();
      }
      wasHoveringRef.current = isHovering;
    }

    openAmountRef.current += ((open ? 1 : 0) - openAmountRef.current) * OPEN_LERP_RATE;
    const amt = openAmountRef.current;

    if (ringRef.current) {
      ringRef.current.visible = amt > 0.002;
    }
    if (amt <= 0.002) return;

    rotationCurrentRef.current += (rotationTargetRef.current - rotationCurrentRef.current) * SPIN_LERP_RATE;
    if (ringRef.current) {
      ringRef.current.rotation.y = rotationCurrentRef.current;
    }

    // Screen-constant sizing: world height = target px / camera.zoom (px-
    // per-world-unit, see ResponsiveOrthoCamera's own doc comment).
    const zoom = state.camera.zoom || 50;
    const worldH = PLANE_SCREEN_PX / zoom;
    const worldW = worldH * PLANE_ASPECT;

    // Two passes: find the frontmost plane first, then apply per-plane
    // scale/opacity/tint now that we know which one that is.
    let frontIndex = 0;
    let frontBest = -Infinity;
    const frontAmounts = spriteRefs.current.map((_, i) => {
      const angle = (i / photos.length) * Math.PI * 2 + rotationCurrentRef.current;
      const frontAmount = (Math.cos(angle - FRONT_ANGLE) + 1) / 2;
      if (frontAmount > frontBest) {
        frontBest = frontAmount;
        frontIndex = i;
      }
      return frontAmount;
    });
    // OscilloscopeReadout.js's own rAF loop reads this for the SRC 0X/08
    // HUD swap while the ring is open; frontIndexRef is the same value for
    // the click-to-enlarge handler above, which can't read component state
    // directly from a window-level listener.
    sourceCaptureSignal.index = frontIndex;
    frontIndexRef.current = frontIndex;

    spriteRefs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const isFront = i === frontIndex && enlargedIndex == null;
      const isHiddenBehindEnlarge = enlargedIndex != null && i !== enlargedIndex;
      const fa = frontAmounts[i];
      const opacity = (isHiddenBehindEnlarge ? 0.15 : 0.25 + fa * 0.75) * amt;
      const scale = isFront ? 1.3 : 1;
      sprite.scale.set(worldW * scale, worldH * scale, 1);
      sprite.material.opacity = opacity;
      if (isFront) {
        sprite.material.color.setRGB(1, 1, 1);
      } else {
        sprite.material.color.setRGB(HOLO_TINT[0], HOLO_TINT[1], HOLO_TINT[2]);
      }
    });

    if (enlargedSpriteRef.current) {
      const worldHEnlarge = ENLARGE_SCREEN_PX / zoom;
      enlargedSpriteRef.current.scale.set(worldHEnlarge * PLANE_ASPECT, worldHEnlarge, 1);
      enlargedSpriteRef.current.material.opacity = enlargedIndex != null ? amt : 0;
    }
  });

  return (
    <>
      {/* Invisible hit-test volume around the whole figure (see the
          file-level "tenth pass" comment) — NOT nested under the
          head-anchored group below, since its position tracks the
          figure's BODY center independently, in the same shared local
          space (absolute, not head-relative). Hover is detected by
          manually raycasting this mesh inside useFrame (comment #3
          above), not JSX pointer props — kept invisible via a fully
          transparent MATERIAL, not `visible={false}` on the mesh, since
          raycasting (manual or R3F's own) skips invisible objects
          entirely regardless of which mechanism triggers it. Built as a
          UNIT sphere and scaled every frame (see useFrame above) rather
          than rebuilding geometry at a new radius each frame. */}
      <mesh ref={hitRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Anchored to the figure's current HEAD position (see useFrame
          above) — this is what makes the ring visually surround the head
          at whatever height it's currently at, rather than the figure's
          overall body center. */}
      <group ref={anchorGroupRef}>
        <group ref={ringRef} visible={false}>
          {photos.map((photo, i) => (
            <group
              key={photo.id}
              ref={(el) => {
                ringItemRefs.current[i] = el;
              }}
            >
              <sprite
                ref={(el) => {
                  spriteRefs.current[i] = el;
                }}
              >
                <spriteMaterial map={textures[i]} transparent depthWrite={false} opacity={0} />
              </sprite>
              {/* Tiny mono label under each plane — stays in the WebGL
                  draw call (drei's Text/troika-three-text) so it composites
                  correctly with the ring's own depth, unlike a DOM overlay. */}
              <Text position={[0, -0.55, 0.01]} fontSize={0.11} color="#3AAFF1" anchorX="center" anchorY="middle">
                {`CAPTURE ${String(i + 1).padStart(2, '0')}`}
              </Text>
            </group>
          ))}
        </group>

        {/* Click-to-enlarge — one shared sprite reused for whichever index
            is enlarged, positioned toward the camera so it reads in front
            of the ring. Scrub pauses while set (the useFrame hover check
            above skips the rotation-target update whenever enlargedIndex
            != null). Position is a fixed fraction of RING_RADIUS_FACTOR's
            own *headHalfWidth* baseline (not re-derived from the live
            ringRadius, which only exists inside useFrame) — reasonable
            since this only ever renders once the figure is settled at
            t=1, where headHalfWidth is no longer changing. */}
        {enlargedIndex != null && (
          <group
            position={[
              Math.sin(FRONT_ANGLE) * headHalfWidthAtOpenRef.current * RING_RADIUS_FACTOR * 0.4,
              0.2,
              Math.cos(FRONT_ANGLE) * headHalfWidthAtOpenRef.current * RING_RADIUS_FACTOR * 0.4,
            ]}
          >
            <sprite ref={enlargedSpriteRef} renderOrder={10}>
              <spriteMaterial map={textures[enlargedIndex]} transparent depthWrite={false} opacity={0} />
            </sprite>
            <Text position={[0, -1.3, 0.01]} fontSize={0.13} color="#3AAFF1" anchorX="center" anchorY="middle">
              {photos[enlargedIndex].caption ?? photos[enlargedIndex].tag}
            </Text>
          </group>
        )}
      </group>
    </>
  );
}
