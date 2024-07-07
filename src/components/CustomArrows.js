import React from "react";
import "./css/CustomArrows.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const CustomLeftArrow = ({ onClick }) => {
    return (
        <button className="custom-arrow custom-arrow-left" onClick={onClick}>
            <i className="arrow-icon"><FaAngleLeft /></i>
        </button>
    );
};

const CustomRightArrow = ({ onClick }) => {
    return (
        <button className="custom-arrow custom-arrow-right" onClick={onClick}>
            <i className="arrow-icon"><FaAngleRight/></i>
        </button>
    );
};

export { CustomLeftArrow, CustomRightArrow };
