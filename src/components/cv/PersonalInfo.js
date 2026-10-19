import React from 'react';
import { FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt } from 'react-icons/fa';
import { FaGoogleScholar, FaResearchgate } from 'react-icons/fa6';

// "https://linkedin.com/in/wanghley" -> "in/wanghley"
const linkedinHandle = (url) => {
  const p = url.split('/');
  return p[3] && p[4] ? `${p[3]}/${p[4]}` : url.replace(/^https?:\/\//, '');
};

// Contact line under the CV title. Every field is optional in the CMS.
const PersonalInfo = ({ personalInfo }) => {
  const info = personalInfo || {};
  const items = [
    info.address?.description && { key: 'address', Icon: FaMapMarkerAlt, text: info.address.description },
    info.email && { key: 'email', Icon: FaEnvelope, text: info.email, href: `mailto:${info.email}` },
    info.linkedin && { key: 'linkedin', Icon: FaLinkedin, text: linkedinHandle(info.linkedin), href: info.linkedin, external: true },
    info.github && { key: 'github', Icon: FaGithub, text: info.github.split('/').pop().toLowerCase(), href: info.github, external: true },
    info.googlescholar && { key: 'scholar', Icon: FaGoogleScholar, text: 'Google Scholar', href: info.googlescholar, external: true },
    info.researchgate && { key: 'rg', Icon: FaResearchgate, text: 'ResearchGate', href: info.researchgate, external: true },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <ul className="cv-contact" aria-label="Contact">
      {items.map(({ key, Icon, text, href, external }) => (
        <li key={key}>
          {href ? (
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <Icon aria-hidden="true" />
              {text}
            </a>
          ) : (
            <span>
              <Icon aria-hidden="true" />
              {text}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default PersonalInfo;
