import React from 'react';

const PersonalInfo = ({ personalInfo }) => {
    return (
        <section className="personal-info">
            <h2>{personalInfo?.name}</h2>
            <h3>{personalInfo?.headline}</h3>
            <p>{personalInfo?.email}</p>
            <p>{personalInfo?.address?.description}</p>
            <p>{personalInfo?.summary}</p>
        </section>
    );
};

export default PersonalInfo;