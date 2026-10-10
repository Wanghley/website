import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PHOTOS } from '../../../data/photos';
import '../css/OledCallout.css';

// DISP1 — the board's one real display (see lib/pcbLayout.js's `display`
// entry, was a plain silver "debug header" connector at this spot). A
// small e-paper/OLED: a 1-bit ordered-dithered render of the current
// hover-head capture (circuit3d/SourceCaptures.js's own photo pool is a
// separate random 8; this is its own independent, slower ambient cycle
// through the full data/photos.js set), drawn to an offscreen <canvas> and
// used as a THREE.CanvasTexture — same technique BoardMesh.js's silkscreen
// already establishes, just animated instead of static.
//
// "A detail, not a feature" per the brief: no enlargement, the only
// interaction is a small hover callout naming the current capture.
//
// The callout is drei's <Html> (anchored to this mesh's own 3D position),
// NOT `ReactDOM.createPortal(..., document.body)` — verified directly that
// calling createPortal from a component rendered INSIDE the R3F tree
// crashes the whole app ("R3F: Span is not part of the THREE namespace!"),
// because that portal call is processed by R3F's own custom reconciler,
// not react-dom's, and R3F has no host config for a literal <span>/<div>
// even inside a portaled subtree. The old ReferenceFrame.js's CLEAR DESK
// portal never hit this: that component was a sibling of the R3F <Canvas>
// in HeroChamber.js's own DOM tree, never a descendant of it. drei's <Html>
// is the mechanism this codebase needs for a DOM overlay anchored INSIDE
// an R3F scene — it bridges the two reconcilers correctly.

const DISPLAY_W = 128;
const DISPLAY_H = 96;
const CYCLE_MS = 8000;
const WIPE_FRAMES = 12; // ~200ms at 60fps
const LIT = [0x3a, 0xaf, 0xf1];
const DARK = [0x0a, 0x0d, 0x12];

// 4x4 Bayer ordered-dither matrix, normalized thresholds.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function ditherToTwoTone(imageData) {
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const lum = (0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]) / 255;
      const threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) / 16;
      const lit = lum > threshold;
      const c = lit ? LIT : DARK;
      data[idx] = c[0];
      data[idx + 1] = c[1];
      data[idx + 2] = c[2];
      data[idx + 3] = 255;
    }
  }
  return imageData;
}

// The board's smallest interactive target (≈53x38 screen px at desktop
// zoom) — a raycast against the visual screen plane's own exact size
// proved too fiddly to hit reliably (verified via a grid-search sweep that
// never landed a hit at the screen's own footprint). A dedicated,
// deliberately oversized invisible hit-test plane — same philosophy as
// circuit3d/SourceCaptures.js's HIT_TEST_SCALE margin around the head —
// fixes it without needing pixel-perfect cursor placement.
const HIT_TEST_SCALE = 2.2;

