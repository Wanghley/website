import React from 'react';

import '../css/EducationList.css';

const EducationList = ({ educations }) => {
    return (
        <section className="education">
            <h2>Education</h2>
            <ul>
                {educations.map((education) => (
                    <li key={education.attributes.title} className="education-item">
                        <div className="education-header">
                            <h3>{education.attributes.title}</h3>
                            <span className="dates">
                                {/* format as JAN, 2024, original is 2024-01-01 */}
                                {new Date(education.attributes.start).toLocaleString('default', { month: 'short' })}, {new Date(education.attributes.start).getFullYear()} - {new Date(education.attributes.end).toLocaleString('default', { month: 'short' })}, {new Date(education.attributes.end).getFullYear()}
                            </span>
                        </div>
                        <div className="education-details">
                            <div className="education-details-left">
                                <p className="institution">{education.attributes.institution}</p>
                                <p className="degree">{education.attributes.degree}</p>
                            </div>
                        <p className="location">{education.attributes.location?.description}</p>
                        </div>
                        <p className="description">{education.attributes.description}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default EducationList;
