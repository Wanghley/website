import React from 'react';
import { SpecTable } from '../bench';
import { SKILLS } from '../../data/home';

const EXPERTISE = { Basic: 1, Intermediate: 2, Proficient: 3, Advanced: 4 };
const rank = (category) => { const i = SKILLS.order.indexOf(category); return i < 0 ? SKILLS.order.length : i; };

// The CMS groups skills by category, in no set order. Categories follow the
// home page (Engineering first); within a group the strongest come first.
const SkillsList = ({ skills }) => {
  const groups = skills && typeof skills === 'object' ? Object.keys(skills).sort((a, b) => rank(a) - rank(b)) : [];
  const rows = groups.map((category) => ({
    label: category,
    value: [...skills[category]]
      .sort((a, b) => (EXPERTISE[b.expertise] ?? 0) - (EXPERTISE[a.expertise] ?? 0))
      .map((s) => s.name)
      .join(', '),
  }));

  return (
    <>
      <h2 className="cv-section__title">Skills</h2>
      {rows.length ? <SpecTable rows={rows} keyWidth="10.5rem" /> : <p className="cv-empty">No skills listed yet.</p>}
    </>
  );
};

export default SkillsList;
