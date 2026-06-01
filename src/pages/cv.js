import React, { useEffect, useRef, useState } from "react";
import { usePostHog } from '@posthog/react';
import { fetchPersonalInfo } from '../api/personal-info';
import { fetchAllEducations } from '../api/education';
import { fetchAllExperiences } from '../api/experience';
import { fetchAllPublications } from '../api/publication';
import { fetchAllCertifications } from '../api/certification';
import { getSkillsgrouped } from "../api/skills";
import PersonalInfo from '../components/cv/PersonalInfo';
import EducationList from '../components/cv/EducationList';
import ExperienceList from '../components/cv/ExperienceList';
import PublicationList from '../components/cv/PublicationList';
import CertificationsList from '../components/CertificationCard';
import SkillsList from '../components/cv/SkillList';
import { Helmet } from "react-helmet-async";
import NavbarSpacer from '../components/NavbarSpacer';
import { FaPrint, FaChevronRight } from "react-icons/fa";
import './css/cv.css';

const NAV_SECTIONS = [
  { id: 'cv-profile',        label: 'Profile',        number: '01' },
  { id: 'cv-experience',     label: 'Experience',     number: '02' },
  { id: 'cv-education',      label: 'Education',      number: '03' },
  { id: 'cv-skills',         label: 'Skills',         number: '04' },
  { id: 'cv-publications',   label: 'Publications',   number: '05' },
  { id: 'cv-certifications', label: 'Certifications', number: '06' },
];

const CVPage = () => {
  const posthog = usePostHog();
  const [personalInfo, setPersonalInfo]     = useState(null);
  const [educations, setEducations]         = useState([]);
  const [experiences, setExperiences]       = useState([]);
  const [publications, setPublications]     = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [activeSection, setActiveSection]   = useState('cv-profile');

  // IntersectionObserver to track which section is in view
  const observerRef = useRef(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          personal, educationsData, experiencesData,
          publicationsData, certificationsData, skillsData
        ] = await Promise.all([
          fetchPersonalInfo(),
          fetchAllEducations(),
          fetchAllExperiences(),
          fetchAllPublications(),
          fetchAllCertifications(),
          getSkillsgrouped(),
        ]);

        setPersonalInfo(personal);
        setEducations(educationsData);
        setExperiences(experiencesData);
        setPublications(publicationsData);
        setCertifications(certificationsData || []);
        setSkills(skillsData);

        posthog?.capture('cv_viewed', {
          has_publications:    publicationsData?.length > 0,
          has_certifications:  certificationsData?.length > 0,
          education_count:     educationsData?.length,
          experience_count:    experiencesData?.length,
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [posthog]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const handlePrint = () => {
    posthog?.capture('cv_print_clicked');
    window.print();
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="cv-page-wrapper">
        <NavbarSpacer />
        <div className="cv-layout cv-layout--loading">
          <aside className="cv-nav">
            <div className="cv-nav__inner">
              <div className="cv-nav__label">Contents</div>
              <ul className="cv-nav__list">
                {NAV_SECTIONS.map(({ id, label, number }) => (
                  <li key={id} className="cv-nav__item">
                    <span className="cv-nav__link cv-nav__link--skeleton">
                      <span className="cv-nav__number">{number}</span>
                      <span className="cv-nav__dot" />
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="cv-print-btn" disabled>
                <FaPrint />
                <span>Print / PDF</span>
              </button>
            </div>
          </aside>
          <main className="cv-main">
            <div className="cv-card">
              <div className="cv-skeleton__header">
                <div className="cv-skeleton cv-skeleton--title" />
                <div className="cv-skeleton cv-skeleton--subtitle" />
                <div className="cv-skeleton__contacts">
                  {[1,2,3,4].map(i => <div key={i} className="cv-skeleton cv-skeleton--contact" />)}
                </div>
              </div>
              <div className="cv-skeleton__divider" />
              {[1,2,3].map(section => (
                <div key={section} className="cv-skeleton__section">
                  <div className="cv-skeleton cv-skeleton--section-title" />
                  {[1,2].map(item => (
                    <div key={item} className="cv-skeleton__item">
                      <div className="cv-skeleton cv-skeleton--item-head" />
                      <div className="cv-skeleton cv-skeleton--item-sub" />
                      <div className="cv-skeleton cv-skeleton--item-body" />
                      <div className="cv-skeleton cv-skeleton--item-body cv-skeleton--short" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cv-page-wrapper">
        <NavbarSpacer />
        <div className="cv-error">
          <p>Failed to load CV data. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cv-page-wrapper">
      <NavbarSpacer />

      <Helmet>
        <title>Wanghley Martins — Curriculum Vitae</title>
        <meta name="description" content="Curriculum vitae of Wanghley Martins — Edge AI engineer, biomedical researcher, and Duke Karsh Scholar." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wanghley.com/curriculum-vitae" />
        <meta property="og:title" content="Wanghley Martins — Curriculum Vitae" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wanghley.com/curriculum-vitae" />
        <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746646971/vhwsrugv5l1sxh7fx0zi.jpg" />
      </Helmet>

      <div className="cv-layout">

        {/* ── Left sticky navigation ── */}
        <aside className="cv-nav no-print" aria-label="CV section navigation">
          <div className="cv-nav__inner">
            <div className="cv-nav__label">Contents</div>
            <ul className="cv-nav__list">
              {NAV_SECTIONS.map(({ id, label, number }) => (
                <li key={id} className="cv-nav__item">
                  <a
                    href={`#${id}`}
                    className={`cv-nav__link ${activeSection === id ? 'cv-nav__link--active' : ''}`}
                    onClick={(e) => handleNavClick(e, id)}
                  >
                    <span className="cv-nav__number">{number}</span>
                    <span className="cv-nav__dot" aria-hidden="true" />
                    <span className="cv-nav__text">{label}</span>
                    <FaChevronRight className="cv-nav__arrow" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="cv-nav__divider" />

            <button className="cv-print-btn" onClick={handlePrint} aria-label="Print or save CV as PDF">
              <FaPrint aria-hidden="true" />
              <span>Print / PDF</span>
            </button>
            <p className="cv-print-hint">Select "Save as PDF"</p>
          </div>
        </aside>

        {/* ── Main CV content ── */}
        <main className="cv-main">
          <div className="cv-card">

            {/* Profile / Personal Info */}
            <section id="cv-profile" className="cv-section">
              <PersonalInfo personalInfo={personalInfo} />
            </section>

            <div className="cv-divider" />

            {/* Experience */}
            <section id="cv-experience" className="cv-section">
              <ExperienceList experiences={experiences} />
            </section>

            <div className="cv-divider" />

            {/* Education */}
            <section id="cv-education" className="cv-section">
              <EducationList educations={educations} />
            </section>

            <div className="cv-divider" />

            {/* Skills */}
            <section id="cv-skills" className="cv-section">
              <SkillsList skills={skills} />
            </section>

            <div className="cv-divider" />

            {/* Publications */}
            <section id="cv-publications" className="cv-section">
              <PublicationList publications={publications} />
            </section>

            <div className="cv-divider" />

            {/* Certifications */}
            <section id="cv-certifications" className="cv-section">
              <div className="cv-section__head">
                <h2 className="cv-section__title">Certifications</h2>
              </div>
              <div className="cv-certifications-grid">
                <CertificationsList certifications={certifications} />
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CVPage;
