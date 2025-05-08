import React, { useState, useEffect } from "react";
import SkillFilterChips from "./SkillFilterChips";
import SkillsRadarChart from "./SkillsRadarChart";
import { fetchFeaturedSkills } from "../api/skills";
import "./css/Skills.css";

const Skills = () => {
    const [featuredSkills, setFeaturedSkills] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFeaturedSkills();
                setFeaturedSkills(data);
            } catch (error) {
                console.error("Error fetching skills:", error);
            }
        };
        fetchData();
    }, []);

    const categories = [...new Set(featuredSkills.map(skill => skill.type))];
    const isMobile = window.innerWidth <= 600;

    const displayedSkills = selectedCategory === "All"
        ? featuredSkills.slice(0, isMobile ? 5 : 20)
        : featuredSkills.filter(skill => skill.type === selectedCategory).slice(0, isMobile ? 5 : 20);


    console.log("Selected Category:", selectedCategory);
    console.log("Displayed Skills:", displayedSkills);

    return (
        <div className="skills">
            <h1>Featured Skills</h1>


            <div className="skills-layout">
                <div className="skills-list">
                    <SkillFilterChips
                        categories={categories}
                        selected={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                    <div className="skills-grid">
                        {displayedSkills.map((skill, i) => (
                            <div className="skill-card" key={i}>
                                <img src={skill.icon} alt={skill.name} />
                                <span>{skill.name}</span>
                                <div className="skill-meta">
                                    <small className={`level ${skill.level.toLowerCase()}`}>{skill.level}</small>
                                    <div className="skill-bar">
                                        <div className="skill-bar-fill" style={{ width: `${skill.score}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* <div className="skills-radar-wrapper">
                    <SkillsRadarChart skills={featuredSkills} />
                </div> */}
            </div>

            <button
                className="secondary-button about-button"
                onClick={() => window.location.href = '/curriculum-vitae'}
            >
                See more
            </button>
        </div>

    );
};

export default Skills;