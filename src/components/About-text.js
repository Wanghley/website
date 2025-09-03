import fetchAbout from '../api/about';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './css/About.css';
import style from './css/markdown-styles.module.css';
import './css/AboutText.css';

const AboutText = () => {
    const [about, setAbout] = useState(null);
    const [personalInfo, setPersonalInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const contentRef = useRef(null);
    const [activeHeading, setActiveHeading] = useState(null);

    const getAbout = async () => {
        try {
            const data = await fetchAbout();
            const aboutContent = data.data.attributes.about;
            setAbout(aboutContent);
            
            // Set personal info if available
            if (data.data.attributes.personalInfo) {
                setPersonalInfo(data.data.attributes.personalInfo);
            }
            
            // Extract headings for the index (ignoring h1, only h2 and beyond)
            const tempHeadings = [];
            let sectionCounter = 0;
            let subsectionCounter = 0;
            
            aboutContent.split('\n').forEach(line => {
                const match = line.match(/^(#{2,3})\s+(.*)/); // Only match ## and ###
                if (match) {
                    const level = match[1].length;
                    const text = match[2];
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    
                    if (level === 2) {
                        sectionCounter++;
                        subsectionCounter = 0;
                    } else if (level === 3) {
                        subsectionCounter++;
                    }
                    
                    tempHeadings.push({ 
                        level, 
                        text,
                        id,
                        number: level === 2 ? sectionCounter : `${sectionCounter}.${subsectionCounter}`
                    });
                }
            });
            setHeadings(tempHeadings);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load content');
            setLoading(false);
        }
    };

    useEffect(() => {
        getAbout();
    }, []);

    // Track active section for TOC highlighting
    useEffect(() => {
        if (!headings.length) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveHeading(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -80% 0px" }
        );
        
        headings.forEach(heading => {
            const element = document.getElementById(heading.id);
            if (element) observer.observe(element);
        });
        
        return () => {
            headings.forEach(heading => {
                const element = document.getElementById(heading.id);
                if (element) observer.unobserve(element);
            });
        };
    }, [headings, loading]);

    // Scroll handling for the index
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const markdownComponents = {
        h1: ({ children }) => (
            <h1 className="about-page__main-title">{children}</h1>
        ),
        h2: ({ children }) => {
            const id = children.toLowerCase().replace(/[^\w]+/g, '-');
            const headingData = headings.find(h => h.id === id);
            const number = headingData ? headingData.number : '';
            
            return (
                <h2 id={id} className="about-page__markdown-header">
                    <span className="about-page__section-number">{number}</span> {children}
                </h2>
            );
        },
        h3: ({ children }) => {
            const id = children.toLowerCase().replace(/[^\w]+/g, '-');
            const headingData = headings.find(h => h.id === id);
            const number = headingData ? headingData.number : '';
            
            return (
                <h3 id={id} className="about-page__markdown-header">
                    <span className="about-page__section-number">{number}</span> {children}
                </h3>
            );
        },
        // Add custom rendering for links to make them Wikipedia-style
        a: ({ href, children }) => (
            <a href={href} className="about-page__wiki-link" target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
        // Make images display like Wikipedia with captions
        img: ({ src, alt }) => (
            <figure className="about-page__figure">
                <img src={src} alt={alt} className="about-page__image" />
                {alt && <figcaption className="about-page__figcaption">{alt}</figcaption>}
            </figure>
        )
    };

    // Toggle mobile index visibility
    const toggleMobileIndex = () => {
        const mobileIndex = document.querySelector('.about-page__mobile-index-content');
        if (mobileIndex) {
            mobileIndex.classList.toggle('open');
        }
    };

    if (loading) {
        return <div className="about-page__loading">Loading...</div>;
    }

    if (error) {
        return <p className="about-page__error">{error}</p>;
    }

    // Add a Wikipedia-style infobox
    const renderInfobox = () => {
        if (!personalInfo) return null;
        
        return (
            <div className="infobox">
                <div className="infobox-title">Wanghley</div>
                {personalInfo.photo && (
                    <figure className="infobox-figure">
                        <img src={personalInfo.photo} alt="Wanghley" className="infobox-image" />
                        <figcaption className="infobox-caption">Wanghley</figcaption>
                    </figure>
                )}
                <table className="infobox-table">
                    <tbody>
                        {personalInfo.born && (
                            <tr>
                                <th>Born</th>
                                <td>{personalInfo.born}</td>
                            </tr>
                        )}
                        {personalInfo.nationality && (
                            <tr>
                                <th>Nationality</th>
                                <td>{personalInfo.nationality}</td>
                            </tr>
                        )}
                        {personalInfo.education && (
                            <tr>
                                <th>Education</th>
                                <td>{personalInfo.education}</td>
                            </tr>
                        )}
                        {personalInfo.occupation && (
                            <tr>
                                <th>Occupation</th>
                                <td>{personalInfo.occupation}</td>
                            </tr>
                        )}
                        {personalInfo.knownFor && (
                            <tr>
                                <th>Known for</th>
                                <td>{personalInfo.knownFor}</td>
                            </tr>
                        )}
                        {personalInfo.website && (
                            <tr>
                                <th>Website</th>
                                <td>
                                    <a href={personalInfo.website} target="_blank" rel="noopener noreferrer">
                                        {personalInfo.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    // Generate Wikipedia-style hatnote
    const renderHatnote = () => (
        <div className="hatnote">
            <span>
                This article is about <strong>Wanghley</strong> the individual. For other uses, including quantumly entangled or alternate-universe Wanghleys, see <a href="#">Wanghley (disambiguation)</a>.
            </span>
        </div>
    );

    return (
        <div className="about-page">
            <div className="about-page__layout">
                {/* Sidebar with index */}
                <aside className="about-page__sidebar">
                    <div className="about-page__toc-container">
                        <div className="about-page__toc-header">Contents</div>
                        <ol className="about-page__index-list">
                            {headings.map((heading, index) => (
                                <li 
                                    key={index} 
                                    className={`about-page__index-item level-${heading.level} ${activeHeading === heading.id ? 'active' : ''}`}
                                    onClick={() => scrollToSection(heading.id)}
                                >
                                    <a href={`#${heading.id}`}>
                                        <span className="about-page__toc-number">{heading.number}</span> {heading.text}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </div>
                </aside>

                {/* Mobile index dropdown */}
                <div className="about-page__mobile-index">
                    <button className="about-page__mobile-index-toggle" onClick={toggleMobileIndex}>
                        Contents
                    </button>
                    <ol className="about-page__mobile-index-content">
                        {headings.map((heading, index) => (
                            <li 
                                key={index} 
                                className={`level-${heading.level}`}
                                onClick={() => scrollToSection(heading.id)}
                            >
                                <a href={`#${heading.id}`}>
                                    <span className="about-page__toc-number">{heading.number}</span> {heading.text}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Main content */}
                <div className="about-page__content" ref={contentRef}>
                    {/* Wikipedia style - title with pronunciation */}
                    <h1 className="about-page__title">
                        Wanghley
                        <span className="about-page__pronunciation">(/ˈwɐ̃ŋɡlej/)</span>
                    </h1>
                    
                    {/* Wikipedia-style hatnote */}
                    {renderHatnote()}
                    
                    {renderInfobox()}
                    
                    <div className="about-page__lead-paragraph">
                        <strong>Wanghley</strong> is a technologist, engineer, and innovator known for his work in artificial intelligence, computer science, and biomedical engineering.
                    </div>
                    
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="about-page__markdown"
                        components={markdownComponents}
                    >
                        {about}
                    </ReactMarkdown>
                    

                </div>
            </div>
        </div>
    );
};

export default AboutText;