# Phase 7: one Bench across every page

Baseline taken 2026-10-18 on branch `redesign/bench-everywhere`, before any change.
Plan: a local plan file.

## Traffic (PostHog project 448421, last 90 days)

Project default test-account filter; the owner's own visits may still be in these numbers.

| Page | Visitors | Views | Bounce |
|---|---|---|---|
| `/` | 117 | 434 | 5% |
| `/curriculum-vitae` | 34 | 131 | 17% |
| `/projects` | 26 | 88 | 75% |
| `/blog` | 18 | 50 | 0% |
| `/about` | 14 | 55 | 33% |
| `/contact` | 7 | 13 | 33% |

Referrers (visitors): direct 77, google.com 22, pratt.duke.edu 22, linkedin.com 15, github.com 3.
Home already sends `home_hero_cta_clicked`, `home_hero_contact_clicked` and `contact_form_submitted`.
Nothing is sent for project or blog card clicks, the About and TEDx links, the contact links, or
contact form errors.

## Build baseline (`yarn build`, gzipped)

| Asset | Size |
|---|---|
| `main.*.js` | 117.19 kB |
| `main.*.css` | 15.41 kB |
| all JS + CSS, 86 files | 1843.3 kB |

Budget: initial JS < 200 KB gzipped.

## Visual baseline

`yarn start`, then `node scripts/capture-routes.js before`. Writes
`docs/screenshots/phase-7/before-<route>-<width>.jpg` for 12 routes at 375, 768 and 1440,
and prints overflow and console errors for each.

Two things make a capture untrustworthy, and the script now guards against both:

- The CMS can answer late. My first run photographed `/about` while it still said "Loading…".
  The script waits until the page height holds still for 2 s and warns if a loader or
  skeleton is on screen.
- `/projects` and `/blog` fade cards in with an `IntersectionObserver`. A fast scroll leaves
  rows hidden. The script walks the page slowly. Captured twice, those two pages differ by at
  most about 2,100 pixels (the floating background blobs).

Problems already present before this work:

- `/projects/stepdrop`: React `validateDOMNesting` warning, a `<div>` inside a `<p>` (CMS markdown).
- `/privacy` at 375px: 55px of horizontal overflow.

## Phase 0 result

Removed 17 components and 16 stylesheets that had no importer outside the old barrel
(`GambiarraImpact`, `TechArchitecture`, `SignatureProject`, `GridFeatured`, `GridFeaturedBlog`,
`EcgRibbon`, `LiveTelemetryChip`, `ChannelRail`, `Timeline`, `SectionDivider`, `SkillFilterChips`,
`Skills`, `SkillCard`, `Card`, `BlogCard`, `About`, `CustomArrows`): 33 files, 6,706 lines.
`About.css` stays because the live `About-text.js` imports it. `components/index.js` now exports
only what `pages/about.js` and `pages/contact.js` use.

- **Build:** `main.js` is unchanged (117.19 kB, -2 B). The one chunk that changed is the one the
  about and contact pages load: its CSS went from 13.22 to 8.53 kB (-4.69 kB), its JS stayed at
  6.21 kB. All JS + CSS: 1843.3 to 1838.6 kB. This is hygiene, not a speed win.
- **Visuals:** every route keeps the same page height at all three widths. Pixel diffs are 0 on
  `/about`, `/projects/:slug`, `/blog/:slug`, `/curriculum-vitae`, `/contact`, `/privacy`,
  `/data-policy` and the 404. On home, styleguide and the two list pages they stay under about
  2,100 pixels (0.05%), which is the animated hero readout and the floating backgrounds.
  Nothing moved, so the deleted CSS was not holding anything up.

## Phase 1 result: the shared page kit

`src/components/css/bench-page.css` and `src/components/bench/` hold the pieces the inner pages
will reuse: `SilkLabel` and `SilkRule`, `PageHeader`, `SpecTable`, `Prose`, and `BenchCard` with
`BenchCards`. The band, title, link and card rules came out of `home/css/Sections.css` and were
renamed `hm-*` to `bp-*`; the home About values are now a `SpecTable` and the project and blog
cards are `BenchCard`s. `Sections.css` keeps only what is specific to the home page.

- **Home is unchanged.** The original code was re-shot with the slow scroll and compared with the
  kit version at 375, 768 and 1440: page heights match and every pixel below the hero is identical.
  The hero differs only where it animates. (The Phase 0 home baseline was refreshed for this.)
- **Navbar:** the light theme is gone. The bar is graphite on every page and transparent only on the
  home hero. 56 lines of CSS and the colour-logo import were removed. CV, privacy, legal and the 404
  now show a graphite bar over a light page until those pages are rebuilt.
