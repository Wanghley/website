import React from 'react';
import '../css/PersonalInfo.css';
import { FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt } from 'react-icons/fa';
import { FaGoogleScholar, FaResearchgate } from "react-icons/fa6";

const PersonalInfo = ({ personalInfo }) => {
    const linkedinParts = personalInfo?.linkedin.split('/');
    const joinedLinkedin = linkedinParts[3] && linkedinParts[4] ? `${linkedinParts[3]}/${linkedinParts[4]}` : '';

    return (
        <section className="personal-info">
            {/* Name */}
            <h2>{personalInfo?.name}</h2>

            {/* Headline */}
            <h3>{personalInfo?.headline}</h3>

            {/* Contact Information */}
            <div className="contact-info">
                {/* Address (Leftmost) */}
                {personalInfo?.address?.description && (
                    <p className="contact-item">
                        <FaMapMarkerAlt /> {/* Address Icon */}
                        {personalInfo?.address?.description}
                    </p>
                )}
                {/* Email */}
                <a href={`mailto:${personalInfo?.email}`}>
                    <p className="contact-item">
                        <FaEnvelope /> {/* Email Icon */}
                        {personalInfo?.email}
                    </p>
                </a>
                {/* LinkedIn */}
                {personalInfo?.linkedin && (
                    <a href={personalInfo?.linkedin} target="_blank" rel="noopener noreferrer">
                        <p className="contact-item">
                            <FaLinkedin /> {/* LinkedIn Icon */}
                            {joinedLinkedin}
                        </p>
                    </a>
                )}
                {/* GitHub */}
                {personalInfo?.github && (
                    <a href={personalInfo?.github} target="_blank" rel="noopener noreferrer">
                        <p className="contact-item">
                            <FaGithub /> {/* GitHub Icon */}
                            {personalInfo?.github.split('/').pop().toLowerCase()}
                        </p>
                    </a>
                )}
                {/* Google Scholar */}
                {personalInfo?.googlescholar && (
                    <a href={personalInfo?.googlescholar} target="_blank" rel="noopener noreferrer">
                        <p className="contact-item">
                            <FaGoogleScholar /> {/* Google Scholar Icon */}
                            Google Scholar
                        </p>
                    </a>
                )}
                {/* ResearchGate (Rightmost) */}
                {personalInfo?.researchgate && (
                    <a href={personalInfo?.researchgate} target="_blank" rel="noopener noreferrer">
                        <p className="contact-item">
                            <FaResearchgate /> {/* ResearchGate Icon */}
                            Research Gate
                        </p>
                    </a>
                )}
            </div>
            <hr />
        </section>
    );
};

export default PersonalInfo;