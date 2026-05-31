import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo-colorful.png';
import { FaLinkedinIn, FaInstagram, FaGithub, FaGraduationCap } from 'react-icons/fa6';
import { SiGooglescholar } from 'react-icons/si';
import './css/Footer.css';

const SOCIAL_LINKS = [
  { Icon: FaLinkedinIn,    href: 'https://linkedin.com/in/wanghley',                        label: 'LinkedIn' },
  { Icon: FaGithub,        href: 'https://github.com/wanghley',                             label: 'GitHub' },
  { Icon: FaInstagram,     href: 'https://instagram.com/wanghley',                          label: 'Instagram' },
  { Icon: SiGooglescholar, href: 'https://scholar.google.com/citations?user=bMgQgr8AAAAJ', label: 'Google Scholar' },
  { Icon: FaGraduationCap, href: 'http://lattes.cnpq.br/2402272123510102',                  label: 'Lattes CV' },
];

const Footer = () => {
  const year = new Date().getFullYear();

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
              Electrical &amp; Computer Engineer
              <span className="footer__roles-dot" aria-hidden="true" />
              Maker
              <span className="footer__roles-dot" aria-hidden="true" />
              Researcher
              <span className="footer__roles-dot" aria-hidden="true" />
              Entrepreneur
            </p>

            <nav className="footer__socials" aria-label="Social profiles">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
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
                  { to: '/#ch-07',           label: 'Contact' },
                ].map(({ to, label }) => (
                  <li key={to}><Link to={to} className="footer__link">{label}</Link></li>
                ))}
              </ul>
            </nav>

            <div className="footer__col">
              <span className="footer__col-label">Connect</span>
              <ul className="footer__link-list">
                <li><a href="mailto:me@wanghley.com" className="footer__link">me@wanghley.com</a></li>
                <li><a href="https://cal.com/wanghley" target="_blank" rel="noopener noreferrer" className="footer__link">Schedule a Call</a></li>
                <li><a href="https://wanghley.substack.com" target="_blank" rel="noopener noreferrer" className="footer__link">Newsletter</a></li>
              </ul>
            </div>

            <div className="footer__col">
              <span className="footer__col-label">Research</span>
              <ul className="footer__link-list">
                <li><a href="https://scholar.google.com/citations?user=bMgQgr8AAAAJ" target="_blank" rel="noopener noreferrer" className="footer__link">Google Scholar</a></li>
                <li><a href="http://lattes.cnpq.br/2402272123510102" target="_blank" rel="noopener noreferrer" className="footer__link">Lattes CV</a></li>
              </ul>
            </div>

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