- **A bug the first render caught:** `global.css` sets the colour, size and line-height of every
  bare `<p>`, plus heading sizes, an inline-code border and the `hr` look. Those beat the values
  `Prose` set on its container, so paragraphs on a light band came out at about 1.8:1. `Prose` now
  takes each element back. All 22 measured contrast checks on `/styleguide` pass (paragraph text
  8.7:1, links 5.3:1, silkscreen label 5.5:1 on light and 6.4:1 on dark), and the paragraph
  line-height is the designed 1.70.
- **Silkscreen labels** are drawn as a designator at the end of a hairline, not as a label stacked
  over the heading, and carry only the designator (`U2`), not `U2 · PROJECTS`.
- **Build:** `main.js` 117.19 to 117.61 kB (+0.42), `main.css` 15.41 to 16.05 kB (+0.64). No lint
  warnings. `scripts/e2e-home.js`: 48 of 48 pass.
- **Capture script:** it now also waits until `scrollY` is 0 before shooting, because a full-page
  shot taken at any other offset puts the fixed navbar and the skip link in the wrong place.
- The "empty tile" cards in the Phase 6 screenshots were lazy images that had not loaded yet, not
  a site bug.
- Baselines for the pages rebuilt in Phases 2 and 3 are re-shot just before each is touched.

## Critique fixes (2026-10-18, snapshot in `.impeccable/critique/`, 23/32)

- The TEDx link on the About band went from 2.13:1 to 5.3:1 (`bp-link`). The `/contact` form
  subtitle went from 1.00:1 at 9.9px to 6.4:1 at 12px.
- The nav no longer glows on hover or on the active link, and its indicator and hamburger use the
  Bench ease-out instead of overshooting curves (`--ease-spring` now maps to it too).
- The home project cards lead with the FPGA ECG/EMG device, the Plessey EPIC sensor board,
  ArgusView, Neuromappr, StepDrop and Swipe-o-matic. A card needs an image and a written teaser.
  The old picks (capacitive, biosensor, parkinson) matched no title.
- Left alone on purpose, by your call: the hero copy and rotation (so the headline still has no
  pause control, a WCAG 2.2.2 gap) and the `0.4 ms · 38 µW` stand-ins.

## Phase 2 result: CV, Projects, project pages

