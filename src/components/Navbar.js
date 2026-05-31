import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import { FaLinkedinIn, FaInstagram, FaGithub, FaXTwitter } from 'react-icons/fa6';
import './css/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/about', label: 'About', number: '01' },
    { path: '/curriculum-vitae', label: 'CV', mobileLabel: 'Curriculum Vitae', number: '02' },
    { path: '/projects', label: 'Projects', number: '03' },
    { path: '/blog', label: 'Blog', number: '04' },
    { path: '/', label: 'Contact', section: 'ch-07', number: '05' },
  ];

  const socialLinks = [
    { icon: FaLinkedinIn, url: 'https://linkedin.com/in/wanghley', label: 'LinkedIn' },
    { icon: FaInstagram, url: 'https://instagram.com/wanghley', label: 'Instagram' },
    { icon: FaGithub, url: 'https://github.com/Wanghley', label: 'GitHub' },
    { icon: FaXTwitter, url: 'https://twitter.com/wanghley', label: 'X (Twitter)' },
  ];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 50);

    if (location.pathname === '/') {
      const sections = ['ch-00', 'ch-01', 'ch-02', 'ch-03', 'ch-04', 'ch-05', 'ch-06', 'ch-07'];
      const viewportHeight = window.innerHeight;
      let found = '';

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const sectionMiddle = rect.top + rect.height / 2;

          if (sectionMiddle >= 0 && sectionMiddle <= viewportHeight * 0.6) {
            found = sectionId;
            break;
          }
        }
      }
      setActiveSection(found || 'ch-00');
    }
  }, [location.pathname]);

  // Throttled scroll listener
  useEffect(() => {
    let ticking = false;

    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', scrollListener);
  }, [handleScroll]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveSection('');
  }, [location.pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleNavigation = useCallback((e, item) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = navRef.current?.offsetHeight || 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navHeight - 20;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    };

    if (item.section) {
      if (location.pathname === '/') {
        scrollToSection(item.section);
      } else {
        navigate('/');
        setTimeout(() => scrollToSection(item.section), 150);
      }
    } else {
      navigate(item.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigate]);

  const isActive = useCallback((item) => {
    if (item.section) {
      return location.pathname === '/' && activeSection === item.section;
    }
    return location.pathname === item.path;
  }, [location.pathname, activeSection]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    show: { x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit: { x: '100%', transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={prefersReducedMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`nav ${isScrolled ? 'nav--scrolled' : ''} ${isMenuOpen ? 'nav--open' : ''} nav--dark nav--glass`}
        role="navigation"
        aria-label="Main navigation"
        data-theme="dark"
      >
        <div className="nav__container">
          {/* Logo */}
          <a
            href="/"
            className="nav__logo"
            onClick={handleLogoClick}
            aria-label="Wanghley - Home"
          >
            <img src={logo} alt="" className="nav__logo-img" aria-hidden="true" />
          </a>

          {/* Desktop Navigation */}
          <ul className="nav__list" role="menubar">
            {navItems.map((item) => (
              <li key={item.path + (item.section || '')} className="nav__item" role="none">
                <a
                  href={item.section ? `#${item.section}` : item.path}
                  className={`nav__link ${isActive(item) ? 'nav__link--active' : ''}`}
                  onClick={(e) => handleNavigation(e, item)}
                  role="menuitem"
                  aria-current={isActive(item) ? 'page' : undefined}
                >
                  <span className="nav__link-text">{item.label}</span>
                  <span className="nav__link-indicator" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>


          {/* Desktop Social Links */}
          <div className="nav__socials" aria-label="Social media links">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nav__social"
                aria-label={social.label}
              >
                <social.icon aria-hidden="true" />
              </a>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`nav__toggle ${isMenuOpen ? 'nav__toggle--active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="nav__toggle-bar" aria-hidden="true" />
            <span className="nav__toggle-bar" aria-hidden="true" />
            <span className="nav__toggle-bar" aria-hidden="true" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu — AnimatePresence handles mount/unmount */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu mobile-menu--open"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            aria-modal="true"
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="mobile-menu__content">
              {/* Close button */}
              <button
                className="mobile-menu__close"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className="mobile-menu__close-bar" aria-hidden="true" />
                <span className="mobile-menu__close-bar" aria-hidden="true" />
              </button>

              {/* Mobile Navigation */}
              <ul className="mobile-menu__list">
                {navItems.map((item, index) => (
                  <li
                    key={item.path + (item.section || '')}
                    className="mobile-menu__item"
                    style={{ '--item-index': index }}
                  >
                    <a
                      href={item.section ? `#${item.section}` : item.path}
                      className={`mobile-menu__link ${isActive(item) ? 'mobile-menu__link--active' : ''}`}
                      onClick={(e) => handleNavigation(e, item)}
                    >
                      <span className="mobile-menu__number">{item.number}</span>
                      <span className="mobile-menu__label">{item.mobileLabel || item.label}</span>
                      <span className="mobile-menu__arrow" aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Mobile Social Links */}
              <div className="mobile-menu__footer">
                <p className="mobile-menu__social-label">Let's connect</p>
                <div className="mobile-menu__socials">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-menu__social"
                      aria-label={social.label}
                    >
                      <social.icon aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <p className="mobile-menu__copyright">
                  © {new Date().getFullYear()} Wanghley Martins
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop — AnimatePresence handles fade in/out */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
