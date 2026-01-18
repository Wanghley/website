import React, { useEffect, useState } from "react";
import { fetchPersonalInfo } from '../api/personal-info';
import { fetchAllEducations } from '../api/education';
import { fetchAllExperiences } from '../api/experience';
import { fetchAllPublications } from '../api/publication';
import { fetchAllCertifications } from '../api/certification';
import { getSkills, getSkillsgrouped } from "../api/skills";
import PersonalInfo from '../components/cv/PersonalInfo';
import EducationList from '../components/cv/EducationList';
import ExperienceList from '../components/cv/ExperienceList';
import PublicationList from '../components/cv/PublicationList';
import CertificationsList from '../components/CertificationCard';
import SkillsList from '../components/cv/SkillList';
import { Helmet } from "react-helmet-async"; // Changed from react-helmet
import NavbarSpacer from '../components/NavbarSpacer';
import { FaPrint, FaFileDownload } from "react-icons/fa"; // Add imports

import '../components/css/global.css';
import './css/cv.css';

const CVPage = () => {
    const [personalInfo, setPersonalInfo] = useState(null);
    const [educations, setEducations] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [publications, setPublications] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [personal, educationsData, experiencesData, publicationsData, certificationsData, skillsData] = await Promise.all([
                    fetchPersonalInfo(),
                    fetchAllEducations(),
                    fetchAllExperiences(),
                    fetchAllPublications(),
                    fetchAllCertifications(),
                    getSkillsgrouped()
                ]);

                setPersonalInfo(personal);
                setEducations(educationsData);
                setExperiences(experiencesData);
                setPublications(publicationsData);
                setCertifications(certificationsData || []);
                setSkills(skillsData);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <>
                <NavbarSpacer />
                <div className="cv-page">
                    {/* Personal Info Skeleton */}
                    <div className="skeleton-personal-header">
                        <div className="skeleton skeleton-avatar-text"></div>
                        <div className="skeleton skeleton-avatar-sub"></div>
                        <div className="skeleton skeleton-text" style={{ width: '80%', marginTop: '10px' }}></div>
                    </div>

                    <hr style={{ margin: '30px 0', opacity: 0.1 }} />

                    {/* Simulating Sections (Education, Experience, etc.) */}
                    {[1, 2, 3, 4].map((sectionIndex) => (
                        <section key={sectionIndex} style={{ marginBottom: '40px' }}>
                            <div className="skeleton skeleton-title"></div>
                            {[1, 2].map((itemIndex) => (
                                <div key={itemIndex} className="skeleton-block">
                                    <div className="skeleton skeleton-header"></div>
                                    <div className="skeleton skeleton-meta"></div>
                                    <div className="skeleton skeleton-text"></div>
                                    <div className="skeleton skeleton-text"></div>
                                    <div className="skeleton skeleton-text"></div>
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
            </>
        );
    }
    
    if (error) return <p>Error loading data: {error.message}</p>;

    return (
        <>
        <NavbarSpacer/>
        <div className="cv-page">
            <Helmet>
                <title>Wanghley's Curriculum Vitae</title>
                <meta name="description" content="Explore Wanghley's professional CV, including education, experience, skills, publications, and certifications." />
                <meta name="keywords" content="Curriculum Vitae, CV, Wanghley, Education, Experience, Skills, Publications, Certifications" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://wanghley.com/cv" />
                <meta name="author" content="Wanghley" />

                {/* Open Graph*/}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/cv" />
                <meta property="og:title" content="Wanghley's Curriculum Vitae" />
                <meta property="og:description" content="Explore Wanghley's professional CV, including education, experience, skills, publications, and certifications." />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746646971/vhwsrugv5l1sxh7fx0zi.jpg" />
                <meta property="og:image:alt" content="Wanghley's CV" />
            </Helmet>

            {/* CV Actions Bar - FIXED POSITION */}
            <div className="cv-actions no-print">
                <button className="cv-btn primary" onClick={() => window.print()}>
                    <FaPrint /> Print / Save PDF
                </button>
                <div className="cv-note">
                    Click Print, then "Save as PDF"
                </div>
            </div>

            <PersonalInfo personalInfo={personalInfo} />
            <EducationList educations={educations} />
            <ExperienceList experiences={experiences} />
            <SkillsList skills={skills} />
            <PublicationList publications={publications} />
            <section className="certifications">
                <h2>Certifications</h2>
                <CertificationsList certifications={certifications} />
            </section>
        </div>
    </>
    );
};

export default CVPage;
