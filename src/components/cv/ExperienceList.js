import React from 'react';
import CvEntry, { CvText } from './Entry';
import { CV } from '../../data/cv';

// "2025-06-01" -> "06/2025". Split, not parsed: no timezone can move a month.
const monthYear = (d) => {
  const [y, m] = String(d).split('-');
  return m ? `${m}/${y}` : y;
};
const span = (start, end) => [start && monthYear(start), end ? monthYear(end) : 'Present'].filter(Boolean).join(' – ');

const ExperienceList = ({ experiences = [] }) => (
  <>
    <h2 className="cv-section__title">Experience</h2>
    {CV.experienceGroups.map(({ type, title }) => {
      const rows = experiences.filter((e) => e.attributes.type === type);
      if (!rows.length) return null;
      return (
        <div key={type} className="cv-group">
          <h3 className="cv-group__title">{title}</h3>
          <ul className="cv-list">
            {rows.map(({ id, attributes: a }) => (
              <CvEntry key={id} when={span(a.start, a.end)} where={a.location?.description} org={a.company} role={a.title}>
                <CvText>{a.description}</CvText>
              </CvEntry>
            ))}
          </ul>
        </div>
      );
    })}
  </>
);

export default ExperienceList;