**CV** (`/curriculum-vitae`) is a component datasheet: a dark title band with the name, a Rice
affiliation line (the home page's own meta description), a mono keyword line, contact links, an
"Open to" line and two actions; then a paper body with a sticky contents rail and dated entries.
One entry pattern replaces four copies. It has an A4 print sheet (black on white, no page chrome).
Loading and error states are designed, with a retry and an email fallback.

**Projects** (`/projects`) lost the stat counters ("20+ Technologies" and "15+ Deployed" had no
source), the "Latest project" block with its stock-photo fallback, the filter panel, the grid/list
toggle, the sort menu and the floating back-to-top button. It keeps search (with the ⌘K shortcut
and Escape to clear), category chips with counts, and the PostHog events. Everything loads in one
request, so search and filters cover every project; before, they covered only the pages scrolled
so far. A failed load and an empty result are now different states.

**Project pages** (`/projects/:slug`): one `h1` (write-up headings shift down so the shallowest is
an `h2`), a TOC rail (a `<details>` on narrow screens), the write-up in the kit's `Prose`, diagrams
drawn in the Bench light palette, a shared Bench syntax theme (`src/lib/benchPrism.js`), and a
gallery whose thumbnails are buttons and whose lightbox is a real dialog. Dropped: the reading-
progress bar, the floating action bar that repeated the header links, the mobile TOC drawer, the
quick-links block, the back-to-top button, and the gallery's carousel, fullscreen and thumbnail strip.

**Bugs fixed on the way**

- Date-only values shifted a day in US timezones: `new Date("2024-01-01")` rendered as December
  2023 in Houston. `formatDate` now reads the parts, which fixes the CV, project pages and posts.
- Every inline `code` span in a project write-up rendered as a block `<div>` inside its paragraph
  (react-markdown 9 has no `inline` flag). That was the `validateDOMNesting` warning from the
  baseline; the warning is gone.
- `react-markdown` 9 ignores `className`, so the CV descriptions never got their styles.
- The ghost button was white on a translucent white border, illegible on the paper band.
- The CV's print header printed pale on white until the print theme reached each band's own vars.

**Checks**

- Production build: no warnings. `main.js` 117.92 kB (+0.31 kB), `main.css` 16.10 kB; all JS and
  CSS 1841.0 to 1825.7 kB.
- axe (WCAG 2.2 A and AA plus best practice) at 1440 and 375 on `/`, `/curriculum-vitae`,
  `/projects`, `/projects/stepdrop`: 0 failing rules after fixing heading order, unlabelled task-list
  checkboxes, a diagram SVG with no role, and scrolling code blocks and tables with no keyboard
  access. The home photo strip had the same scroll problem and was fixed too.
- The detector returns no findings on the rebuilt files. `scripts/e2e-home.js`: 48 of 48.
- Keyboard walk: every stop on `/projects` and the CV shows a ring, in a sensible order.
- CV print: A4, 7 pages, because the CMS entries are long.

## Phase 3 result: blog, About, Contact, 404, legal

**Shared first.** The project page and the blog post were the same 400 lines twice, so what they
share moved to `src/components/article/`: the helpers, Mermaid, the table of contents, share, the
markdown renderer (`ArticleBody`) and two scroll hooks. The Projects and Blog lists share
`components/css/list-page.css` (search, category chips, empty and loading states). One article
stylesheet (`article.css`) replaced a 2,003-line project one and a 1,833-line blog one.

- **Blog** (`/blog`, `/blog/:slug`): the same pattern as Projects (`U3`), with the 100-post load,
  search with ⌘K, chips with counts, and related posts as cards. The old tagline leaned on "the
  intersection of technology, health and social impact"; the lede is now plain.
- **About** (`/about`): kept as the encyclopedia entry, as you chose. A title with its pronunciation,
  the tagline "From the bench, the free encyclopedia", a contents rail numbered the way Wikipedia
  numbers it (the list, not every heading), the hatnote, an infobox, and the article in `Prose`.
  The CMS parsing for references and citations is unchanged. References are now escaped before
  they are linked (the old code injected CMS text as raw HTML). The page title is now "About
  Wanghley Martins | PhD student, Rice ECE".
- **Contact** (`/contact`): the same form as the home page, opening the page. The legacy
  `Contact.js`, its 1,004-line stylesheet and its newsletter form are gone. That form only opened
  Substack in a new tab with the visitor's email in the URL; the footer still links to the
  newsletter.
- **404:** "Eita! Sem sinal.", a mono readout (`SENSE 0.00 pF · no signal`), the visitor's actual
  path, and three exits. The EEG canvas and framer-motion are gone. The site is a single-page app
  on Firebase hosting, so the HTTP status is still 200; the page carries `noindex` instead.
- **Privacy and data policy:** your copy is unchanged byte for byte. The 55px overflow on
  `/privacy` at 375px is fixed. The cookie table scrolls in a focusable frame.

**Bugs fixed on the way**

- A heading could skip a level (an `h3` straight after the `h1`). A heading now never sits more
  than one level below the one before it, and the table of contents indents by that depth.
- A `# comment` inside a fenced code block was read as a heading.
- Table cells in a scrolling table no longer squeeze to slivers on a phone.

**Checks**

- Production build: no warnings. `main.js` 116.38 kB (down 1.54 kB), `main.css` 15.27 kB; all JS
  and CSS 1825.7 to 1794.9 kB.
- axe at 1440 and 375 on `/`, `/about`, `/blog`, a blog post, `/curriculum-vitae`, `/projects`,
  a project page, `/contact`, `/privacy`, `/data-policy` and a 404: 0 failing rules in all 22 runs.
- The detector reports no findings across the whole of `src/pages` and `src/components` (it
  started this work at 32). The last six were dead gradient-text utilities and three bouncy easing
  tokens, now removed.
- `scripts/e2e-home.js`: 48 of 48. Keyboard walks on About, Contact and Blog: every stop shows a ring.
- The capture script now waits for a loader to leave before it waits for the height to settle: a
  skeleton has a steady height too.

**For you to check**

- The privacy policy says you are "based at Duke University, Durham, NC". It is your legal text, so
  I left it; it is out of date next to the rest of the site.
- The About infobox falls back to six rows I wrote from PRODUCT.md and your article (born in
  Brasília, Brazilian, Duke and Rice, PhD student at Rice, known for gambiarra and the TEDxDuke
  talk, wanghley.com). They are in `src/data/about.js`. Any row the CMS `personalInfo` sets
  overrides mine.
- The About lead sentence ("known for his work in…") and the hatnote joke are yours, moved to
  `src/data/about.js` unchanged.

## Content to fix in the CMS (Strapi), which only you can do

- **Education** has no Rice entry, and the CV text never mentions Rice (18,122 characters, 0 times).
- **Address** says "Durham, NC, USA"; the rest of the site says Houston.
- **Certifications:** one title is garbled ("…Thoughtful Online Search Thoughtful Online Search").
- **Neurostimulator custom connector:** the description is "TO BE WRITTEN" and there is no teaser.
- **Image Recovery with Regularized Regression:** its featured image is a Gandalf still.
- **Systemic.bio** has no teaser.
- Your Research entry at the Federal Institute of Brasília already describes "a novel non-contact
  capacitive sensing platform utilizing Electric Potential Sensors". That is the work the hero is
  about, in your own words, and it has no project page yet.
