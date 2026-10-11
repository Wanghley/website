# Open placeholders (after Phase 5)

None of these shows as text on the live page; they are the facts the site is still missing.

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
