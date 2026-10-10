# Phase 0 audit: wanghley.com ("The Bench" redesign)

Date: 2026-10-10 · Branch: `redesign/the-bench` · No site source changed in this phase.
Screenshots: `docs/screenshots/audit-2026-10/` (`local|live` × `375|768|1440` × `fold|full`, plus `local-1440-reduced.png`).
Headless Chromium used software GL, so WebGL looks may differ from a real GPU. Treat the pixel-level canvas findings as to be re-verified in Phase 1.

## 1. Stack and what each heavy library does

| Library | Where | Purpose | Verdict |
|---|---|---|---|
| CRA (react-scripts 5), React 18.2, react-router 6 | everywhere | app shell, routes (all lazy except Home) | keep |
| three 0.158, @react-three/fiber 8, drei 9.89 | `home/circuit3d/*`, `CharacterHead.js` | hero board + Funko | keep, re-light |
| @react-three/postprocessing, postprocessing | `CircuitBoardR3F.js:221-224` | Vignette + Bloom | **remove** (vignette = dark circle) |
| gsap + ScrollTrigger | `HeroChamber`, `SignalChain`, `VentureShowcase` | pinned and scrubbed sections | keep (needed for the one pinned section) |
| lenis | `useScrollToSection` | smooth scroll | keep, set lerp ≈ 0.1 |
| framer-motion | `HeroChamber`, `ClosingTransmit` | entrance staggers | candidate to drop (GSAP covers it) |
| posthog-js | `src/index.js` | analytics | keep, defer load |
| mermaid, katex, react-syntax-highlighter | `ProjectPost.js`, `BlogPost.js` | case-study/blog rendering | keep but **fix the eager import (see §4)** |
| chart.js, react-chartjs-2 | `SkillsRadarChart.js` (unused) | nothing | **remove** |
| emailjs | `Contact.js` | contact form | keep |
| ShaderGradient | not installed | none | nothing to remove |
| "React Bits" effects | local `components/bits/` (`DecryptedText`, `PhraseCycle`, `TypeCycle`, `OscilloscopeReadout`) plus `SplitText`, `CountUp`, `SpotlightCard`, `Magnet` | text scramble, typewriter cycle | **remove** the banned ones, keep `OscilloscopeReadout` (rewritten) |

Dead code: `home/IdentityFocus`, `home/TechMatrix`, `home/HeroPhotoArchive`, `three/AmbientBackdrop` + shaders, `bits/TypeCycle`, legacy `Hero.js`, `SkillsRadarChart`.

## 2. Your audit: confirmed

| Item | Status | Evidence |
|---|---|---|
| Wrong coordinates (Durham) | **Confirmed** | `HeroChamber.js:319`, legacy `Hero.js:298`: `36.0°N · 78.9°W`. Needs `29.72°N · 95.40°W`. |
| Canvas hard edge / dark vignette | **Confirmed in code** | Vignette `offset .25 / darkness .55` + Bloom (`CircuitBoardR3F.js:221-224`); `.hero-chamber__collage` is a box (`right:-5vw; width:clamp(500px,68vw,1050px)`, no mask, `HeroChamber.css:135-149`) with a `__scrim` gradient (`:61-73`). Measured canvas box at 1440: x=533, w=979, so it ends at 1512px, past the viewport. |
| Seam / band under hero | **Visible at 375** | `local-375-fold.png`: hard dark band where the collage image ends (y≈205). Bottom grey gradient comes from `__scrim`. Re-verify on GPU in Phase 1. |
| Logo vs hero left edge | **Confirmed** | 1440px: logo x=68, h1 x=55, nav container x=20 (1400px wide). Three different left edges. Hero content has no shared container. |
| Funko hidden / blue / hologram | **Confirmed** | `CharacterHead.js:162-273`: toon material + blue duotone remap, Fresnel rim, scan lines, dissolve, shoulder clip plane, inverted-hull outline. Lighting is cool-blue only (ambient `#3AAFF1`, rim `#2770B5`). The Funko head is roughly 250px tall on a 900px viewport (by eye from the screenshot). **Note:** the mesh is already rigged (Hips/Spine/Head, Wave/ThumbsUp/LookAround/Salute clips), so head look-at and the contact wave need no new rigging. |
| Template palette | **Confirmed** | `design-system.css:19-80`: void `#06070e`, abyss `#0a0b14`, surface `#0f1120`, and the blue token is named `--ds-gold`. Glow CTA `box-shadow` on "See My Work". |
| Typewriter headline / scramble | **Confirmed** | `PhraseCycle` ("I build ___" with a cursor), `DecryptedText` on NOMINAL and the closing-section readouts. Live site shows "FPGA Pipelines ▸" (a different, older cycle). |
| Template copy | **Confirmed** | "Where physical limits meet digital intelligence." (`SignalChain.js:108-113`), "Engineer · Researcher · Maker". No first person, Brazil, gambiarra or numbers. |
| Typography chaos | **Confirmed, worse** | Rendered: JetBrains Mono ×180, Montserrat ×91, Orbitron ×40 (+ Inter on live). Loaded: Lost In Space, Nunito, Open Sans (local) and Playfair, Space Grotesk, Inter, JetBrains Mono, Orbitron, Montserrat (Google). Nine families downloaded; only the wordmark face is intentional. |
| System Profile empty, 4 numbering systems | **Confirmed** | Side index `01–05`, `CH:01`, `CH:01.1 · 01/05`, stage labels. Section labels go `CH:00, 01, 02, 03, 05, 06, 04` (out of order). |
| Nav overload | **Confirmed** | 5 icon buttons (`Navbar.js:65-71`: LinkedIn, Instagram, GitHub, Lattes, Scholar) + 5 text links. |

