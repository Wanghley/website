// The photo strip on the home page. The images are site assets, so they stay in
// the repo; the words that describe them are the owner's and are kept with them.
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

// The page's photos are fixed, and the CMS `photo` type holds uploads (not yet
// synced); the photo strip uses this list until the images move to the CMS.
