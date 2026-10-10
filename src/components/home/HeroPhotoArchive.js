import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { scrollSignal } from '../../lib/scrollSignal';
import './css/HeroPhotoArchive.css';

// require.context reads whatever is physically in this directory at build
// time — nothing here is a hardcoded file list. Run `yarn build-archive`
// (scripts/build-photo-archive.js) after adding/removing source photos and
// this list updates itself; filenames are zero-padded (wsm-001.webp …) so
// a plain alphabetical sort already reproduces the chronological order the
// build script computed.
const archiveContext = require.context('../../assets/wanghley/archive', false, /wsm-\d+\.webp$/);
// Exported (with FILMSTRIP_ARCHIVE below) for src/data/photos.js to reuse
// as-is — the hero's photo mechanics (circuit3d/SourceCaptures.js,
// circuit3d/OledDisplay.js) draw from the same deduped archive rather than
// re-deriving their own judgment about which frames are near-duplicates.
export const ARCHIVE = archiveContext
  .keys()
  .sort()
  .map((key, i) => ({
    id: key,
    src: archiveContext(key),
    tag: `WSM_${String(i + 1).padStart(2, '0')}`,
  }));

function splitRows(items) {
  const rowA = [];
  const rowB = [];
  items.forEach((item, i) => (i % 2 === 0 ? rowA : rowB).push(item));
  return [rowA, rowB];
}

const [ROW_A, ROW_B] = splitRows(ARCHIVE);

// The filmstrip (compact mode) shows every photo in one row, where 2-3
// near-identical consecutive frames from the same burst (visually
// confirmed via contact sheet — several formal-portrait, gazebo, and
// signing-the-book bursts) read as a mistake, not a stylistic choice, at
// filmstrip scale. This trims those down to one representative frame per
// moment without touching the underlying archive or its WSM_XX numbering
// (a real specimen catalog has entries filed elsewhere too) — 0-indexed
// positions in the chronological archive order.
const FILMSTRIP_SKIP = new Set([
  1, 3, 5, 7, 9, 11, 12, 14, 16, 18, 21, 22, 24, 28, 31, 34, 37, 41, 42, 44, 47, 48, 53,
]);
export const FILMSTRIP_ARCHIVE = ARCHIVE.filter((_, i) => !FILMSTRIP_SKIP.has(i));

function Card({ photo, isStatic }) {
  return (
    <figure className={`hero-archive__card${isStatic ? ' hero-archive__card--static' : ''}`}>
      <img
        className="hero-archive__img"
        src={photo.src}
        alt={photo.tag}
        loading="lazy"
        decoding="async"
      />
      <figcaption className="hero-archive__meta">
        <span className="hero-archive__tag">{photo.tag}</span>
      </figcaption>
    </figure>
  );
}

// One counter-scrolling row. Position is a plain running offset advanced on
// gsap.ticker (already the app-wide animation heartbeat — SignalChain and
// VentureShowcase drive their own per-frame effects off it too), not a CSS
// @keyframes loop — that's what lets speed react continuously to
// scrollSignal.velocity (written by LenisRoot on every Lenis scroll event)
// instead of being baked into a fixed animation-duration.
function Row({ items, direction, baseSpeed }) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const tick = (_time, deltaMs) => {
      if (pausedRef.current) return;
      const dt = Math.min(deltaMs, 50) / 1000;
      const boost = 1 + scrollSignal.velocity * 2.2;
      offsetRef.current += direction * baseSpeed * boost * dt;
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth > 0) {
        if (offsetRef.current <= -loopWidth) offsetRef.current += loopWidth;
        if (offsetRef.current > 0) offsetRef.current -= loopWidth;
      }
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [direction, baseSpeed]);

  // Rendered twice back-to-back so the loop point (offset wrapping by
  // exactly half the track's scrollWidth) is invisible.
  const doubled = [...items, ...items];

  return (
    <div
      className="hero-archive__row"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocus={() => {
        pausedRef.current = true;
      }}
      onBlur={() => {
        pausedRef.current = false;
      }}
    >
      <div ref={trackRef} className="hero-archive__track">
        {doubled.map((photo, i) => (
          <Card photo={photo} key={`${photo.id}-${i}`} />
        ))}
      </div>
    </div>
  );
}

export default function HeroPhotoArchive({ compact = false }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const onResize = () => setIsNarrowViewport(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Neither a tablet-narrow viewport nor prefers-reduced-motion get the
  // marquee — a two-row infinite scroll only reads as "designed" when
  // there's enough width for several cards to be visible mid-row at once,
  // and reduced-motion visitors get a static equivalent, not a slower one.
  const archiveForDisplay = compact ? FILMSTRIP_ARCHIVE : ARCHIVE;

  if (isNarrowViewport || reducedMotion) {
    return (
      <div
        className={`hero-archive hero-archive--static${compact ? ' hero-archive--filmstrip' : ''}`}
        aria-label={`Photo archive, ${archiveForDisplay.length} photos`}
      >
        <div className="hero-archive__static-row">
          {archiveForDisplay.map((photo) => (
            <Card photo={photo} isStatic key={photo.id} />
          ))}
        </div>
      </div>
    );
  }

  // Compact mode (the hero's bottom filmstrip, once the circuit board takes
  // the space the marquee used to occupy) — a single low-profile row using
  // a deduplicated pass over the archive (see FILMSTRIP_SKIP above),
  // rather than splitting the full archive across two taller rows.
  if (compact) {
    return (
      <div className="hero-archive hero-archive--filmstrip" aria-label={`Photo archive, ${archiveForDisplay.length} photos`}>
        <Row items={FILMSTRIP_ARCHIVE} direction={-1} baseSpeed={14} />
      </div>
    );
  }

  return (
    <div className="hero-archive" aria-label={`Photo archive, ${ARCHIVE.length} photos`}>
      <Row items={ROW_A} direction={-1} baseSpeed={16} />
      <Row items={ROW_B} direction={1} baseSpeed={14} />
    </div>
  );
}