## 3. Things your audit missed

1. **The main JS bundle is 828 KB gzipped (budget 200 KB).** Root cause: `src/components/index.js:7` imports `ProjectPost` eagerly, so mermaid, katex and syntax-highlighter land in `main`, defeating the `lazy()` route in `App.js:22`. The main chunk also contains posthog, gsap/ScrollTrigger, lenis and cytoscape. Largest lazy chunks: 242 KB, 154 KB and 136 KB gzipped (not yet identified; likely the 3D and markdown stacks).
2. **Live site Lighthouse (mobile, simulated):** Performance **29**, Accessibility 95, Best Practices 100, SEO 100. FCP 3.3 s, **LCP 34.5 s** (a headless measurement; the real figure will differ, but the trend is bad), TBT 5.2 s, CLS 0, page weight 5.9 MB. The Lighthouse trace crashed once at the end of the run; the numbers above come from the JSON it wrote before that.
3. **The live site and the local build differ.** The live site is the older hero ("FPGA Pipelines", "Origin Story", a 60-second brief). The redesign work in progress is only local.
4. **`public/index.html` is stale:** title "Wanghley – Sci & Tech", two conflicting meta descriptions, OG tags only injected at runtime by Helmet (crawlers that don't run JS see none), OG image is the logo, not the Funko-on-board.
5. **Dev-only warning risk:** `REACT_APP_cms_api_token` is a Bearer token compiled into the client bundle (`src/api/*.js`). Anything under `REACT_APP_` ships to every visitor. Confirm it is a read-only public token.
6. **Content placeholders on the page:** `news.js` dates are "2026-08-XX (confirm)"; the hero bio is marked as a placeholder at `HeroChamber.js:396`.
7. **Raw 3D sources** (about 520 MB) sat untracked inside `src/`. They're now gitignored (kept out of the CRA watcher is still open: consider moving them out of `src/`).
8. **Mobile:** below 768px the hero serves a static `mobile-composite.webp` that still contains the hologram head, so the mobile Funko inherits the blue-hologram problem.
9. **Contrast:** `--signal #3AAFF1` on `#0E0F10` measures 7.84:1 on `#0E0F10` and 7.47:1 on `#141516`, so it passes AA. Copper `#F5A623` is 9.47:1 and paper `#F2EFE9` is 16.7:1. The old muted label colour `#5A6575` is only 3.25:1 on `#0E0F10`, which fails AA for small text. That is a likely cause of the 95 accessibility score (not verified against the Lighthouse failure list).

## 4. Baseline numbers

| Metric | Budget | Now |
|---|---|---|
| Initial JS (gzip) | < 200 KB | **828 KB** (`main`) |
| LCP (mobile, Lighthouse) | < 2.5 s | 34.5 s (live site, headless) |
| CLS | < 0.05 | 0 |
| TBT | n/a (INP < 200 ms) | 5.2 s |
| Page weight | n/a | 5.9 MB |
| Funko model | < 3 MB | 1.5 MB meshopt GLB (OK, but no KTX2/poster) |

## 5. Asset gap: what I need from you (nothing here will be invented)

| Needed | Used in | Status |
|---|---|---|
| Capacitive sensor data CSV (time, pF) | Phase 3 signal chain | missing, `/brief-assets/` doesn't exist |
| Handwriting scan (notes, signature) → SVG | margin annotations, notebook cards | missing |
| Prototype photos (early scrappy builds) | gambiarra section, work cards | missing, the 57 `wsm-*.webp` are portraits/life photos |
| KiCad / schematic screenshots, scope captures | work cards, signal chain | missing |
| Real classification numbers (latency, µW) | hero label | `[[PLACEHOLDER]]` |
| Hometown in Brazil | Brazil↔US route | `[[PLACEHOLDER]]` |
| TEDxDuke talk URL | gambiarra section | `[[PLACEHOLDER]]` |
| Brand-guide file (only the token values in your brief are available) | tokens | partial |
| Screenshots you referenced (2, 3) | audit | not in repo, I made my own |

## 6. Tooling notes
- Real Impeccable (v4.5.2) installed globally; the old typeui skill is renamed `impeccable-typeui-old`. `/impeccable init` produced `PRODUCT.md`. `/quieter` is the `quieter` sub-command of `/impeccable`.
- Impeccable added hooks to the project's the local settings file (not tracked by git).

## 7. Proposed removals (for approval)
`chart.js`, `react-chartjs-2`, `@react-three/postprocessing`, `postprocessing` (and the `resolutions` entry), `framer-motion` (if GSAP covers entrances), plus the dead components listed in §1 and the banned text effects.
