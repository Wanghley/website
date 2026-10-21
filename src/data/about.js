// Copy for the About page that is not in the CMS article. The article is written
// as an encyclopedia entry, so the page keeps that frame: a tagline, a hatnote,
// a lead sentence and an infobox. The lead and the hatnote are the owner's own
// words, moved here unchanged.
import { PHOTOS } from './home';

export const ABOUT_PAGE = {
  tagline: 'From the bench, the free encyclopedia',
  pronunciation: '/ˈwɐ̃ŋɡlej/',
  hatnote: 'This article is about Wanghley the individual. For other uses, including quantumly entangled or alternate-universe Wanghleys, see',
  hatnoteLink: 'Wanghley (disambiguation)',
  lead: 'is a technologist, engineer, and innovator known for his work in artificial intelligence, computer science, and biomedical engineering.',
  photo: PHOTOS[0],
  // Used for any row the CMS `personalInfo` does not set. Every fact is in
  // PRODUCT.md or in the article itself.
  infobox: [
    { label: 'Born', key: 'born', value: 'Brasília, Brazil' },
    { label: 'Nationality', key: 'nationality', value: 'Brazilian' },
    { label: 'Education', key: 'education', value: 'Duke University (ECE and CS, 2026); Rice University (ECE, PhD in progress)' },
    { label: 'Occupation', key: 'occupation', value: 'PhD student, Electrical & Computer Engineering, Rice University' },
    { label: 'Known for', key: 'knownFor', value: 'Gambiarra; TEDxDuke 2023 talk' },
    { label: 'Website', key: 'website', value: 'https://wanghley.com' },
  ],
};
