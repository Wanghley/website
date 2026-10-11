// Home page copy and data for the sections after the About lead. Mirrored in
// /copy.md. Anything in [[PLACEHOLDER: ...]] is a fact the owner has not
// supplied; the site shows it plainly rather than inventing it.

export const WORK = {
  heading: 'Things I built.',
  // Shown while the project list loads, and if the CMS is unreachable.
  fallback: [
    { title: 'Non-contact capacitive sensor V3', teaser: 'Reading hand and wrist movement without touching the skin.', href: '/projects' },
    { title: 'Biosensor inks', teaser: 'Printable carbon inks for wearable electrochemical sensors.', href: '/projects' },
    { title: "AI-driven Parkinson's diagnostic", teaser: 'Regeneron ISEF finalist project.', href: '/projects' },
  ],
  // Projects to feature first, matched by title. Facts stay hidden on a card
  // until all three are filled in (nothing is invented, nothing shows empty).
  // [[PLACEHOLDER: constraint (µW / ms / $ BOM), result (one number) and role for each project]]
  pick: [
    { match: /capacitive/i, constraint: '', result: '', role: '' },
    { match: /ink|biosensor/i, constraint: '', result: '', role: '' },
    { match: /parkinson/i, constraint: '', result: '', role: '' },
  ],
};

export const GAMBIARRA = {
  heading: 'When the part is not in the drawer, I make it work.',
  paragraphs: [
    'Gambiarra is the Brazilian art of fixing it with what you have. You do not wait for the right part. You look at the bench, you improvise, and a lot of the time it works better than the plan.',
    'I took that habit into engineering. Microwatts, milliseconds and a bill of materials are my constraints, and constraints are where the good ideas show up. A tidy lab never taught me that.',
    'I gave a talk about it at TEDxDuke in 2023.',
  ],
  talk: { href: 'https://www.youtube.com/watch?v=tceoUHQ9rPQ', text: 'Watch the TEDxDuke talk' },
  // [[PLACEHOLDER: photo of an early, scrappy prototype]]. Drop the file in
  // src/assets and set `photo` to its import; the section picks it up.
  photo: null,
};

export const RESEARCH = {
  heading: 'Papers and posters.',
  // Shown when the publications service is unreachable. Mirrors the CMS entries.
  fallback: [
    { year: '2026', title: 'Hybrid Mixed-Signal Conditioning for Non-Contact Capacitive Sensing of Hand Kinematics for Biomedical Applications', venue: '2026 Global Medical Engineering Physics Exchanges / Pan American Health Care Exchanges (GMEPE/PAHCE)' },
    { year: '2026', title: 'Design and refinement of a non-contact capacitive sensor system for hand and wrist kinematics', venue: '2026 Global Medical Engineering Physics Exchanges / Pan American Health Care Exchanges (GMEPE/PAHCE)' },
    { year: '2025', title: 'Protocol for anonymizing data collected in scientific research: biomedical signals, videos, and qualitative data', venue: '16th Biomedical Engineering Symposium (SEB 2025)' },
    { year: '2025', title: "Data Analysis and Machine Learning Techniques for Predicting Characteristic Movement Patterns of Parkinson's Disease", venue: 'IFMBE Proceedings, vol 125. Springer' },
  ],
  scholar: { href: 'https://scholar.google.com/citations?user=sN2iKrkAAAAJ', text: 'All of it on Google Scholar' },
};

export const ECOSYSTEM = {
  heading: 'I build the rooms, too.',
  lede: 'The work does not happen alone. I spend real hours on the people and the events around it, in Brazil and in the US.',
  roles: [
    { what: 'HackBrazil', role: 'Vice President', when: '2026' },
    { what: 'Brasil Conference', role: 'President of Communication and People & Management', when: '' },
    { what: 'TEDxDuke', role: 'Speaker', when: '2023' },
    { what: 'Mentoring and judging', role: 'Student competitions in Brazil and the US', when: '' },
  ],
  route: [
    { name: 'Brasília', lat: -15.79, lon: -47.88 },
    { name: 'Durham', lat: 36.0, lon: -78.9 },
    { name: 'Houston', lat: 29.72, lon: -95.4 },
  ],
};

export const RECOGNITION = [
  { year: '2023', name: 'ICYS Belgrade', what: 'Gold medal' },
  { year: '2021', name: 'FEBRACE', what: 'Gold medal' },
  { year: '2021', name: 'BRICS Young Inventor', what: '' },
  { year: 'Finalist', name: 'Regeneron ISEF', what: '' },
  { year: '2023', name: 'One Young World', what: 'Summit representative' },
];

export const CONTACT = {
  heading: 'Say hello.',
  open: 'Open to industry roles, research collaboration, and speaking and mentoring.',
  email: 'me@wanghley.com',
  links: [
    { href: 'https://linkedin.com/in/wanghley', text: 'LinkedIn' },
    { href: 'https://github.com/wanghley', text: 'GitHub' },
    { href: 'https://cal.com/wanghley', text: 'Book a call' },
  ],
};
