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
| Eyebrow | ENGINEER · RESEARCHER · MAKER · INVENTOR · CURIOUS |
| Name (wordmark face) | Wanghley *(read aloud as "Wanghley Soares Martins")* |
| Headline (rotates every 3.6 s; reduced motion shows all five as a list) | Compute at the sensor boundary. · ECE PhD student at Rice. · Engineering powered by *gambiarra*. (gambiarra in copper italic) · Mobilizing ecosystems across the Americas. · Deep tech for human impact. |
| Primary CTA | See my work |
| Ghost CTA | Get in touch |
| Microcopy (mouse) | Move closer. This board is reading you, the way my wrist sensor reads a hand without touching it. |
| Microcopy (touch) | Watch the board read a hand without touching it, the way my wrist sensor does. |
| Instrument line | PHD STUDENT · RICE ECE · HOUSTON 29.72°N 95.40°W · SENSE x.xx pF |
| Classify label | classified: hand · 0.4 ms · 38 µW |

The supporting sentence ("PhD at Rice building wearable biosensors…") was removed by request. Always say "PhD student", never "PhD" alone.

`[[PLACEHOLDER: real latency and power for the classify label (0.4 ms and 38 µW)]]`

---|---|
| Eyebrow | Brazilian engineer · PhD, Rice ECE |
| Name (wordmark face) | Wanghley *(read aloud as "Wanghley Soares Martins")* |
| Headline (words rise in on load) | I put the intelligence inside the sensor. |
| Rotating line ("I also ...", 3.2 s each; all shown at once with reduced motion) | lead teams and communities. · care about social impact. · mentor and judge student engineers. · speak about gambiarra. · organize events across Brazil and the US. |
| Supporting line | PhD at Rice building wearable biosensors and the microwatt AI that runs on them. |
| Primary CTA | See my work |
| Ghost CTA | Get in touch |
| Microcopy (mouse) | Move closer. This board is reading you, the way my wrist sensor reads a hand without touching it. |
| Microcopy (touch) | Watch the board read a hand without touching it, the way my wrist sensor does. |
| Instrument line | RICE ECE · HOUSTON 29.72°N 95.40°W · SENSE x.xx pF |
| Classify label | classified: hand · 0.4 ms · 38 µW |

`[[PLACEHOLDER: real latency and power for the classify label (0.4 ms and 38 µW)]]`

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

## Home page, in order (`src/data/home.js`)

Structure by request: Hero, photos, About, Where I have been, Skills, Projects, Blog, Contact form, Footer. No entrance animations or scroll effects below the hero; native scrolling.

**Photo strip** (six photos from `src/assets/wanghley/strip/`, alt text written by me from what is in each picture, please review) · caption: flag + city + country: Brasília, Brazil → Durham, USA → Houston, USA (drawn SVG flags)

**About.** Heading: Part engineer, part builder, part organizer.
> I'm Wanghley, from Brasília. I design hardware, write the software that runs on it, and organize the people and events around it. I like the places where those three overlap.
> **Resourcefulness.** Gambiarra: the Brazilian art of solving it with what is on the bench. It is the subject of my TEDxDuke talk.
> **Community.** Mentoring, judging and organizing, across Brazil and the US, is part of the work, not a side project.
> **Honesty.** I would rather show the number than the adjective, and say plainly when something is still a sketch.

Buttons: More about me (/about) · Watch the TEDxDuke talk (youtube.com/watch?v=tceoUHQ9rPQ).
`[[PLACEHOLDER: the three values are my draft from your brief; rewrite them in your own words]]`

**Where I have been** (names only, no logos): Studied and researched at Rice University, Duke University · Worked at NetApp, 3D Systems, Nomad · Spoken at and recognized by TEDxDuke, One Young World, Regeneron ISEF, ICYS Belgrade, FEBRACE, BRICS Young Inventor · Led HackBrazil, Brasil Conference.
`[[PLACEHOLDER: add roles and years if you want them shown, e.g. NetApp 2024]]`

**Skills** (from your CMS, grouped by type: Engineering, Software, Data, DevOps, Other).
**Projects** (CMS: capacitive, biosensor and Parkinson's projects first, then the rest; six shown) · link: All projects.
**Blog** (three latest from the CMS) · link: All posts.
**Contact.** Heading: Say hello. Open to industry roles, research collaboration, and speaking and mentoring. Form (name, email, message) sends through Web3Forms; email + LinkedIn, GitHub, Book a call.

**Hero** copy is unchanged (see the first section). Removed from the home page: the signal-chain story, gambiarra section, research list, community map and recognition strip. The gambiarra idea now lives in the About values; the awards are in "Where I have been".
