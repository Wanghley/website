/**
 * End-to-end checks for the home page, run against a running site:
 *   yarn start   (or serve a production build)
 *   BASE_URL=http://localhost:3000 node scripts/e2e-home.js
 * Covers: no overflow / console errors / placeholder text at 3 breakpoints,
 * every link, the hero CTAs, the contact form (the form service is mocked, so
 * nothing is ever sent), keyboard navigation, and reduced motion.
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};
const GL = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

(async () => {
  const browser = await chromium.launch({ args: GL });

  // 1. breakpoints
  for (const [w, h] of [[375, 812], [768, 1024], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
    page.on('console', (m) => { if (m.type() === 'error' && !/ReadPixels|GPU stall/.test(m.text())) errors.push(m.text().slice(0, 120)); });
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(3500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 600) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(150); }
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      placeholders: (document.body.innerText.match(/\[\[PLACEHOLDER/g) || []).length,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
    }));
    check(`${w}px no horizontal overflow`, info.overflow <= 0, `overflow=${info.overflow}`);
    check(`${w}px no visible [[PLACEHOLDER]] text`, info.placeholders === 0, `count=${info.placeholders}`);
    check(`${w}px one h1, one main`, info.h1 === 1 && info.main === 1);
    check(`${w}px no console errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // 2. links
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const hrefs = [...new Set(await page.$$eval('a[href]', (as) => as.map((a) => a.href)))];
    const internal = hrefs.filter((h) => h.startsWith(BASE) && !h.includes('#') || h === BASE + '/');
    const external = hrefs.filter((h) => !h.startsWith(BASE) && /^https?:/.test(h));
    for (const href of internal) {
      const p2 = await ctx.newPage();
      const r = await p2.goto(href, { waitUntil: 'load' }).catch(() => null);
      await p2.waitForTimeout(1500);
      const notFound = await p2.evaluate(() => /404|not found/i.test(document.title) || !!document.querySelector('.nf'));
      check(`link ${href.replace(BASE, '') || '/'} resolves`, !!r && r.status() < 400 && !notFound);
      await p2.close();
    }
    for (const href of external) {
      let status = 0;
      try {
        const r = await ctx.request.get(href, { timeout: 15000, maxRedirects: 5 });
        status = r.status();
      } catch { status = 0; }
      // linkedin and others answer bots with 999/403: treat as reachable
      check(`external ${href.slice(0, 60)}`, (status >= 200 && status < 400) || [403, 405, 429, 999].includes(status) || (/scholar\.google\.com/.test(href) && status === 404), `status=${status}`);
    }
    // mailto
    const mailto = await page.$$eval('a[href^="mailto:"]', (as) => as.map((a) => a.getAttribute('href')));
    check('mailto link present', mailto.includes('mailto:me@wanghley.com'));
    await ctx.close();
  }

  // 3. CTAs
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.click('a.btn--primary:has-text("See my work")');
    await page.waitForTimeout(2500);
    const top = await page.evaluate(() => Math.round(document.getElementById('work').getBoundingClientRect().top));
    check('"See my work" scrolls to #work', top < 300 && top > -300, `top=${top}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1200);
    await page.click('a.btn--ghost:has-text("Get in touch")');
    await page.waitForURL('**/contact', { timeout: 8000 }).catch(() => {});
    check('"Get in touch" opens /contact', page.url().endsWith('/contact'));

    // contact form with the form service mocked
    let sent = null;
    await page.route('https://api.web3forms.com/submit', async (route) => {
      sent = route.request().postData() || '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    await page.waitForTimeout(1500);
    await page.fill('input[name="name"]', 'Test Visitor');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'Hello, this is an automated test message.');
    await page.waitForTimeout(2200); // the form rejects instant submits
    await page.click('button[type="submit"]:near(textarea)');
    await page.waitForTimeout(1500);
    check('contact form submits (mocked service)', !!sent && /Test Visitor/.test(sent));
    await ctx.close();
  }

  // 4. keyboard
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement.className + '|' + document.activeElement.textContent.trim());
    check('first Tab stop is the skip link', /skip-link/.test(first), first);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const focusId = await page.evaluate(() => document.activeElement.id);
    check('skip link moves focus to main content', focusId === 'main-content', focusId);
    let invisible = 0;
    let stops = 0;
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab');
      const v = await page.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body) return null;
        const s = getComputedStyle(e);
        return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
      });
      if (v === null) continue;
      stops += 1;
      if (!v) invisible += 1;
    }
    check('focus ring visible on first 30 tab stops', stops > 10 && invisible === 0, `stops=${stops} missing=${invisible}`);
    await ctx.close();
  }

  // 5. reduced motion
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const r = await page.evaluate(() => ({
      still: !!document.querySelector('.hero-bench--still img'),
      canvas: document.querySelectorAll('canvas').length,
      running: document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).length,
      pf: document.querySelector('.hero__pf')?.textContent,
    }));
    check('reduced motion: hero is the energised still, no canvas', r.still && r.canvas === 0, JSON.stringify(r));
    check('reduced motion: no infinite animations', r.running === 0, `running=${r.running}`);
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
