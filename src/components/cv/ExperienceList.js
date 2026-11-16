import React from 'react';
import CvEntry, { CvText } from './Entry';
import { EXPERIENCE_GROUPS } from '../../data/layout';

// "2025-06-01" -> "06/2025". Split, not parsed: no timezone can move a month.
const monthYear = (d) => {
  const [y, m] = String(d).split('-');
  return m ? `${m}/${y}` : y;
};
const span = (start, end) => [start && monthYear(start), end ? monthYear(end) : 'Present'].filter(Boolean).join(' – ');

const ExperienceList = ({ experiences = [] }) => (
  <>
    <h2 className="cv-section__title">Experience</h2>
    {EXPERIENCE_GROUPS.map(({ type, title }) => {
      const rows = experiences.filter((e) => e.category === type);
      if (!rows.length) return null;
      return (
        <div key={type} className="cv-group">
          <h3 className="cv-group__title">{title}</h3>
          <ul className="cv-list">
            {rows.map((a) => (
              <CvEntry key={a.documentId} when={span(a.startDate, a.endDate)} where={a.location?.description} org={a.organization} role={a.title}>
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
