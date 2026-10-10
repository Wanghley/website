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

## Signal chain (`src/data/signalChain.js`)

Section heading: **How a hand becomes a decision.** (kicker: From the electrode to the answer)
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
