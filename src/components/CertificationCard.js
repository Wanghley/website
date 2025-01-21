import React from 'react';
import './css/CertificationList.css';

const CertificationCard = ({ certification }) => {
  const { name, organization, date, url, credID } = certification.attributes;
  const isUrlValid = url && url.trim() !== '';
  return (
    <div className="certification-card">
      <div className="certification-info">
        <h3>{name}</h3>
        <span>{organization}</span>
      </div>
      <div className="certification-details">
        <span>Issued {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
        <span>Credential ID: {credID}</span>
      </div>
      <div className="certification-action">
      <a 
          href={isUrlValid ? url : '#'} 
          target={isUrlValid ? '_blank' : undefined} 
          rel={isUrlValid ? 'noopener noreferrer' : undefined} 
          className={`show-credential-btn ${!isUrlValid ? 'disabled' : ''}`}
          aria-disabled={!isUrlValid}
        >
          {isUrlValid ? 'Show Credential' : 'Show Credential'}
        </a>
      </div>
    </div>
  );
};

const CertificationsList = ({ certifications = [] }) => {
  return (
    <div className="certifications-list">
      <ul>
        {certifications.map((certification) => (
          <li key={certification.id}>
            <CertificationCard certification={certification} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationsList;
