// ─── Photo manifest — drives the hover-head "source captures" ring
// (circuit3d/SourceCaptures.js) and the board's OLED display
// (circuit3d/OledDisplay.js) ─────────────────────────────────────────────
// Combines the two real photo sources already in the repo rather than
// re-deriving either: OffDutyStrip.js's 5 photos (the only ones with real,
// non-invented captions) and HeroPhotoArchive.js's deduped 34-photo archive
// (FILMSTRIP_ARCHIVE — its own FILMSTRIP_SKIP judgment about which
// near-identical burst frames to drop, reused as-is). No photos.json exists
// or ever existed in this repo; this file is that manifest.
//
// Deliberately no invented `caption`/`note` text for the 34 archive-only
// entries — they carry `caption: null, note: null`.
import { PHOTOS as OFFDUTY_PHOTOS } from '../components/home/OffDutyStrip';
import { FILMSTRIP_ARCHIVE } from '../components/home/HeroPhotoArchive';

const offDutyEntries = OFFDUTY_PHOTOS.map((photo) => ({
  id: photo.tag,
  src: photo.src,
  tag: photo.tag,
  caption: photo.caption,
  // No separate "note" text exists anywhere for these — the caption
  // itself is real, so it doubles as the flip-side note rather than
  // inventing a second, different line of copy.
  note: photo.caption,
}));

const archiveEntries = FILMSTRIP_ARCHIVE.map((photo) => ({
  id: photo.id,
  src: photo.src,
  tag: photo.tag,
  caption: null,
  note: null,
}));

export const PHOTOS = [...offDutyEntries, ...archiveEntries];

// Fisher-Yates, seeded only by call time (not a fixed seed) — used by
// circuit3d/SourceCaptures.js to pick its random 8-of-N per mount, without
// needing a shuffle library.
export function shufflePhotos(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
