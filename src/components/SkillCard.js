import React from "react";
import "./css/SkillCard.css";

const SkillCard = ({ title, icon }) => {
    // create a simple object in small container with icon and title in the bottom
    return (
        <div className="skill-card">
            <img src={icon} alt={title} className="skill-icon" />
            <h3>{title}</h3>
        </div>
    );
};

export default SkillCard;