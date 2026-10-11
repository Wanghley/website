// Home page copy and data, in page order. Mirrored in /copy.md.
// Anything in [[PLACEHOLDER: ...]] is a fact the owner has not supplied; the
// page shows nothing for it rather than inventing it.
import p003 from '../assets/wanghley/strip/wsm-003.webp';
import p054 from '../assets/wanghley/strip/wsm-054.webp';
import p007 from '../assets/wanghley/strip/wsm-007.webp';
import p037 from '../assets/wanghley/strip/wsm-037.webp';
import p016 from '../assets/wanghley/strip/wsm-016.webp';
import p033 from '../assets/wanghley/strip/wsm-033.webp';

export const PHOTOS = [
  { src: p003, alt: 'Wanghley smiling in a navy suit in front of a Brazil-themed backdrop' },
  { src: p054, alt: 'Wanghley laughing in brown overalls and a flat cap, with forested hills behind' },
  { src: p007, alt: 'Wanghley in a grey suit in a leather armchair in a wood-panelled library' },
  { src: p037, alt: 'Wanghley in a graduation gown and cap, holding a framed Duke Pratt School of Engineering diploma' },
  { src: p016, alt: 'Wanghley in a blue graduation gown with arms crossed, in front of a garden gazebo' },
  { src: p033, alt: 'Wanghley in a light blue suit lying back on a bench that reads Great Ideas Bench' },
];
export const PHOTO_CAPTION = 'Brasília → Durham → Houston';

export const ABOUT = {
  heading: 'Part engineer, part builder, part organizer.',
  lede: "I'm Wanghley, from Brasília. I design hardware, write the software that runs on it, and organize the people and events around it. I like the places where those three overlap.",
  // [[PLACEHOLDER: confirm or rewrite the three values in your own words]]
  values: [
    { name: 'Resourcefulness', text: 'Gambiarra: the Brazilian art of solving it with what is on the bench. It is the subject of my TEDxDuke talk.' },
    { name: 'Community', text: 'Mentoring, judging and organizing, across Brazil and the US, is part of the work, not a side project.' },
    { name: 'Honesty', text: 'I would rather show the number than the adjective, and say plainly when something is still a sketch.' },
  ],
  links: [
    { href: '/about', text: 'More about me', primary: true },
    { href: 'https://www.youtube.com/watch?v=tceoUHQ9rPQ', text: 'Watch the TEDxDuke talk', external: true },
  ],
};

export const TRUST = {
  heading: 'Where I have been',
  groups: [
    { label: 'Studied and researched at', names: ['Rice University', 'Duke University'] },
    { label: 'Worked at', names: ['NetApp', '3D Systems', 'Nomad'] },
    { label: 'Spoken at and recognized by', names: ['TEDxDuke', 'One Young World', 'Regeneron ISEF', 'ICYS Belgrade', 'FEBRACE', 'BRICS Young Inventor'] },
    { label: 'Led', names: ['HackBrazil', 'Brasil Conference'] },
  ],
};

export const SKILLS = {
  heading: 'What I work with',
  // order of the groups on the page
  order: ['Engineering', 'Software', 'Data', 'DevOps', 'Other'],
  // Shown if the skills service is unreachable; mirrors the CMS.
  fallback: [
    { name: 'Altium', type: 'Engineering' }, { name: 'Autodesk Eagle', type: 'Engineering' }, { name: 'Fusion 360', type: 'Engineering' }, { name: 'Simulink', type: 'Engineering' },
    { name: 'Python', type: 'Software' }, { name: 'C++', type: 'Software' }, { name: 'JavaScript', type: 'Software' }, { name: 'Java', type: 'Software' }, { name: 'React', type: 'Software' },
    { name: 'PyTorch', type: 'Data' }, { name: 'Tensorflow', type: 'Data' }, { name: 'Keras', type: 'Data' }, { name: 'PostgreSQL', type: 'Data' }, { name: 'Dagster', type: 'Data' },
    { name: 'Docker', type: 'DevOps' }, { name: 'AWS EC2', type: 'DevOps' }, { name: 'Kubernetes', type: 'DevOps' },
    { name: 'LaTeX', type: 'Other' }, { name: 'Linux', type: 'Other' }, { name: 'Figma', type: 'Other' },
  ],
};

export const PROJECTS = {
  heading: 'Projects',
  // Featured first, matched by title; the rest follow in CMS order.
  pick: [/capacitive/i, /ink|biosensor/i, /parkinson/i],
  count: 6,
  fallback: [
    { title: 'Non-contact capacitive sensor V3', teaser: 'Reading hand and wrist movement without touching the skin.', href: '/projects' },
    { title: 'Biosensor inks', teaser: 'Printable carbon inks for wearable electrochemical sensors.', href: '/projects' },
    { title: "AI-driven Parkinson's diagnostic", teaser: 'Regeneron ISEF finalist project.', href: '/projects' },
  ],
};

export const BLOG = { heading: 'From the blog', count: 3 };

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
