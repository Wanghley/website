import React from 'react';

const EducationList = ({ educations }) => {
    return (
        <section className="education">
            <h2>Education</h2>
            <ul>
                {educations.map((education) => (
                    <li key={education.attributes.title}>
                        <h3>{education.attributes.title}</h3>
                        <p>{education.attributes.degree}</p>
                        <p>{education.attributes.institution}</p>
                        <p>{education.attributes.location?.description}</p>
                        <p>{education.attributes.start} - {education.attributes.end}</p>
                        <p>{education.attributes.description}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default EducationList;
