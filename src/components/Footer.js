import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import { FaLinkedinIn, FaInstagram, FaGithub, FaAddressCard } from 'react-icons/fa6';
import { SiGooglescholar } from 'react-icons/si';
import { fetchPersonalInfo, fetchSiteSettings } from '../api/site';
import useCmsData from '../hooks/useCmsData';
import './css/Footer.css';

// Icons for the profile fields the CMS holds (personal information). A profile
// the CMS leaves empty is not shown.
const PROFILE_ICONS = [
  { key: 'linkedin', Icon: FaLinkedinIn, label: 'LinkedIn' },
  { key: 'github', Icon: FaGithub, label: 'GitHub' },
  { key: 'instagram', Icon: FaInstagram, label: 'Instagram' },
  { key: 'googleScholar', Icon: SiGooglescholar, label: 'Google Scholar' },
  { key: 'lattes', Icon: FaAddressCard, label: 'Lattes CV' },
];

const loadFooter = () => Promise.all([fetchPersonalInfo(), fetchSiteSettings()]).then(([person, site]) => ({ person, site }));

const Footer = () => {
  const year = new Date().getFullYear();
  const { status, data } = useCmsData(loadFooter);
  const person = data?.person;
  const site = data?.site;
  const socials = status === 'ready' && person
    ? PROFILE_ICONS.filter(({ key }) => person[key]).map((p) => ({ ...p, href: person[p.key] }))
    : [];

  return (
    <footer className="footer" aria-label="Site footer">

      {/* Top accent rule */}
      <div className="footer__accent" aria-hidden="true" />

      <div className="footer__container">
        <div className="footer__main">

          {/* ── Brand side ── */}
          <div className="footer__brand">
            <img src={logo} alt="Wanghley Martins" className="footer__logo" />

            <p className="footer__roles">
              Engineer
              <span className="footer__roles-dot" aria-hidden="true" />
              Builder
              <span className="footer__roles-dot" aria-hidden="true" />
              Organizer
            </p>

            {socials.length > 0 && (
              <nav className="footer__socials" aria-label="Social profiles">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social"
                    aria-label={label}
                    title={label}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* ── Link columns ── */}
          <div className="footer__cols">

            <nav className="footer__col" aria-label="Site navigation">
              <span className="footer__col-label">Navigate</span>
              <ul className="footer__link-list">
                {[
                  { to: '/about',            label: 'About' },
                  { to: '/curriculum-vitae', label: 'Curriculum Vitae' },
                  { to: '/projects',         label: 'Projects' },
                  { to: '/blog',             label: 'Blog' },
                  { to: '/contact',            label: 'Contact' },
                ].map(({ to, label }) => (
                  <li key={to}><Link to={to} className="footer__link">{label}</Link></li>
                ))}
              </ul>
            </nav>

            {site && (
              <div className="footer__col">
                <span className="footer__col-label">Connect</span>
                <ul className="footer__link-list">
                  {site.contactEmail && (
                    <li><a href={`mailto:${site.contactEmail}`} className="footer__link">{site.contactEmail}</a></li>
                  )}
                  {(site.links || []).map((l) => (
                    <li key={`${l.url}-${l.label}`}>
                      <a
                        href={l.url}
                        {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="footer__link"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <span className="footer__copy">
            © {year} Wanghley Soares Martins. All rights reserved.
          </span>
          <div className="footer__legal">
            <Link to="/privacy" className="footer__legal-link">Privacy Policy</Link>
            <span className="footer__legal-dot" aria-hidden="true" />
            <Link to="/data-policy" className="footer__legal-link">Data &amp; Cookie Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
