# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Priority order:
1. Recruiters and hiring managers at hardware and health teams. They decide in seconds whether this is their kind of engineer.
2. Academics and collaborators in wearable and point-of-care biosensing.
3. Founders, event organizers and curious visitors.

Each audience must find its path within one scroll.

## Product Purpose
Personal site of Wanghley Soares Martins: a Brazilian engineer, first-year PhD student in Electrical & Computer Engineering at Rice University (Houston) in Dr. Juliane Sempionatto's lab (wearable and point-of-care biosensors), and Duke ECE/CS dual-degree graduate (Karsh International Scholar). Success: a stranger knows within 10 seconds that this is a Brazilian engineer, a Rice PhD, doing near-sensor AI for wearables.

## Positioning
Thesis: push computation as close to the physical sensor as physics allows. Mixed-signal front-ends, analog feature extraction and ultra-low-power near-sensor accelerators that classify and extract biomarkers before data crosses the system bus. Microwatts, not cloud.

Three identities, one person: PhD researcher (in-sensor and near-sensor architectures, non-contact capacitive sensing, mixed-signal ASIC design, TinyML), deep-tech builder (latency, milliwatt budgets, BOM and silicon area as product constraints), and ecosystem leader.

Philosophy: gambiarra, the Brazilian art of resourceful problem-solving under constraint. It is the subject of the TEDxDuke talk and is the emotional center of the site.

## Operating Context
Live capacitive-sensing demo: SENSE readout of about 0.18 pF to 2.14 pF as a hand approaches. The five-stage signal chain is Sense, Condition, Infer, Deploy, Impact. Location is Rice, Houston: 29.72°N, 95.40°W.

## Capabilities and Constraints
- Stack: Create React App, React 18, React Three Fiber, GSAP, Lenis, framer-motion. Projects, blog and skills come from a Strapi CMS.
- Budgets: LCP < 2.5s on 4G mid-range phone, CLS < 0.05, INP < 200ms, initial JS < 200 KB gzipped (3D chunk lazy and excluded).
- Open to: industry internships and roles, research collaboration, speaking and mentoring.
- Ventures: none named publicly for now. Omit the section until the user decides.
- Brazil-to-US route: Brasília (hometown, capital of Brazil) → Durham → Houston.
- TEDxDuke talk: https://www.youtube.com/watch?v=tceoUHQ9rPQ
- Sensor data for the signal chain is simulated (no real recording exists yet). It must be labelled as illustrative wherever shown and swapped for a real capture when available.
- Undecided: real classification numbers (latency and power), Google Scholar and lab links to be verified.

## Brand Commitments
- Wordmark face: the current wide geometric face (Lost In Space), for the name and logo only.
- Logo gradient #14242C, #2770B5, #46AAE0.
- Voice: first person, active, short sentences, numbers over adjectives, a little playful, occasional natural Portuguese. Ban list: leverage, cutting-edge, seamless, revolutionize, unlock, empower, passionate, innovative, "where X meets Y", synergy.
- Never invent facts about the user. Unknowns become `[[PLACEHOLDER: ...]]`.
- The custom 3D Funko appears at most three times: hero on the board, a gambiarra still, and contact.

## Evidence on Hand
Proof points: ICYS Belgrade 2023 gold, FEBRACE 2021 gold, BRICS Young Inventor 2021, Regeneron ISEF finalist (AI-driven Parkinson's diagnostic), One Young World Summit 2023 representative, TEDxDuke 2023 speaker, Opportunity Funds scholar. Industry experience at NetApp, 3D Systems and Nomad. Roles: VP of HackBrazil 2026, President of Communication and People & Management at Brasil Conference, mentor and competition judge in Brazil and the US.

Assets in the repo: 57 personal photos (src/assets/wanghley/archive), off-duty photos, an optimized rigged Funko GLB (public/models/wsm-figure.glb), projects/blog/skills in the CMS, news in src/data/news.js.

Handwriting: `Signatures/` (gitignored) holds signature.svg (a vectorized signature, potrace) and Rubrica.png (a flourish mark). It also holds a bank PDF that must never be opened or published.

Absent, must not be fabricated: real capacitive sensor recording (a simulated one is allowed if labelled), handwritten notes, KiCad or scope captures, prototype photos, brand guide file.

## Product Principles
1. Real beats rendered: every section carries an artifact only the user could have produced.
2. One signal, one story: motion exists to explain how a signal is transformed near the sensor.
3. Restraint is the premium signal: fewer effects, executed perfectly.
4. Numbers over adjectives; first person; a confident engineer explaining the bench to a curious friend.
5. Designed static and mobile states, not degraded ones.

## Accessibility & Inclusion
WCAG 2.2 AA, full keyboard navigation, visible copper focus states, semantic landmarks, reduced-motion end-states designed per set piece, canvas marked decorative with a text equivalent.
