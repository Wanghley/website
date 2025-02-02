import React, { useState, useEffect, useRef } from "react";
import SkillsRadarChart from "./SkillsRadarChart";
import "./css/Skills.css";
import { getUniqueElements, fetchFeaturedSkills } from "../api/skills";
import SkillCard from "./SkillCard";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { CustomLeftArrow, CustomRightArrow } from "./CustomArrows";

const breakpoints = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 6 }, // Show more items
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },  // Show more items
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 }
};

const Skills = () => {
    const [featuredSkills, setFeaturedSkills] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFeaturedSkills();
                setFeaturedSkills(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const getFilteredSkills = (type) => featuredSkills.filter(skill => skill.type === type);

    const renderCategory = (title, filterType) => {
        const skills = getFilteredSkills(filterType);
        const shouldAutoPlay = skills.length > breakpoints.desktop.items;

        return skills.length ? (
            <div className="skills_category">
                <h2>{title}</h2>
                <div className="skills_card">
                    <Carousel
                        responsive={breakpoints}
                        infinite
                        autoPlay={shouldAutoPlay}
                        autoPlaySpeed={3000}
                        arrows
                        customLeftArrow={<CustomLeftArrow />}
                        customRightArrow={<CustomRightArrow />}
                        swipeable
                        draggable
                    >
                        {skills.map((skill, index) => (
                            <SkillCard key={index} title={skill.name} icon={skill.icon} />
                        ))}
                    </Carousel>
                </div>
            </div>
        ) : null;
    };

    return (
        <div ref={containerRef} className="skills">
            <h1>Featured Skills</h1>
            <div className="skills_container">
                {renderCategory("Engineering", "Engineering")}
                {renderCategory("Software Development", "Software")}
                {renderCategory("DevOps", "DevOps")}
                {renderCategory("Data Science", "Data")}
                {renderCategory("Other", "Other")}
            </div>

            {/* Button to see more on CV */}
            {/* <div className="cv-button-container">
                <a href="/path-to-cv" className="cv-button">See More on My CV</a>
            </div> */}
            <button className='secondary-button about-button' onClick={() => window.location.href = '/curriculum-vitae'}>See more</button>
        </div>

    );
};

export default Skills;