export default function OledDisplay({ comp }) {
  const hitRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(() => Math.floor(Math.random() * PHOTOS.length));

  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = DISPLAY_W;
    c.height = DISPLAY_H;
    return c;
  }, []);
  const ctx = useMemo(() => canvas.getContext('2d', { willReadFrequently: true }), [canvas]);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    // Crisp pixels, no smoothing — an e-paper look, not a blurred photo.
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = false;
    return t;
  }, [canvas]);

  useEffect(() => () => texture.dispose(), [texture]);

  const wipeRef = useRef(null); // { prevData, nextData, row }

  // On each cycle: decode the next photo off-thread of the visible canvas
  // (a scratch canvas), dither it, and hand the result to the useFrame
  // wipe below rather than swapping instantly.
  useEffect(() => {
    let cancelled = false;
    const photo = PHOTOS[photoIndex % PHOTOS.length];
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      const prevData = ctx.getImageData(0, 0, DISPLAY_W, DISPLAY_H);
      const scratch = document.createElement('canvas');
      scratch.width = DISPLAY_W;
      scratch.height = DISPLAY_H;
      const sctx = scratch.getContext('2d');
      sctx.drawImage(img, 0, 0, DISPLAY_W, DISPLAY_H);
      const nextData = ditherToTwoTone(sctx.getImageData(0, 0, DISPLAY_W, DISPLAY_H));
      wipeRef.current = { prevData, nextData, row: 0 };
    };
    img.src = photo.src;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoIndex]);

  useEffect(() => {
    const id = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % PHOTOS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const hoveredRef = useRef(false);

  useFrame((state) => {
    const wipe = wipeRef.current;
    if (wipe) {
      const rowsPerFrame = Math.ceil(DISPLAY_H / WIPE_FRAMES);
      const endRow = Math.min(DISPLAY_H, wipe.row + rowsPerFrame);
      // Top-to-bottom reveal: rows above `endRow` already show the new
      // frame, the rest still show the old one — a real e-paper redraw
      // wipe, not an instant swap.
      const composed = ctx.createImageData(DISPLAY_W, DISPLAY_H);
      const rowBytes = DISPLAY_W * 4;
      for (let y = 0; y < DISPLAY_H; y += 1) {
        const src = y < endRow ? wipe.nextData : wipe.prevData;
        const start = y * rowBytes;
        composed.data.set(src.data.subarray(start, start + rowBytes), start);
      }
      ctx.putImageData(composed, 0, 0);
      texture.needsUpdate = true;
      wipe.row = endRow;
      if (endRow >= DISPLAY_H) wipeRef.current = null;
    }

    // Manual hover detection, same as circuit3d/SourceCaptures.js's own
    // hit-test (see that file's comment #3 for why: JSX
    // onPointerOver/Out/Move props were tried first and didn't reliably
    // fire in headless-browser testing).
    if (hitRef.current) {
      const hits = state.raycaster.intersectObject(hitRef.current, false);
      const isHovering = hits.length > 0;
      if (isHovering !== hoveredRef.current) {
        hoveredRef.current = isHovering;
        setHovered(isHovering);
      }
    }
  });

  const currentPhoto = PHOTOS[photoIndex % PHOTOS.length];
  // Housing box matches the generic `connector` branch's own geometry
  // (Components.js) — this used to just be the plain "debug header" box;
  // the screen face is a plane mounted flush on its top surface.
  const boxYDim = comp.height * 0.6;
  const screenY = comp.height / 2 + boxYDim / 2 + 0.006;

  return (
    <group>
      <mesh position={[comp.col, comp.height / 2, comp.row]} castShadow receiveShadow>
        <boxGeometry args={[comp.w, boxYDim, comp.h]} />
        <meshStandardMaterial color="#B8BCC2" metalness={1} roughness={0.35} />
      </mesh>
      <mesh position={[comp.col, screenY, comp.row]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[comp.w * 0.82, comp.h * 0.82]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#3AAFF1"
          emissiveIntensity={1.6}
          roughness={0.6}
          metalness={0}
        />
      </mesh>
      {/* Oversized, invisible hover target (see HIT_TEST_SCALE above) —
          separate from the visual screen plane so the callout is
          reasonably easy to find without needing to hit ~50x38 screen px
          exactly. */}
      <mesh ref={hitRef} position={[comp.col, screenY, comp.row]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[comp.w * 0.82 * HIT_TEST_SCALE, comp.h * 0.82 * HIT_TEST_SCALE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered && (
        // Anchored to the display's own position in 3D space (drei
        // projects it to screen space every frame, tracking the board's
        // isometric camera/zoom automatically) rather than following the
        // cursor — reads as "labeling the part," matching the board's
        // other component callouts.
        <Html position={[comp.col, screenY + comp.h * 0.5, comp.row]} center={false} style={{ pointerEvents: 'none' }}>
          <div className="oled-callout">
            <span className="oled-callout__leader" />
            {`DISP1 · last capture · ${currentPhoto.tag}`}
          </div>
        </Html>
      )}
    </group>
  );
}
