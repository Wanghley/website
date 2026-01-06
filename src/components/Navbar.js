import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import logoDark from '../assets/logo-colorful.png';
import { FaLinkedinIn, FaInstagram, FaGithub, FaXTwitter } from 'react-icons/fa6';
import './css/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Define which pages have dark headers (navbar should be light text)
  // and which have light backgrounds (navbar should be dark text)
  const pageThemes = {
    '/': 'dark',           // Homepage has dark hero
    '/about': 'light',     // About page has light background
    '/curriculum-vitae': 'light',  // CV has light background
    '/projects': 'dark',   // Projects has dark featured header
    '/blog': 'dark',       // Blog has dark featured header
    '/contact': 'light',   // Contact has light background
  };

  // Navigation items configuration
  const navItems = [
    { path: '/about', label: 'About', number: '01' },
    { path: '/curriculum-vitae', label: 'CV', mobileLabel: 'Curriculum Vitae', number: '02' },
    { path: '/projects', label: 'Projects', number: '03' },
    { path: '/blog', label: 'Blog', number: '04' },
    { path: '/', label: 'Contact', section: 'contact', number: '05' },
  ];

  const socialLinks = [
    { icon: FaLinkedinIn, url: 'https://linkedin.com/in/wanghley', label: 'LinkedIn' },
    { icon: FaInstagram, url: 'https://instagram.com/wanghley', label: 'Instagram' },
    { icon: FaGithub, url: 'https://github.com/Wanghley', label: 'GitHub' },
    { icon: FaXTwitter, url: 'https://twitter.com/wanghley', label: 'X (Twitter)' },
  ];

  // Determine theme based on current path
  useEffect(() => {
    const path = location.pathname;
    
    // Check for exact match first
    if (pageThemes[path]) {
      setTheme(pageThemes[path]);
    } 
    // Check for dynamic routes (blog posts, project posts)
    else if (path.startsWith('/blog/')) {
      setTheme('dark'); // Blog posts have dark headers
    } else if (path.startsWith('/projects/')) {
      setTheme('dark'); // Project posts have dark headers
    } else {
      setTheme('light'); // Default to light for unknown pages
    }
  }, [location.pathname]);

  // Switch to dark navbar style when scrolled (always readable)
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 50);

    // Section detection only on homepage
    if (location.pathname === '/') {
      const sections = ['hero', 'about', 'skills', 'projects', 'blog', 'contact'];
      const viewportHeight = window.innerHeight;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const sectionMiddle = rect.top + rect.height / 2;
          
          if (sectionMiddle >= 0 && sectionMiddle <= viewportHeight * 0.6) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
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
    handleScroll(); // Initial check
    
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
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Smart navigation handler
  const handleNavigation = useCallback((e, item) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = navRef.current?.offsetHeight || 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    if (item.section) {
      // Section navigation
      if (location.pathname === '/') {
        scrollToSection(item.section);
      } else {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => scrollToSection(item.section), 150);
      }
    } else {
      // Page navigation
      navigate(item.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigate]);

  // Check if nav item is active
  const isActive = useCallback((item) => {
    if (item.section) {
      return location.pathname === '/' && activeSection === item.section;
    }
    return location.pathname === item.path;
  }, [location.pathname, activeSection]);

  // Logo click handler
  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // Determine which logo to use
  const currentLogo = (theme === 'light' && !isScrolled) ? logoDark : logo;

  return (
    <>
      <nav 
        ref={navRef}
        className={`nav ${isScrolled ? 'nav--scrolled' : ''} ${isMenuOpen ? 'nav--open' : ''} nav--${theme}`}
        role="navigation"
        aria-label="Main navigation"
        data-theme={theme}
      >
        <div className="nav__container">
          {/* Logo */}
          <a 
            href="/" 
            className="nav__logo" 
            onClick={handleLogoClick}
            aria-label="Wanghley - Home"
          >
            <img src={currentLogo} alt="" className="nav__logo-img" aria-hidden="true" />
            <span className="nav__logo-text">Wanghley</span>
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
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-menu__content">
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
                  tabIndex={isMenuOpen ? 0 : -1}
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
                  tabIndex={isMenuOpen ? 0 : -1}
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
      </div>

      {/* Backdrop */}
      <div
        className={`nav-backdrop ${isMenuOpen ? 'nav-backdrop--visible' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
    </>
  );
};

export default Navbar;