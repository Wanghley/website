// Signal-chain copy. One sentence per stage, in first person, plus one link.
// Mirrored in /copy.md. Numbers marked * are illustrative until measured:
// [[PLACEHOLDER: real latency and power from the wrist sensor]]
// Link targets are the projects index until the exact case-study slugs are
// confirmed: [[PLACEHOLDER: project slug for each stage]]
// The story that frames the figure: who I am, why it matters, how I work.
// Facts come only from the brief: Brazilian, from Brasilia, PhD at Rice in
// Dr. Juliane Sempionatto's lab, Duke ECE/CS as a Karsh International Scholar,
// gambiarra, TEDxDuke 2023.
export const STORY = {
  kicker: 'About me',
  heading: 'Why I put the computing inside the sensor.',
  who: [
    "I'm Wanghley, a Brazilian engineer from Brasília. I'm a PhD student at Rice, in Dr. Juliane Sempionatto's lab, building wearable and point-of-care biosensors. Before that I studied ECE and CS at Duke as a Karsh International Scholar.",
  ],
  why: [
    'Most wearables send raw data to the cloud and wait for an answer. That spends battery and adds delay. I do the opposite: I classify the signal right at the sensor, in microwatts, before anything crosses the bus.',
    'My method is gambiarra, the Brazilian art of solving it with what you have on the bench. It was the subject of my TEDxDuke talk.',
  ],
  links: [
    { href: '/about', text: 'More about me', primary: true },
    { href: 'https://www.youtube.com/watch?v=tceoUHQ9rPQ', text: 'Watch the TEDxDuke talk', external: true },
  ],
  figureKicker: 'The idea, in one signal',
  closing: 'That is the whole idea. The projects below are the same chain, built.',
};

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
