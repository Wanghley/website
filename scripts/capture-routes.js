/**
 * Full-page screenshots of every route at three widths, for before/after review.
 *   yarn start   (or serve a production build)
 *   BASE_URL=http://localhost:3000 node scripts/capture-routes.js <label> [route,route,...]
 * Writes docs/screenshots/phase-7/<label>-<route>-<width>.jpg and prints, per
 * route and width, horizontal overflow and console errors, so a regression
 * shows up in the text output as well as in the pictures.
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const label = process.argv[2] || 'shot';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const OUT = path.join(__dirname, '..', 'docs', 'screenshots', 'phase-7');
const GL = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

const ROUTES = [
  ['home', '/'],
  ['about', '/about'],
  ['projects', '/projects'],
  ['project-stepdrop', '/projects/stepdrop'],
  ['blog', '/blog'],
  ['blog-post', '/blog/from-classroom-to-startup-floor-how-my-i-and-e-coursework-fuels-every-venture'],
  ['cv', '/curriculum-vitae'],
  ['contact', '/contact'],
  ['privacy', '/privacy'],
  ['data-policy', '/data-policy'],
  ['styleguide', '/styleguide'],
  ['404', '/no-such-page'],
];
const WIDTHS = [[375, 812], [768, 1024], [1440, 900]];

const up = () => new Promise((resolve) => {
  http.get(BASE, (res) => { res.resume(); resolve(res.statusCode === 200); }).on('error', () => resolve(false));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (let i = 0; i < 90 && !(await up()); i++) await sleep(2000);
  if (!(await up())) { console.error(`Nothing answering at ${BASE}`); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ args: GL });
  for (const [name, route] of ROUTES) {
    if (only && !only.includes(name)) continue;
    for (const [w, h] of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message.slice(0, 100)));
      page.on('console', (m) => {
        if (m.type() === 'error' && !/ReadPixels|GPU stall/.test(m.text())) errors.push(m.text().slice(0, 100));
      });
      await page.goto(BASE + route, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(name === 'home' ? 3500 : 1500);
      // CMS content can arrive late (cold start). A skeleton has a steady height
      // too, so first wait (up to ~30 s) for any loader to go, then wait until
      // the page height holds still for 2 s, so a loader is never photographed.
      const isPending = () => page.evaluate(() =>
        [...document.querySelectorAll('body *')].some((el) => !el.children.length && /^loading[.…]*$/i.test(el.textContent.trim()))
        || document.querySelectorAll('[class*="skeleton"]').length > 0);
      for (let i = 0; i < 40 && (await isPending()); i++) await page.waitForTimeout(750);
      let last = -1, still = 0;
      for (let i = 0; i < 50 && still < 4; i++) {
        const hh = await page.evaluate(() => document.documentElement.scrollHeight);
        still = hh === last ? still + 1 : 0;
        last = hh;
        await page.waitForTimeout(500);
      }
      // Walk the page slowly so lazy images and reveal-on-scroll content (an
      // IntersectionObserver plus a fade) finish before the picture is taken.
      // A fast walk leaves some rows hidden and makes before/after diffs noisy.
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += Math.round(h * 0.6)) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(300); }
      await page.evaluate((v) => scrollTo(0, v), H);
      await page.waitForTimeout(1000);
      // The site eases scrolling, so wait until the page has really landed at the
      // top. A full-page shot taken at any other offset puts fixed elements (the
      // navbar, the skip link) in the wrong place.
      for (let i = 0; i < 20 && (await page.evaluate(() => scrollY)) !== 0; i++) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(250);
      }
      await page.waitForTimeout(800);
      if ((await page.evaluate(() => scrollY)) !== 0) console.log(`WARN ${name} ${w}px is not at the top; fixed elements will be misplaced`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (await isPending()) console.log(`WARN ${name} ${w}px still shows a loader or skeleton; this capture is not a valid baseline`);
      const file = `${label}-${name}-${w}.jpg`;
      await page.screenshot({ path: path.join(OUT, file), fullPage: true, type: 'jpeg', quality: 70 });
      console.log(`${name.padEnd(17)} ${String(w).padStart(4)}px  overflow=${overflow}  errors=${errors.length}${errors.length ? '  ' + errors[0] : ''}`);
      await ctx.close();
    }
  }
  await browser.close();
})();
