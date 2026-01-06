import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import linkedin from '../assets/linkedin.svg';
import instagram from '../assets/instagram.svg';
import github from '../assets/github.svg';
import twitter from '../assets/twitter.svg';
import './css/Navbar.css';

const Navbar = () => {
  const [clicked, setClicked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll-based navbar styling
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);

      // Update active section based on scroll position (homepage only)
      if (location.pathname === '/') {
        const sections = ['hero', 'about', 'skills', 'projects', 'blog', 'contact'];
        const current = sections.find(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        if (current) setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setClicked(false);
  }, [location.pathname]);

  // Handle navigation clicks
  const handleNavClick = (e, path, sectionId = null) => {
    e.preventDefault();
    setClicked(false);

    if (location.pathname === '/' && sectionId) {
      // On homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 90;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else if (sectionId === 'contact') {
      // Navigate to homepage then scroll to contact
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('contact');
        if (element) {
          const navHeight = 90;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // Regular page navigation
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleMenu = () => setClicked(!clicked);

  const isActive = (path, section = null) => {
    if (location.pathname === '/' && section) {
      return activeSection === section;
    }
    return location.pathname === path;
  };

  const socialLinks = [
    { icon: linkedin, url: 'https://www.linkedin.com/in/wanghley/', label: 'LinkedIn' },
    { icon: instagram, url: 'https://instagram.com/wanghley', label: 'Instagram' },
    { icon: github, url: 'https://github.com/Wanghley', label: 'GitHub' },
    { icon: twitter, url: 'https://twitter.com/wanghley', label: 'Twitter' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${clicked ? 'navbar--open' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <a href="/" className="navbar__logo" onClick={(e) => handleNavClick(e, '/')}>
          <img src={logo} alt="Wanghley" className="navbar__logo-img" />
        </a>

        {/* Desktop Navigation */}
        <ul className="navbar__menu">
          <li className="navbar__item">
            <a 
              href="/about" 
              className={`navbar__link ${isActive('/about') ? 'navbar__link--active' : ''}`}
              onClick={(e) => handleNavClick(e, '/about')}
            >
              About
            </a>
          </li>
          <li className="navbar__item">
            <a 
              href="/curriculum-vitae" 
              className={`navbar__link ${isActive('/curriculum-vitae') ? 'navbar__link--active' : ''}`}
              onClick={(e) => handleNavClick(e, '/curriculum-vitae')}
            >
              CV
            </a>
          </li>
          <li className="navbar__item">
            <a 
              href="/projects" 
              className={`navbar__link ${isActive('/projects') ? 'navbar__link--active' : ''}`}
              onClick={(e) => handleNavClick(e, '/projects')}
            >
              Projects
            </a>
          </li>
          <li className="navbar__item">
            <a 
              href="/blog" 
              className={`navbar__link ${isActive('/blog') ? 'navbar__link--active' : ''}`}
              onClick={(e) => handleNavClick(e, '/blog')}
            >
              Blog
            </a>
          </li>
          <li className="navbar__item">
            <a 
              href="#contact" 
              className={`navbar__link ${isActive('/', 'contact') ? 'navbar__link--active' : ''}`}
              onClick={(e) => handleNavClick(e, '/', 'contact')}
            >
              Contact
            </a>
          </li>
        </ul>

        {/* Desktop Social Links */}
        <div className="navbar__socials">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__social-link"
              aria-label={social.label}
            >
              <img src={social.icon} alt={social.label} />
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar__toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={clicked}
        >
          <span className="navbar__toggle-line"></span>
          <span className="navbar__toggle-line"></span>
          <span className="navbar__toggle-line"></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`navbar__mobile ${clicked ? 'navbar__mobile--open' : ''}`}>
        <div className="navbar__mobile-content">
          <ul className="navbar__mobile-menu">
            <li className="navbar__mobile-item">
              <a 
                href="/about" 
                className={`navbar__mobile-link ${isActive('/about') ? 'navbar__mobile-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, '/about')}
              >
                <span className="navbar__mobile-number">01</span>
                <span className="navbar__mobile-text">About</span>
              </a>
            </li>
            <li className="navbar__mobile-item">
              <a 
                href="/curriculum-vitae" 
                className={`navbar__mobile-link ${isActive('/curriculum-vitae') ? 'navbar__mobile-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, '/curriculum-vitae')}
              >
                <span className="navbar__mobile-number">02</span>
                <span className="navbar__mobile-text">Curriculum Vitae</span>
              </a>
            </li>
            <li className="navbar__mobile-item">
              <a 
                href="/projects" 
                className={`navbar__mobile-link ${isActive('/projects') ? 'navbar__mobile-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, '/projects')}
              >
                <span className="navbar__mobile-number">03</span>
                <span className="navbar__mobile-text">Projects</span>
              </a>
            </li>
            <li className="navbar__mobile-item">
              <a 
                href="/blog" 
                className={`navbar__mobile-link ${isActive('/blog') ? 'navbar__mobile-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, '/blog')}
              >
                <span className="navbar__mobile-number">04</span>
                <span className="navbar__mobile-text">Blog</span>
              </a>
            </li>
            <li className="navbar__mobile-item">
              <a 
                href="#contact" 
                className={`navbar__mobile-link ${isActive('/', 'contact') ? 'navbar__mobile-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, '/', 'contact')}
              >
                <span className="navbar__mobile-number">05</span>
                <span className="navbar__mobile-text">Contact</span>
              </a>
            </li>
          </ul>

          {/* Mobile Social Links */}
          <div className="navbar__mobile-socials">
            <p className="navbar__mobile-socials-label">Connect with me</p>
            <div className="navbar__mobile-socials-grid">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar__mobile-social-link"
                  aria-label={social.label}
                >
                  <img src={social.icon} alt={social.label} />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="navbar__mobile-footer">
            <p>© {new Date().getFullYear()} Wanghley Martins</p>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {clicked && (
        <div 
          className="navbar__backdrop" 
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;