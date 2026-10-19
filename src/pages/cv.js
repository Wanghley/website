import React, { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { FaPrint } from "react-icons/fa";
import { usePostHog } from '../lib/analytics';
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
import { PageHeader } from '../components/bench';
import { CV } from '../data/cv';
import { CONTACT } from '../data/home';
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
  const [activeSection, setActiveSection]   = useState(CV.sections[0].id);

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
    CV.sections.forEach(({ id }) => {
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
            <p>The data service did not answer. Check your connection and try again, or email <a className="bp-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> and I will send it.</p>
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
        <meta name="description" content={`Curriculum vitae of Wanghley Martins. ${CV.lede}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wanghley.com/curriculum-vitae" />
        <meta property="og:title" content="Curriculum vitae | Wanghley Martins" />
        <meta property="og:description" content={CV.lede} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wanghley.com/curriculum-vitae" />
        <meta property="og:image" content="https://wanghley.com/og-image.png" />
      </Helmet>

      <section className="bp-sec bp-sec--head cv-head">
        <div className="bench-col">
          <PageHeader refdes="U1" title={personalInfo?.name || 'Curriculum vitae'} lede={CV.lede} meta={keywords}>
            <PersonalInfo personalInfo={personalInfo} />
            <p className="cv-open">{CV.open}</p>
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
              {CV.sections.map(({ id, label }) => (
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
