// Signal-chain copy. One sentence per stage, in first person, plus one link.
// Mirrored in /copy.md. Numbers marked * are illustrative until measured:
// [[PLACEHOLDER: real latency and power from the wrist sensor]]
// Link targets are the projects index until the exact case-study slugs are
// confirmed: [[PLACEHOLDER: project slug for each stage]]
// The "about me" lead: values, not résumé. Deliberately says nothing about
// research focus or who I work with (the owner asked for that). Facts come
// only from the brief: Brazilian, from Brasilia, gambiarra and TEDxDuke,
// mentoring and judging across Brazil and the US, organizing (HackBrazil,
// Brasil Conference). The value statements are DRAFTS for the owner to edit:
// [[PLACEHOLDER: confirm or rewrite the three values in your own words]]
export const STORY = {
  kicker: 'About me',
  heading: 'What I care about, and how I work.',
  lede: "I'm Wanghley, from Brasília. I'm an engineer, a builder and an organizer, and I like being all three at once.",
  values: [
    {
      name: 'Resourcefulness',
      text: 'Gambiarra: solve it with what is on the bench. Constraints make the work better, and I gave a TEDxDuke talk on it.',
    },
    {
      name: 'Community',
      text: 'Mentoring, judging and organizing, across Brazil and the US, is part of the work, not a side project.',
    },
    {
      name: 'Honesty',
      text: 'I would rather show the number than the adjective, and say plainly when something is still a sketch.',
    },
  ],
  links: [
    { href: '/about', text: 'More about me', primary: true },
    { href: 'https://www.youtube.com/watch?v=tceoUHQ9rPQ', text: 'Watch the TEDxDuke talk', external: true },
  ],
  figureKicker: 'One example of how I work',
  closing: 'That is one example. The projects below show the rest.',
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
