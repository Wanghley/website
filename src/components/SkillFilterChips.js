import React from "react";
import "./css/SkillFilterChips.css";

const SkillFilterChips = ({ categories, selected, onSelect }) => {
  return (
    <div className="chip-container">
      {["All", ...categories].map((category, idx) => (
        <button
          key={idx}
          className={`chip ${selected === category ? "active" : ""}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default SkillFilterChips;
