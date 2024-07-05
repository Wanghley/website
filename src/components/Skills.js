import React, { useState, useEffect } from "react";
import SkillsRadarChart from "./SkillsRadarChart";
import "./css/Skills.css";
import { Tabs, Tab, Paper } from '@mui/material';
import { getUniqueElements, fetchFeaturedSkills } from "../api/skills";
import SkillCard from "./SkillCard";

const Skills = () => {

    // use effect to fetch data
    const [featuredSkillsData, setFeaturedSkillsData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFeaturedSkills();
                setFeaturedSkillsData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
                // Handle the error as needed
            }
        };
        fetchData();
    }, []);
    // print log on server side
    console.log(featuredSkillsData);

    // useEffect(() => {
    // const fetchData = async () => {
    //     try {
    //     const data = await getUniqueElements();
    //     setUniqueElements(data);
    //     } catch (error) {
    //     console.error("Error fetching data:", error);
    //     // Handle the error as needed
    //     }   
    // };
    // fetchData();
    // }, []);

    // example data featured skills
    const featuredSkills = [
        { title: "Python", icon: "https://cdn3.iconfinder.com/data/icons/logos-and-brands-adobe/512/267_Python-512.png" },
        { title: "Python", icon: "https://cdn3.iconfinder.com/data/icons/logos-and-brands-adobe/512/267_Python-512.png" },
    ];

    return (
        <div>
            <div className="skills">
                <h1>Featured Skills</h1>
                <div className="skills_container">
                    <div className="skills_category">
                        <h2>Engineering</h2>
                        <div className="skills_card">
                            {featuredSkillsData
                                .filter(skill => skill.type === "Engineering")
                                .map((skill, index) => (
                                    <SkillCard key={index} title={skill.name} icon={skill.icon} />
                                ))}
                        </div>
                    </div>

                    <div className="skills_category">
                        <h2>Dev</h2>
                        <div className="skills_card">
                            {featuredSkillsData
                                .filter(skill => skill.type === "Software")
                                .map((skill, index) => (
                                    <SkillCard key={index} title={skill.name} icon={skill.icon} />
                                ))}
                        </div>
                    </div>

                    <div className="skills_category">
                        <h2>DevOps</h2>
                        <div className="skills_card">
                            {featuredSkillsData
                                .filter(skill => skill.type === "DevOps")
                                .map((skill, index) => (
                                    <SkillCard key={index} title={skill.name} icon={skill.icon} />
                                ))}
                        </div>
                    </div>

                    <div className="skills_category">
                        <h2>Data</h2>
                        <div className="skills_card">
                            {featuredSkillsData
                                .filter(skill => skill.type === "Data")
                                .map((skill, index) => (
                                    <SkillCard key={index} title={skill.name} icon={skill.icon} />
                                ))}
                        </div>
                    </div>

                    <div className="skills_category">
                        <h2>Other</h2>
                        <div className="skills_card">
                            {featuredSkillsData
                                .filter(skill => skill.type !== "Engineering" && skill.type !== "Software" && skill.type !== "DevOps" && skill.type !== "Data")
                                .map((skill, index) => (
                                    <SkillCard key={index} title={skill.name} icon={skill.icon} />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Skills;