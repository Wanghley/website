// components/ExperienceList.js
import React from 'react';

import '../css/ExperienceList.css';
import ReactMarkdown from 'react-markdown';

const ExperienceList = ({ experiences }) => {
    return (
        <section className="experience">
            <h2>Experience</h2>

            {/* Industry Experiences */}
            <div className="experience-category">
                <h3>Industry Experiences</h3>
                <ul>
                    {experiences.filter(exp => exp.attributes.type === 'Industry').map((experience) => (
                        <li key={experience.id}>
                            <div className="experience-details">
                                <div className="company-date-row">
                                    <span className="company">{experience.attributes.company}</span>
                                    <span className="dates">
                                        {experience.attributes.start.split('-')[1]}/{experience.attributes.start.split('-')[0]} -
                                        {experience.attributes.end
                                            ? `${experience.attributes.end.split('-')[1]}/${experience.attributes.end.split('-')[0]}`
                                            : 'Present'}
                                    </span>
                                </div>
                                <div className="location-row">
                                    <h4>{experience.attributes.title}</h4>
                                    <span className="location">{experience.attributes.location?.description}</span>
                                </div>
                            </div>

                            <ReactMarkdown className="description">
                                {experience.attributes.description}
                            </ReactMarkdown>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Research Experiences */}
            <div className="experience-category">
                <h3>Research Experiences</h3>
                <ul>
                    {experiences.filter(exp => exp.attributes.type === 'Research').map((experience) => (
                        <li key={experience.id}>
                            <div className="experience-details">
                                <div className="company-date-row">
                                    <span className="company">{experience.attributes.company}</span>
                                    <span className="dates">
                                        {experience.attributes.start.split('-')[1]}/{experience.attributes.start.split('-')[0]} -
                                        {experience.attributes.end
                                            ? `${experience.attributes.end.split('-')[1]}/${experience.attributes.end.split('-')[0]}`
                                            : 'Present'}
                                    </span>
                                </div>
                                <div className="location-row">
                                    <h4>{experience.attributes.title}</h4>
                                    <span className="location">{experience.attributes.location?.description}</span>
                                </div>
                            </div>
                            <ReactMarkdown className="description">
                                {experience.attributes.description}
                            </ReactMarkdown>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Teaching & Mentorship Experiences */}
            <div className="experience-category">
                <h3>Teaching & Mentorship Experiences</h3>
                <ul>
                    {experiences.filter(exp => exp.attributes.type === 'Teaching & Mentorship').map((experience) => (
                        <li key={experience.id}>
                            <div className="experience-details">
                                <div className="company-date-row">
                                    <span className="company">{experience.attributes.company}</span>
                                    <span className="dates">
                                        {experience.attributes.start.split('-')[1]}/{experience.attributes.start.split('-')[0]} -
                                        {experience.attributes.end
                                            ? `${experience.attributes.end.split('-')[1]}/${experience.attributes.end.split('-')[0]}`
                                            : 'Present'}
                                    </span>
                                </div>
                                <div className="location-row">
                                    <h4>{experience.attributes.title}</h4>
                                    <span className="location">{experience.attributes.location?.description}</span>
                                </div>
                            </div>
                            <ReactMarkdown className="description">
                                {experience.attributes.description}
                            </ReactMarkdown>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Volunteer Experiences */}
            <div className="experience-category">
                <h3>Volunteer Experiences</h3>
                <ul>
                    {experiences.filter(exp => exp.attributes.type === 'Volunteering').map((experience) => (
                        <li key={experience.id}>
                            <div className="experience-details">
                                <div className="company-date-row">
                                    <span className="company">{experience.attributes.company}</span>
                                    <span className="dates">
                                        {experience.attributes.start.split('-')[1]}/{experience.attributes.start.split('-')[0]} -
                                        {experience.attributes.end
                                            ? `${experience.attributes.end.split('-')[1]}/${experience.attributes.end.split('-')[0]}`
                                            : 'Present'}
                                    </span>
                                </div>
                                <div className="location-row">
                                    <h4>{experience.attributes.title}</h4>
                                    <span className="location">{experience.attributes.location?.description}</span>
                                </div>
                            </div>
                            <ReactMarkdown className="description">
                                {experience.attributes.description}
                            </ReactMarkdown>
                        </li>
                    ))}
                </ul>
            </div>
        </section>


    );
};

export default ExperienceList;
