#!/usr/bin/env node
/**
 * Builds the hero's photo archive: reads every real photo out of
 * `photo-originals/` (the raw, gitignored camera-roll dump — see
 * .gitignore), dedupes pure format/copy duplicates (a .HEIC/.JPEG/.PNG
 * that's the same shot as an existing .jpg, or a literal " 2" copy),
 * sorts oldest-first by EXIF capture date (falling back to file mtime,
 * then filename), and writes normalized 3:4 WebP crops into
 * src/assets/wanghley/archive/wsm-NNN.webp.
 *
 * The React side (HeroPhotoArchive.js) never hardcodes a file list — it
 * uses require.context() to read whatever is in that output directory at
 * build time and derives each photo's WSM_XX tag from array position. So
 * the only thing this script owns is *which* files exist and what order
 * they sort in; re-run it (`yarn build-archive`) after adding new photos
 * to photo-originals/.
 *
 * Not wired into `yarn start`/`build` as a background/chained step — that
 * exact pattern (an npx CLI backgrounded with `&` in package.json scripts)
 * silently died earlier in this project's history and shipped a stale
 * asset. Run this deliberately, once, whenever the source photos change.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'photo-originals');
const OUT_DIR = path.join(ROOT, 'src/assets/wanghley/archive');

const CARD_W = 720;
const CARD_H = 960; // 3:4

function isImageCandidate(name) {
  return /\.(jpe?g)$/i.test(name);
}

function baseNoExt(name) {
  return name.replace(/\.[^.]+$/, '').replace(/\s+2$/, '');
}

function pickCanonicalFiles(allFiles) {
  // Group by "logical photo" (same base name, ignoring extension case and
  // a trailing " 2" copy-suffix), then keep exactly one file per group,
  // preferring .jpg > .JPG > .jpeg > .JPEG, and preferring the
  // non-" 2"-suffixed copy.
  const groups = new Map();
  for (const name of allFiles) {
    if (!isImageCandidate(name)) continue; // .HEIC / .MP4 / .PNG never considered
    const key = baseNoExt(name).toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(name);
  }

  const rank = (name) => {
    const isCopy = / 2\.[^.]+$/.test(name) ? 1 : 0;
    const ext = path.extname(name).toLowerCase();
    const extRank = ext === '.jpg' ? 0 : ext === '.jpeg' ? 1 : 2;
    return isCopy * 10 + extRank;
  };

  const out = [];
  for (const files of groups.values()) {
    files.sort((a, b) => rank(a) - rank(b));
    out.push(files[0]);
  }
  return out;
}

function exifDate(filePath) {
  try {
    const raw = execFileSync(
      'magick',
      ['identify', '-format', '%[EXIF:DateTimeOriginal]', filePath],
      { encoding: 'utf8' }
    ).trim();
    if (!raw) return null;
    // EXIF dates look like "2026:05:08 14:32:10" — swap the first two
    // colons for dashes so Date() parses it.
    const iso = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}

function sortKey(filePath) {
  const exif = exifDate(filePath);
  if (exif) return exif;
  return fs.statSync(filePath).mtimeMs;
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`No photo-originals/ directory found at ${SRC_DIR} — nothing to build.`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Clear previously generated frames so a shrinking source set doesn't
  // leave orphaned wsm-0NN.webp files behind for require.context to pick up.
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (/^wsm-\d+\.webp$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
  }

  const allFiles = fs.readdirSync(SRC_DIR);
  const canonical = pickCanonicalFiles(allFiles);

  const withKeys = canonical.map((name) => {
    const full = path.join(SRC_DIR, name);
    return { name, full, key: sortKey(full) };
  });
  withKeys.sort((a, b) => a.key - b.key || a.name.localeCompare(b.name));

  console.log(`Found ${allFiles.length} files in photo-originals/, ${withKeys.length} unique photos after format-dedup.`);

  withKeys.forEach((item, i) => {
    const tag = String(i + 1).padStart(3, '0');
    const outPath = path.join(OUT_DIR, `wsm-${tag}.webp`);
    execFileSync('magick', [
      item.full,
      '-auto-orient',
      '-strip',
      '-resize', `${CARD_W}x${CARD_H}^`,
      '-gravity', 'center',
      '-extent', `${CARD_W}x${CARD_H}`,
      '-quality', '74',
      outPath,
    ]);
    process.stdout.write(`\r  processed ${i + 1}/${withKeys.length}`);
  });
  console.log('\nDone.');

  const totalBytes = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.webp'))
    .reduce((sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size, 0);
  console.log(`Archive: ${withKeys.length} photos, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total in ${OUT_DIR}`);
}

main();
