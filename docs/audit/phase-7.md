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
The home sections after the hero send no analytics events.

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
