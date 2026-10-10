// Signal-chain copy. One sentence per stage, in first person, plus one link.
// Mirrored in /copy.md. Numbers marked * are illustrative until measured:
// [[PLACEHOLDER: real latency and power from the wrist sensor]]
// Link targets are the projects index until the exact case-study slugs are
// confirmed: [[PLACEHOLDER: project slug for each stage]]
export const STAGES = [
  {
    id: 'sense',
    label: 'Sense',
    heading: 'The electrode feels a hand.',
    body: 'My electrode reads a hand without touching it: the field moves from 0.18 to 2.14 pF, buried in noise.',
    link: { href: '/projects', text: 'Non-contact capacitive sensing' },
  },
  {
    id: 'condition',
    label: 'Condition',
    heading: 'The front-end cleans it up.',
    body: 'Analog filtering strips the hum and the drift, so the signal is clean before it goes anywhere.',
    link: { href: '/projects', text: 'Mixed-signal front-ends' },
  },
  {
    id: 'infer',
    label: 'Infer',
    heading: 'Features, not raw data.',
    body: 'I pull out the three numbers that matter (onset, peak, dwell) right next to the sensor, not in the cloud.',
    link: { href: '/projects', text: 'TinyML on embedded hardware' },
  },
  {
    id: 'deploy',
    label: 'Deploy',
    heading: 'The model lives on the chip.',
    body: 'The classifier runs on a microcontroller in 0.4 ms at 38 µW*, which is small enough to wear.',
    link: { href: '/projects', text: 'Near-sensor accelerators' },
    note: '* Illustrative until measured on the wrist sensor.',
  },
  {
    id: 'impact',
    label: 'Impact',
    heading: 'A human-sized answer.',
    body: 'Out comes a hand, recognised, before any raw data leaves the sensor.',
    link: { href: '/projects', text: "AI-driven Parkinson's diagnostic (ISEF)" },
  },
];
