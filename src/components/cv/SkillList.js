import React from 'react';
import '../css/EducationList.css';
import '../css/SkillsList.css';

const expertiseToStars = {
    Basic: 1,
    Intermediate: 2,
    Proficient: 3,
    Advanced: 4,
};

const generateStars = (expertise) => '★'.repeat(expertiseToStars[expertise] || 0);

const SkillsList = ({ skills }) => {
    if (typeof skills !== 'object' || !skills) return <p>No skills available.</p>;

    return (
        <section className="skills-list">
            <h2>Skills</h2>
            {Object.keys(skills).map((category) => (
                <div key={category} className="skills-list__category">
                    <h3>{category}</h3>
                    <ul className="skills-list__skills">
                        {skills[category]
                            .sort((a, b) => expertiseToStars[b.expertise] - expertiseToStars[a.expertise]) // Sorting skills by proficiency (high to low)
                            .map(({ name, expertise }, index) => (
                                <li key={index} className="skills-list__skill-item">
                                    <span>{name}</span>
                                    <span className="skills-list__skill-stars">
                                        {generateStars(expertise)}
                                        <span className="tooltip">{expertise}</span>
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            ))}
        </section>
    );
};

export default SkillsList;
