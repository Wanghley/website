// Home page copy and data for the sections after the About lead. Mirrored in
// /copy.md. Anything in [[PLACEHOLDER: ...]] is a fact the owner has not
// supplied; the site shows it plainly rather than inventing it.

export const WORK = {
  kicker: 'Selected work',
  heading: 'Things I built, with their numbers.',
  // Shown while the project list loads, and if the CMS is unreachable.
  fallback: [
    { title: 'Non-contact capacitive sensor V3', teaser: 'Reading hand and wrist movement without touching the skin.', href: '/projects' },
    { title: 'Biosensor inks', teaser: 'Printable carbon inks for wearable electrochemical sensors.', href: '/projects' },
    { title: "AI-driven Parkinson's diagnostic", teaser: 'Regeneron ISEF finalist project.', href: '/projects' },
  ],
  constraint: '[[PLACEHOLDER: constraint in µW / ms / $ BOM]]',
  result: '[[PLACEHOLDER: result as one number]]',
  role: '[[PLACEHOLDER: my role]]',
};

export const GAMBIARRA = {
  kicker: 'Gambiarra',
  heading: 'When the part is not in the drawer, I make it work.',
  paragraphs: [
    'Gambiarra is the Brazilian art of fixing it with what you have. You do not wait for the right part. You look at the bench, you improvise, and a lot of the time it works better than the plan.',
    'I took that habit into engineering. Microwatts, milliseconds and a bill of materials are my constraints, and constraints are where the good ideas show up. A tidy lab never taught me that.',
    'I gave a talk about it at TEDxDuke in 2023.',
  ],
  talk: { href: 'https://www.youtube.com/watch?v=tceoUHQ9rPQ', text: 'Watch the TEDxDuke talk' },
  photoNote: '[[PLACEHOLDER: photo of an early, scrappy prototype]]',
};

export const RESEARCH = {
  kicker: 'Research',
  heading: 'Papers and posters.',
  scholar: { href: 'https://scholar.google.com/citations?user=sN2iKrkAAAAJ', text: 'All of it on Google Scholar' },
};

export const ECOSYSTEM = {
  kicker: 'Community',
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
  { year: '', name: 'Regeneron ISEF', what: 'Finalist' },
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
