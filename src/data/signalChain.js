// ─── Signal chain data — drives SignalChain.js + SignalChainDiagram.js ─────
// Plain data, not JSX, so the pipeline's copy/geometry can be edited without
// touching either renderer. Five stages — SENSE → CONDITION → INFER →
// DEPLOY → IMPACT — are the actual shape of the work described in the old
// About.js paragraph (electronics/sensor interface → signal processing →
// autonomous expert systems → real-world deployment → outcomes), reworded
// into a pipeline rather than one continuous paragraph. No new claims —
// every sentence traces back to the original copy or the real IMPACT_STATS
// below.
//
// `node` coordinates are in the SVG's 1000×620 viewBox space, authored by
// hand (not auto-laid-out) so the chain reads as a deliberate schematic
// route rather than a straight line.
export const STAGES = [
  {
    id: 'sense',
    channel: 'CH:01.1',
    label: 'SENSE',
    heading: 'Sense the physical world.',
    body: 'It starts at the sensor. Custom electronics and interface design capture the physical world — voltage, motion, signal — before any of it becomes data.',
    node: { x: 90, y: 320 },
  },
  {
    id: 'condition',
    channel: 'CH:01.2',
    label: 'CONDITION',
    heading: 'Condition the signal.',
    body: 'Raw signal is noisy, drifting, and full of artifacts. Advanced signal processing turns it into something a model — or a person — can actually trust.',
    node: { x: 310, y: 160 },
  },
  {
    id: 'infer',
    channel: 'CH:01.3',
    label: 'INFER',
    heading: 'Infer, autonomously.',
    body: 'Autonomous expert systems make the call in real time — on the device, at the edge, without waiting on a round trip to the cloud.',
    node: { x: 540, y: 360 },
  },
  {
    id: 'deploy',
    channel: 'CH:01.4',
    label: 'DEPLOY',
    heading: 'Deploy into the real economy.',
    body: 'From critical infrastructure to healthcare, these systems ship into production — not a demo, not a slide deck.',
    node: { x: 760, y: 180 },
  },
  {
    id: 'impact',
    channel: 'CH:01.5',
    label: 'IMPACT',
    heading: 'The result, in numbers.',
    body: "I don't just write the software. I architect the physical systems that run it.",
    node: { x: 920, y: 400 },
  },
];

export const STAGE_EDGES = [
  { a: 'sense', b: 'condition' },
  { a: 'condition', b: 'infer' },
  { a: 'infer', b: 'deploy' },
  { a: 'deploy', b: 'impact' },
];

// Ported from the pass-1 IdentityFocus.js / GambiarraImpact.js STATS —
// these are the IMPACT stage's payload, not a separate card grid. Fake
// per-stat timestamps (e.g. "REC · 2024-11-12") from that version are
// replaced with true qualifiers per the redesign's honesty rule.
export const IMPACT_STATS = [
  {
    value: '$800K+',
    target: 800,
    prefix: '$',
    suffix: 'K+',
    label: 'Grants Secured',
    source: 'DUKE · KARSH · ESTUDAR · BMO',
  },
  {
    value: '100K+',
    target: 100,
    prefix: '',
    suffix: 'K+',
    label: 'Lives Impacted',
    source: 'ENTREPRENEURSHIP · RESEARCH · VOLUNTEERING',
  },
  {
    value: '13',
    target: 13,
    prefix: '',
    suffix: '',
    label: 'Publications',
    source: 'PEER-REVIEWED · BIOMEDICAL ENGINEERING',
  },
  {
    value: '92%',
    target: 92,
    prefix: '',
    suffix: '%',
    label: 'Pilot Satisfaction',
    source: 'PRODUCTION DEPLOYMENTS',
  },
];

// Ported verbatim from About.js.
export const CREDENTIALS = [
  { name: 'Karsh Scholar', sub: 'Duke · Full Merit' },
  { name: 'TEDx Speaker', sub: 'Duke 2023' },
  { name: 'FEBRACE Gold', sub: '1st Place Eng. 2021' },
  { name: 'ISEF Finalist', sub: 'J&J · Biomedical' },
  { name: 'Líder Estudar', sub: 'Fellow' },
  { name: 'Belgrade Gold', sub: "29th Int'l Young Sci." },
  { name: '13 Publications', sub: 'Peer-reviewed · Biomedical' },
  { name: 'Ambulis INC.', sub: 'Co-founder · Oncology AI' },
  { name: 'Duke BIG IDEAs', sub: 'Lab Researcher' },
  { name: '$800K+ Grants', sub: 'Secured' },
];
