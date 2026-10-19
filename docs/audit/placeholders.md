# Open placeholders (after Phase 5)

None of these shows as text on the live page; they are the facts the site is still missing.

Rows 2 to 9 describe home sections that were removed in the home restructure (`4d619f8fc`):
`signalChain.js`, `sensorTrace.js`, `WORK`, `RESEARCH` and `GAMBIARRA` no longer exist. Say which are still wanted.

| # | What I need | Where it goes | Status on the page |
|---|---|---|---|
| 1 | Real latency and power for the wrist sensor (0.4 ms, 38 µW are stand-ins) | `src/lib/benchState.js` (`CLASSIFY_LABEL`), `src/data/signalChain.js`, chip in the chain figure | Shown as is |
| 2 | A real capacitive-sensor capture (time, pF CSV) | `src/lib/sensorTrace.js` (`buildTrace()`) | Labelled "ILLUSTRATIVE · SIMULATED TRACE" |
| 3 | Constraint (µW / ms / $ BOM), result (one number) and role for each featured project | `WORK.pick` in `src/data/home.js` | Facts table hidden until all three exist |
| 4 | Photo of an early, scrappy prototype | `GAMBIARRA.photo` in `src/data/home.js` | Section stands without it |
| 5 | The exact case-study slug for each of the five chain stages | `src/data/signalChain.js` (`link.href`) | All five link to `/projects` |
| 6 | Your own words for the three values (Resourcefulness, Community, Honesty) | `STORY.values` in `src/data/signalChain.js` | My draft is live |
| 7 | Check the gambiarra manifesto and the "spends battery and adds delay" line | `src/data/home.js`, `src/data/signalChain.js` | My draft is live |
| 8 | ISEF year; what the BRICS Young Inventor award was | `RECOGNITION` in `src/data/home.js` | Shown without them |
| 9 | Verify the Google Scholar link (Google rate-limited my check) | `RESEARCH.scholar` | Live |
| 10 | Brand-guide file, if you have one (tokens came from the brief) | `src/components/css/bench-tokens.css` | n/a |
| 11 | Role type, start window and work authorization, for an "Open to" table on the CV | `src/data/cv.js` | Not shown; the CV says only what PRODUCT.md says |
| 12 | Three real numbers (µW, ms, $ BOM), each with its project, for a datasheet block on the CV | `src/data/cv.js` | Not shown |
| 13 | For a capacitive-sensing case study: a real capture (time, pF CSV), a photo of the prototype, and lab approval to show it | a new project entry in the CMS, then `PROJECTS.pick` in `src/data/home.js` | No such project page yet |
