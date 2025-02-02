import React from 'react'
import { useRef, useState } from 'react'
import './css/Hero.css'

const Hero = () => {
    function onClickHeaderItem(sectionId) {
        // make smooth scroll to the section
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
    }

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Toggle dropdown visibility
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    // Go to full CV page
    const onClickGoToCV = () => {
        window.location.href = '/Curriculum-vitae';
    };

    // Go to full CV page
    const onClickGoToProjects = () => {
        window.location.href = '/projects';
    };

    // Handle downloading summarized resume
    const onClickDownloadResume = () => {
        // Assuming you have a file link or generation logic for the resume
        const fileLink = '/path/to/summarized-resume.pdf';
        const a = document.createElement('a');
        a.href = fileLink;
        a.download = 'Summarized_Resume.pdf'; // Optional: name the file when downloading
        a.click();
    };

    return (
        <div className="hero">
            <div className='spacer'><span></span></div>
            <div className='text'>
                <h1 className="hero-title">I’M WANGHLEY</h1>
                <h2 className="hero-subtitle">ASPIRANT ENGINEER. ENTREPRENEUR. SCIENTIST. DEVELOPER.</h2>
                <p className='hero-paragraph'>Problem-solver. Computer Technician. Young Scientist. Fullstack Developer. Data Scientist. Data Analyst. Artificial Intelligence Developer. Quantum Computing Developer. DevOps. Social Entrepreneur. Speaker. Mentor.</p>
                <div className='hero-buttons'>
                    <button className='hero-button' onClick={onClickGoToProjects}>PROJECTS</button>
                    {/* go to /Curriculum-vitae page */}
                    <div className="dropdown-container">
                        {/* Button that toggles dropdown */}
                        <button className="hero-button secondary" onClick={onClickGoToCV}>
                            EXPERIENCES
                        </button>
                    </div>
                    <div />
                </div>
            </div>
        </div>
    )
}

export default Hero