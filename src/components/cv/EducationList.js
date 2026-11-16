import React from 'react';
import CvEntry, { CvText } from './Entry';
import { formatMonth } from '../../utils/formatDate';

// An open-ended program (no end date in the CMS) reads "Present", not 1970.
const span = (start, end) => [start && formatMonth(start), end ? formatMonth(end) : 'Present'].filter(Boolean).join(' – ');

const EducationList = ({ educations = [] }) => (
  <>
    <h2 className="cv-section__title">Education</h2>
    <ul className="cv-list">
      {educations.map((a) => (
        <CvEntry key={a.documentId} as="h3" when={span(a.startDate, a.endDate)} where={a.location?.description} org={a.title} role={[a.institution, a.degree].filter(Boolean).join(' · ')}>
          <CvText>{a.description}</CvText>
        </CvEntry>
      ))}
    </ul>
  </>
);

export default EducationList;
