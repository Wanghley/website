#!/usr/bin/env node
/**
 * Generates the hero's mobile composite image: a single static WebP of the
 * finished circuit board + hologram head at its "near" (fully resolved)
 * state, used below 768px instead of mounting any live 3D (see
 * HeroCircuitBoard.js and hooks/useCanRender3D.js's `narrowDisqualifies`)
 * or the SVG fallback scene — both are pointer-driven and pointless on a
 * touch device with no cursor.
 *
 * Renders the REAL production build in a real (headless) browser rather
 * than trying to reproduce the R3F scene's lighting/shader/bloom stack in
 * Node — same reasoning as build-head-precompute.js's offline rasterizer
 * for the SVG fallback still, just via Playwright instead of a custom
 * rasterizer, since this needs the actual live scene's pixels, not a
 * from-scratch re-render.
 *
 * Not wired into `yarn build` — deliberately run once and the output
 * committed (same "generated once, checked in" pattern as
 * build-photo-archive.js / build-head-precompute.js). Re-run manually via
 * `yarn build-hero-composite` whenever the board/head composition changes
 * enough to make the mobile still look stale.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const OUT_DIR = path.join(ROOT, 'public/hero');
const OUT_FILE = path.join(OUT_DIR, 'mobile-composite.webp');

// Displayed at 16:10 with object-fit: cover on a full-width mobile banner
// — exported at exactly that aspect so nothing is cropped at the target
// width (800x640, a 5:4 the brief also mentions, would need ~11% cropped
// off the top/bottom to fit a 16:10 slot, right through the head).
const CAPTURE_W = 1600; // 2x the 800px display width
const CAPTURE_H = 1000; // 2x the 500px display height (16:10 at that width)
const OUT_W = 800;
const OUT_H = 500;
const MAX_BYTES = 150 * 1024;

// Minimal static file server for build/ — no `serve`/`serve-handler`
// dependency for a one-off dev script. Only needs to handle the one page
// this loads plus its own referenced assets (hashed JS/CSS chunks,
// wsm-head.glb, webp images), so a small extension→MIME map and an
// index.html fallback for extensionless paths is enough; not a general-
// purpose static server.
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.map': 'application/json',
};

function serveBuild() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(BUILD_DIR, urlPath === '/' ? 'index.html' : urlPath);
      if (!filePath.startsWith(BUILD_DIR)) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(BUILD_DIR, 'index.html');
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log('No build/ found — running `react-scripts build` first (this takes a minute)...');
    execFileSync('npx', ['react-scripts', 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = await serveBuild();
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/`;

  const browser = await chromium.launch({
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: CAPTURE_W, height: CAPTURE_H } });
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the real R3F head to resolve (see CharacterHead.js's own
    // 'hero-head-ready' mark) rather than a fixed timeout — this capture
    // must show the actual finished model, not a mid-load placeholder.
    await page.waitForFunction(
      () => performance.getEntriesByName('hero-head-ready').length > 0,
      { timeout: 30000 }
    );
    // One more beat for the board's own fade-in + the head's material to
    // settle at its resting opacity.
    await page.waitForTimeout(500);

    // Force proximity to 1 (the "near" state) by dispatching a real
    // pointermove at the sensor anchor's center — the same element
    // HeroChamber.js's own pointermove handler measures distance against
    // (hero-circuit-r3f__sensor-anchor for the R3F path).
    const anchor = page.locator('.hero-circuit-r3f__sensor-anchor');
    const box = await anchor.boundingBox();
    if (!box) throw new Error('Sensor anchor not found — did the R3F scene actually mount? (useCanRender3D() gate)');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
    // Hold at "near" long enough for the head's opacity/scan-line lerp and
    // the bloom to settle at their near-state values (CharacterHead.js
    // damps toward its target at a fixed per-frame rate, not instantly).
    await page.waitForTimeout(900);

    // Hide the text column and the reference-card overlay before
    // capturing: an element screenshot crops to that element's on-screen
    // RECT, not an isolated render of just that element — at desktop
    // viewport widths .hero-chamber__collage's box visually overlaps
    // .hero-chamber__stage's text column (the name/tagline bleed into the
    // capture otherwise), and the reference card/leader-line is a live-UI
    // feature that shouldn't be baked into a static composite meant to
    // read as just "the board + head."
    await page.evaluate(() => {
      const stage = document.querySelector('.hero-chamber__stage');
      if (stage) stage.style.display = 'none';
      const ref = document.querySelector('.reference-frame');
      if (ref) ref.style.display = 'none';
      // The fixed navbar overlaps the collage box's top inset (2vh) too —
      // same "the screenshot crops to a screen RECT, not an isolated
      // element" issue as the text column above.
      const nav = document.querySelector('.nav');
      if (nav) nav.style.display = 'none';
    });

    const collage = page.locator('.hero-chamber__collage');
    const shot = await collage.screenshot();

    // The collage box (bled past the section's own bottom edge, see
    // HeroChamber.css's `inset-block: 2vh -6vh`) is much closer to square
    // than the 16:10 target, and the head sits in its upper third — a
    // centered `cover` crop pushed the head's top out of frame. Anchoring
    // the crop to the top keeps the head fully in frame and crops the
    // board's own empty lower-right corner instead, which loses nothing
    // that matters at a 56px-tall mobile banner.
    const resizeOpts = { fit: 'cover', position: 'top' };
    let quality = 85;
    let buffer = await sharp(shot).resize(OUT_W, OUT_H, resizeOpts).webp({ quality }).toBuffer();
    while (buffer.length > MAX_BYTES && quality > 30) {
      quality -= 10;
      buffer = await sharp(shot).resize(OUT_W, OUT_H, resizeOpts).webp({ quality }).toBuffer();
    }
    if (buffer.length > MAX_BYTES) {
      throw new Error(
        `Could not get under ${MAX_BYTES} bytes even at quality ${quality} (got ${buffer.length} bytes) — ` +
        'the source screenshot likely needs simplifying (less busy background), not just more compression.'
      );
    }

    fs.writeFileSync(OUT_FILE, buffer);
    console.log(`Wrote ${path.relative(ROOT, OUT_FILE)} — ${(buffer.length / 1024).toFixed(1)}KB at quality ${quality}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
