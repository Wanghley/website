// Layout only: how the CMS content is arranged on the page. Words, links,
// names and numbers all come from the CMS; this file holds only the structure
// the code relies on (anchor ids, the order of groups, which CMS categories
// head which CV section).

// Skill categories in display order. Categories the CMS adds later appear after these.
export const SKILL_ORDER = ['Engineering', 'Software', 'Data', 'DevOps', 'Other'];

// CV sections: the anchor each section gets, and the label in the side navigator.
export const CV_SECTIONS = [
  { id: 'cv-experience', label: 'Experience' },
  { id: 'cv-education', label: 'Education' },
  { id: 'cv-skills', label: 'Skills' },
  { id: 'cv-publications', label: 'Publications' },
  { id: 'cv-certifications', label: 'Certifications' },
];

// CMS experience categories, in page order, with the heading each gets.
export const EXPERIENCE_GROUPS = [
  { type: 'Industry', title: 'Industry' },
  { type: 'Research', title: 'Research' },
  { type: 'Teaching & Mentorship', title: 'Teaching and mentorship' },
  { type: 'Volunteering', title: 'Volunteering' },
];
