import React, { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { FaPrint } from "react-icons/fa";
import { usePostHog } from '../lib/analytics';
import {
  fetchCvPage, fetchPersonalInfo, fetchEducations, fetchExperiences,
  fetchPublications, fetchCertifications, fetchAllSkills,
} from '../api/site';
import useContact from '../hooks/useContact';
import PersonalInfo from '../components/cv/PersonalInfo';
import EducationList from '../components/cv/EducationList';
import ExperienceList from '../components/cv/ExperienceList';
import PublicationList from '../components/cv/PublicationList';
import CertificationsList from '../components/CertificationCard';
import SkillsList from '../components/cv/SkillList';
import { PageHeader } from '../components/bench';
import { CV_SECTIONS } from '../data/layout';
import './css/cv.css';

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
  const [activeSection, setActiveSection]   = useState(CV_SECTIONS[0].id);
  const [cvPage, setCvPage]                 = useState(null);
  const { data: contact } = useContact();

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
    CV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          page, personal, educationsData, experiencesData,
          publicationsData, certificationsData, skillRows,
        ] = await Promise.all([
          fetchCvPage(),
          fetchPersonalInfo(),
          fetchEducations(),
          fetchExperiences(),
          fetchPublications(),
          fetchCertifications(),
          fetchAllSkills(),
        ]);

        // The skills section groups the CMS rows by category.
        const skillsData = skillRows.reduce((acc, s) => {
          const category = s.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push({ name: s.name, expertise: s.level });
          return acc;
        }, {});

        setCvPage(page);
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
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const handlePrint = () => {
    posthog?.capture('cv_print_clicked');
    window.print();
  };

  /* ── Loading: the same two bands, with plain blocks where the text will be ── */
  if (loading) {
    return (
      <main id="main" className="cv-page" aria-busy="true">
        <section className="bp-sec bp-sec--head">
          <div className="bench-col">
            <div className="bp-rule" aria-hidden="true" />
            <div className="cv-skeleton cv-skeleton--title" />
            <div className="cv-skeleton cv-skeleton--lede" />
            <div className="cv-skeleton cv-skeleton--meta" />
          </div>
        </section>
        <section className="bp-sec bp-sec--light">
          <div className="bench-col">
            {[1, 2, 3].map((n) => (
              <div key={n} className="cv-skeleton cv-skeleton--entry" />
            ))}
          </div>
        </section>
        <p className="sr-only" role="status">Loading the curriculum vitae.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main id="main" className="cv-page">
        <section className="bp-sec bp-sec--head">
          <div className="bench-col">
            <PageHeader refdes="U1" title="Curriculum vitae" lede="The CV did not load." />
          </div>
        </section>
        <section className="bp-sec bp-sec--light">
          <div className="bench-col cv-error">
            <p>The data service did not answer. Check your connection and try again{contact?.email && <>, or email <a className="bp-link" href={`mailto:${contact.email}`}>{contact.email}</a> and I will send it</>}.</p>
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
          </div>
        </section>
      </main>
    );
  }

  // The CMS headline is a pipe-separated list of keywords; show it as facts.
  const keywords = [...new Set((personalInfo?.headline || '').split('|').map((s) => s.trim()).filter(Boolean))];

  return (
    <main id="main" className="cv-page">
      <Helmet>
        <title>Curriculum vitae | Wanghley Martins</title>
        <meta name="description" content={`Curriculum vitae of Wanghley Martins. ${cvPage?.lede || ''}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wanghley.com/curriculum-vitae" />
        <meta property="og:title" content="Curriculum vitae | Wanghley Martins" />
        <meta property="og:description" content={cvPage?.lede || ''} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wanghley.com/curriculum-vitae" />
        <meta property="og:image" content="https://wanghley.com/og-image.png" />
      </Helmet>

      <section className="bp-sec bp-sec--head cv-head">
        <div className="bench-col">
          <PageHeader refdes="U1" title={personalInfo?.name || 'Curriculum vitae'} lede={cvPage?.lede} meta={keywords}>
            <PersonalInfo personalInfo={personalInfo} />
            {cvPage?.openTo && <p className="cv-open">{cvPage.openTo}</p>}
            <div className="cv-actions no-print">
              <Link className="btn btn--primary" to="/contact">Get in touch</Link>
              <button type="button" className="btn btn--ghost" onClick={handlePrint}>
                <FaPrint aria-hidden="true" /> Print or save as PDF
              </button>
            </div>
          </PageHeader>
        </div>
      </section>

      <section className="bp-sec bp-sec--light cv-body">
        <div className="bench-col cv-layout">
          <nav className="cv-rail no-print" aria-label="CV sections">
            <p className="cv-rail__label">On this page</p>
            <ul>
              {CV_SECTIONS.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={activeSection === id ? 'true' : undefined} onClick={(e) => handleNavClick(e, id)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="cv-content">
            <section id="cv-experience" className="cv-section">
              <ExperienceList experiences={experiences} />
            </section>
            <section id="cv-education" className="cv-section">
              <EducationList educations={educations} />
            </section>
            <section id="cv-skills" className="cv-section">
              <SkillsList skills={skills} />
            </section>
            <section id="cv-publications" className="cv-section">
              <PublicationList publications={publications} />
            </section>
            <section id="cv-certifications" className="cv-section">
              <CertificationsList certifications={certifications} />
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CVPage;
