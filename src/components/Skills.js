import React, { useState, useEffect, useRef } from "react";
import SkillsRadarChart from "./SkillsRadarChart";
import "./css/Skills.css";
import { Tabs, Tab, Paper } from '@mui/material';
import { getUniqueElements, fetchFeaturedSkills } from "../api/skills";
import SkillCard from "./SkillCard";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { CustomLeftArrow, CustomRightArrow } from './CustomArrows'; // Import custom arrows

const Skills = () => {
    const [featuredSkillsData, setFeaturedSkillsData] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFeaturedSkills();
                setFeaturedSkillsData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const breakpoints = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    const getItemsInView = () => {
        const width = window.innerWidth;
        if (width > 3000) {
            return 5;
        } else if (width >= 1024) {
            return 3;
        } else if (width > 464) {
            return 2;
        } else {
            return 1;
        }
    };

    const renderCategory = (title, filterType) => {
        const items = featuredSkillsData.filter(skill => skill.type === filterType);
        const itemsInView = getItemsInView();

        return (
            <div className="skills_category">
                <h2>{title}</h2>
                <div className="skills_card">
                    <Carousel
                        responsive={breakpoints}
                        infinite={true}
                        autoPlay={items.length > itemsInView}
                        autoPlaySpeed={3000}
                        arrows
                        customLeftArrow={<CustomLeftArrow />}
                        customRightArrow={<CustomRightArrow />}
                        showDots={false}
                        swipeable={true}
                        draggable={true}
                    >
                        {items.map((skill, index) => (
                            <SkillCard key={index} title={skill.name} icon={skill.icon} />
                        ))}
                    </Carousel>
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef}>
            <div className="skills">
                <h1>Featured Skills</h1>
                <div className="skills_container">
                    {renderCategory("Engineering", "Engineering")}
                    {renderCategory("Dev", "Software")}
                    {renderCategory("DevOps", "DevOps")}
                    {renderCategory("Data", "Data")}
                    {renderCategory("Other", "Other")}
                </div>
            </div>
        </div>
    );
};

export default Skills;
