import React, { useEffect, useState } from "react";
import { fetchPersonalInfo } from '../api/personal-info';
import { fetchAllEducations } from '../api/education';
import { fetchAllExperiences } from '../api/experience';
import { fetchAllPublications } from '../api/publication';
import { fetchAllCertifications } from '../api/certification';
import PersonalInfo from '../components/cv/PersonalInfo';
import EducationList from '../components/cv/EducationList';
import ExperienceList from '../components/cv/ExperienceList';
import PublicationList from '../components/cv/PublicationList';
import CertificationsList from '../components/CertificationCard';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [personal, educationsData, experiencesData, publicationsData, certificationsData] = await Promise.all([
                    fetchPersonalInfo(),
                    fetchAllEducations(),
                    fetchAllExperiences(),
                    fetchAllPublications(),
                    fetchAllCertifications()
                ]);

                setPersonalInfo(personal);
                setEducations(educationsData);
                setExperiences(experiencesData);
                setPublications(publicationsData);
                setCertifications(certificationsData || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading data: {error.message}</p>;

    return (
        <div className="cv-page">
            <h1>Curriculum Vitae</h1>
            <PersonalInfo personalInfo={personalInfo} />
             <EducationList educations={educations} />
            <ExperienceList experiences={experiences} />
            <PublicationList publications={publications} />
            <section className="certifications">
                <h2>Certifications</h2>
                <CertificationsList certifications={certifications} />
            </section>
        </div>
    );
};

export default CVPage;
