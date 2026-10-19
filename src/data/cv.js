// Copy for the CV page that is not in the CMS. The lede is the home page's own
// meta description; "open to" is the list on PRODUCT.md and the home contact.
// [[PLACEHOLDER: role type, start window and work authorization, for an "Open to" table]]
// [[PLACEHOLDER: three real numbers (µW, ms, $ BOM) with their projects, for a datasheet block]]
export const CV = {
  lede: 'PhD student in Electrical & Computer Engineering at Rice University, building non-contact capacitive biosensors and edge AI that runs on microcontrollers.',
  open: 'Open to industry roles and internships, research collaboration, speaking and mentoring.',
  sections: [
    { id: 'cv-experience', label: 'Experience' },
    { id: 'cv-education', label: 'Education' },
    { id: 'cv-skills', label: 'Skills' },
    { id: 'cv-publications', label: 'Publications' },
    { id: 'cv-certifications', label: 'Certifications' },
  ],
  // CMS experience types, in page order, with the heading each gets
  experienceGroups: [
    { type: 'Industry', title: 'Industry' },
    { type: 'Research', title: 'Research' },
    { type: 'Teaching & Mentorship', title: 'Teaching and mentorship' },
    { type: 'Volunteering', title: 'Volunteering' },
  ],
};
