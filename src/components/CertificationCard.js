import React from 'react';
import CvEntry from './cv/Entry';
import { formatMonth } from '../utils/formatDate';

// Certifications as CV lines. A credential with no URL simply has no link:
// a disabled "Show credential" button promises something that is not there.
const CertificationsList = ({ certifications = [] }) => (
  <>
    <h2 className="cv-section__title">Certifications</h2>
    {certifications.length === 0 ? (
      <p className="cv-empty">No certifications listed yet.</p>
    ) : (
      <ul className="cv-list">
        {certifications.map(({ id, attributes: { name, organization, date, url, credID } }) => (
          <CvEntry key={id} as="h3" when={date ? `Issued ${formatMonth(date)}` : undefined} org={name} role={organization}>
            {credID && <p className="cv-entry__id">Credential ID {credID}</p>}
            {url && url.trim() && (
              <p className="cv-entry__link">
                <a className="bp-link" href={url} target="_blank" rel="noopener noreferrer">Show credential <span aria-hidden="true">↗</span></a>
              </p>
            )}
          </CvEntry>
        ))}
      </ul>
    )}
  </>
);

export default CertificationsList;
