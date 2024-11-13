import React from 'react';
import './css/CertificationList.css';

const CertificationCard = ({ certification }) => {
  const { name, organization, date, url, credID, logo } = certification.attributes;

  // Safely access the logo URL with optional chaining
  const logoUrl = logo?.data?.attributes?.formats?.thumbnail?.url;

  return (
    <div className="certification-card">
      <div className="certification-header">
        <a href={url} target="_blank" rel="noopener noreferrer" className="certification-logo">
          {logoUrl && <img src={logoUrl} alt={`${organization} logo`} />}
        </a>
        <div className="certification-info">
          <h3>{name}</h3>
          <span>{organization}</span>
          <span>Issued {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          <span>Credential ID: {credID}</span>
        </div>
      </div>
      <div className="certification-action">
        <a href={url} target="_blank" rel="noopener noreferrer" className="show-credential-btn">
          Show Credential
        </a>
      </div>
    </div>
  );
};

const CertificationsList = ({ certifications = [] }) => {
  return (
    <div className="certifications-list">
      {certifications.map((certification) => (
        <CertificationCard key={certification.id} certification={certification} />
      ))}
    </div>
  );
};

export default CertificationsList;
