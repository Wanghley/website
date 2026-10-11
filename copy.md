# Site copy

Edit here, then mirror into the component named in each heading. Anything in
`[[PLACEHOLDER: ...]]` is a fact I don't have; the site never invents it.
Voice: first person, short sentences, numbers over adjectives. Banned words:
leverage, cutting-edge, seamless, revolutionize, unlock, empower, passionate,
innovative, "where X meets Y", synergy.

---

## Hero (`src/components/home/HeroChamber.js`)

| Slot | Copy |
|---|---|
| Eyebrow | Brazilian engineer · PhD, Rice ECE |
| Name (wordmark face) | Wanghley *(read aloud as "Wanghley Soares Martins")* |
| Headline | I put the intelligence inside the sensor. |
| Supporting line | PhD at Rice building wearable biosensors and the microwatt AI that runs on them. |
| Primary CTA | See my work |
| Ghost CTA | Get in touch |
| Microcopy (mouse) | Move closer. This board is reading you, the way my wrist sensor reads a hand without touching it. |
| Microcopy (touch) | Watch the board read a hand without touching it, the way my wrist sensor does. |
| Instrument line | RICE ECE · HOUSTON 29.72°N 95.40°W · SENSE x.xx pF |
| Classify label | classified: hand · 0.4 ms · 38 µW |

`[[PLACEHOLDER: real latency and power for the classify label. 0.4 ms and 38 µW are illustrative until you measure them on the wrist sensor.]]`

### Headline: five alternatives in your voice

1. **I put the intelligence inside the sensor.** *(current)* Plain statement of the thesis.
2. **My AI runs on microwatts, next to the skin.** Puts the number and the place in the first line.
3. **I teach sensors to think before they send.** Playful, and it says "near-sensor" without the jargon.
4. **The model lives on the chip, not in the cloud.** Short and contrarian; the cloud is the foil.
5. **Gambiarra, but for silicon.** Brazilian, ties the hero to the TEDx talk; needs the supporting line to carry the research.

---

## Placeholders still open (hero scope)

- `[[PLACEHOLDER: classify label numbers]]`
- `[[PLACEHOLDER: real capacitive-sensor capture to replace the simulated trace]]`

---

## About story + signal chain (`src/data/signalChain.js`, `STORY` and `STAGES`)

Kicker: About me · Heading: **What I care about, and how I work.**

> I'm Wanghley, from Brasília. I'm an engineer, a builder and an organizer, and I like being all three at once.
>
> **Resourcefulness.** Gambiarra: solve it with what is on the bench. Constraints make the work better, and I gave a TEDxDuke talk on it.
> **Community.** Mentoring, judging and organizing, across Brazil and the US, is part of the work, not a side project.
> **Honesty.** I would rather show the number than the adjective, and say plainly when something is still a sketch.

Links: **More about me →** (/about) · Watch the TEDxDuke talk ↗ (youtube.com/watch?v=tceoUHQ9rPQ)
Figure kicker: One example of how I work · Closing: That is one example. The projects below show the rest.

By request this block does not state the research focus or name collaborators. (The figure below it still demonstrates one project; say if you want it cut or moved.)

`[[PLACEHOLDER: the three values are my draft from your brief (gambiarra, mentoring/judging/organizing, numbers over adjectives). Rewrite them in your own words.]]`

Interaction: no pinning or scroll-scrubbing. The figure is sticky; the step in the middle of the screen takes focus and the waveform morphs once over 900ms.
One numbering system only: 01-05. Tag on the figure: ILLUSTRATIVE · SIMULATED TRACE.

| # | Stage | Heading | Sentence | Link |
|---|---|---|---|---|
| 01 | Sense | The electrode feels a hand. | My electrode reads a hand without touching it: the field moves from 0.18 to 2.14 pF, buried in noise. | Non-contact capacitive sensing |
| 02 | Condition | The front-end cleans it up. | Analog filtering strips the hum and the drift, so the signal is clean before it goes anywhere. | Mixed-signal front-ends |
| 03 | Infer | Features, not raw data. | I pull out the three numbers that matter (onset, peak, dwell) right next to the sensor, not in the cloud. | TinyML on embedded hardware |
| 04 | Deploy | The model lives on the chip. | The classifier runs on a microcontroller in 0.4 ms at 38 µW*, which is small enough to wear. | Near-sensor accelerators |
| 05 | Impact | A human-sized answer. | Out comes a hand, recognised, before any raw data leaves the sensor. | AI-driven Parkinson's diagnostic (ISEF) |

\* Illustrative until measured on the wrist sensor.

Open placeholders for this section:

- `[[PLACEHOLDER: real capacitive-sensor capture (time, pF CSV)]]` replaces the simulated trace in `src/lib/sensorTrace.js`.
- `[[PLACEHOLDER: real latency and power]]` for 0.4 ms and 38 µW.
- `[[PLACEHOLDER: project slug for each stage's link]]` (all five point at /projects today).
- "Condition" and "Deploy" sentences describe the work in general terms; confirm they match the projects you want to link.

---

## Phase 4 sections (`src/data/home.js`)

Order: Hero, About + one example, Selected work, Gambiarra, Research, Community + Recognition, Contact, Footer. Ventures omitted by request. Removed from the home page: dispatches/blog strip, off-duty photos, capability graph, news, old closing band (the blog and CV pages are untouched).

**Selected work.** Heading: Things I built, with their numbers. Cards pull title, one-line teaser and photo from your CMS (first four projects by start date). Each shows Constraint / Result / My role.
`[[PLACEHOLDER: constraint (µW / ms / $ BOM), result as one number, and role for each card]]`. Add them per project in `WORK` or as CMS fields.

**Gambiarra.** Heading: When the part is not in the drawer, I make it work. (about 85 words)
> Gambiarra is the Brazilian art of fixing it with what you have. You do not wait for the right part. You look at the bench, you improvise, and a lot of the time it works better than the plan.
> I took that habit into engineering. Microwatts, milliseconds and a bill of materials are my constraints, and constraints are where the good ideas show up. A tidy lab never taught me that.
> I gave a talk about it at TEDxDuke in 2023.

Button: Watch the TEDxDuke talk (youtube.com/watch?v=tceoUHQ9rPQ). Figure: pre-rendered thumbs-up (`/hero/figure-thumbs.webp`).
`[[PLACEHOLDER: photo of an early, scrappy prototype]]`. Confirm the "improvise ... works better than the plan" line is true to you.

**Research.** Heading: Papers and posters. List comes from the CMS publications; link: All of it on Google Scholar. No lab link and no research-interests blurb, by request.

**Community.** Heading: I build the rooms, too. HackBrazil (Vice President, 2026); Brasil Conference (President of Communication and People & Management); TEDxDuke (Speaker, 2023); Mentoring and judging (student competitions in Brazil and the US). A thin copper line draws once: Brasília, Durham, Houston.
**Recognition.** ICYS Belgrade (2023, gold medal) · FEBRACE (2021, gold medal) · BRICS Young Inventor (2021) · Regeneron ISEF (finalist) · One Young World (2023, summit representative).
`[[PLACEHOLDER: ISEF year; what BRICS Young Inventor was awarded]]`

**Contact.** Heading: Say hello. Open to industry roles, research collaboration, and speaking and mentoring. Email me@wanghley.com + LinkedIn, GitHub, Book a call. The figure waves (pre-rendered loop).

**Header:** two icons (LinkedIn, GitHub). **Footer:** graphite, all five socials.
