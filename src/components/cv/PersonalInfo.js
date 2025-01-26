import React from 'react';
import '../css/PersonalInfo.css';
import { FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt } from 'react-icons/fa';

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
                <a href={`mailto:${personalInfo?.email}`}>
                    <p className="contact-item">
                        <FaEnvelope /> {/* Email Icon */}
                        {personalInfo?.email}
                    </p>
                </a>
                {personalInfo?.github && (
                    <a href={personalInfo?.github} target="_blank" rel="noopener noreferrer">
                        <p className="contact-item">
                            <FaGithub /> {/* GitHub Icon */}
                            {personalInfo?.github.split('/').pop().toLowerCase()}
                        </p>
                    </a>
                )}
                {personalInfo?.linkedin && (
                    <a href={personalInfo?.linkedin} target="_blank" rel="noopener noreferrer">
                        <p className="contact-item">
                            <FaLinkedin /> {/* LinkedIn Icon */}
                            {joinedLinkedin}
                        </p>
                    </a>
                )}
                {personalInfo?.address?.description && (
                    <p className="contact-item">
                        <FaMapMarkerAlt /> {/* Address Icon */}
                        {personalInfo?.address?.description}
                    </p>
                )}
            </div>
            
            {/* Horizontal line */}
            <hr />
        </section>
    );
};

export default PersonalInfo;