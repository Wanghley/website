// components/ExperienceList.js
import React from 'react';

const ExperienceList = ({ experiences }) => {
    return (
        <section className="experience">
            <h2>Experience</h2>
            <ul>
                {experiences.map((experience) => {
                    return (
                        <div key={experience.id}>
                            <h3>{experience.attributes.title}</h3>
                            <p>{experience.attributes.company}</p>
                            <p>{experience.attributes.location?.description}</p>
                            <p>{experience.attributes.start} - {experience.attributes.end}</p>
                            <p>{experience.attributes.description}</p>
                        </div>
                    );
                })}
            </ul>
        </section>
    );
};

export default ExperienceList;
