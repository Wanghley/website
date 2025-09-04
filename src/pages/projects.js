import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '../components';
import { fetchProjects } from '../api/projects';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './css/projects.css';
import { Helmet } from 'react-helmet';
import { FaSearch, FaTags, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const Projects = (props) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const uniqueProjectIds = new Set();

    const loadProjects = async (page) => {
        try {
            setLoading(true);
            const newProjects = await fetchProjects(page);

            if (newProjects && newProjects.length > 0) {
                // Extract all categories for the filter
                const allCategories = new Set(['All']);
                newProjects.forEach(project => {
                    if (project.attributes.Category) {
                        allCategories.add(project.attributes.Category);
                    }
                });
                setCategories(Array.from(allCategories));

                const filteredProjects = newProjects.filter(
                    (project) => !uniqueProjectIds.has(project.attributes.id)
                );
                filteredProjects.forEach((project) => uniqueProjectIds.add(project.attributes.id));
                setProjects((prevProjects) => [...prevProjects, ...filteredProjects]);
                setPage(page + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects(page);
    }, []);

    const handleScroll = () => {
        if (loading) return;
        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100;
        if (isBottom && hasMore) {
            loadProjects(page);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, page]);

    // Filter projects based on search and category
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.attributes.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (project.attributes.Description && project.attributes.Description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = activeCategory === 'All' || 
                               project.attributes.Category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Get featured project for the header (using the first project)
    const featuredProject = projects.length > 0 ? projects[0] : null;

    return (
        <div className="projects">
            <Helmet>
                <title>Wanghley's Projects</title>
                <meta name="description" content="Explore a diverse range of projects I've worked on, showcasing my skills and expertise." />
                <link rel="canonical" href="https://wanghley.com/projects" />
                <meta name="keywords" content="Projects, Wanghley, Portfolio, Skills, Experience" />
                <meta name="author" content="Wanghley" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Wanghley's Projects" />
                <meta property="og:description" content="Explore a diverse range of projects I've worked on, showcasing my skills and expertise." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/projects" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1740099778/projects/large_e851a845_4eab_40ea_adc8_11bb99b908e8_fcd76cabf2.jpg" />
                <meta property="og:site_name" content="Wanghley – Sci&Tech" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:locale:alternate" content="pt_BR" />
            </Helmet>
            
            {featuredProject && (
                <div className="projects-featured-header" style={{
                    backgroundImage: `url(${featuredProject.attributes.Featured?.data?.attributes?.formats?.large?.url || 'https://res.cloudinary.com/wanghley/image/upload/v1700976651/branding/Logo_Wanghley_Simbolo_Fundo_Transparente_1_min_c28472b597.png'})`
                }}>
                    <div className="projects-featured-overlay">
                        <div className="projects-featured-content">
                            <div className="projects-featured-meta">
                                {featuredProject.attributes.Category && (
                                    <span className="projects-featured-category">{featuredProject.attributes.Category}</span>
                                )}
                                <span className="projects-featured-date">
                                    <FaCalendarAlt />
                                    {featuredProject.attributes.Start}
                                </span>
                            </div>
                            <h1 className="projects-featured-title">{featuredProject.attributes.Title}</h1>
                            <p className="projects-featured-excerpt">
                                {featuredProject.attributes.Teaser}
                            </p>
                            <a href={`/projects/${featuredProject.attributes.slug}`} className="projects-featured-button">
                                View Project <FaArrowRight />
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="projects-container">
                <div className="projects-controls-container">
                    <h2 className="projects-section-title">All Projects</h2>
                    <div className="projects-controls">
                        <div className="projects-search">
                            <input 
                                type="text" 
                                placeholder="Search projects..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>
                        
                        <div className="projects-categories">
                            <div className="categories-header">
                                <FaTags className="categories-icon" />
                                <span>Filter by:</span>
                            </div>
                            <div className="categories-list">
                                {categories.map(category => (
                                    <button 
                                        key={category}
                                        className={`category-button ${activeCategory === category ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {filteredProjects.length > 0 ? (
                    <div className="projects-grid">
                        <CardGrid cardData={filteredProjects} type='project'/>
                    </div>
                ) : !loading ? (
                    <div className="no-results">
                        <h3>No projects found</h3>
                        <p>Try adjusting your search or category filters</p>
                    </div>
                ) : null}
                
                {loading && (
                    <div className="loading-container">
                        <CircularProgress />
                    </div>
                )}
                
                {!hasMore && !loading && filteredProjects.length > 0 && (
                    <div className="end-of-content">
                        <div className="end-line"></div>
                        <span>You've reached the end</span>
                        <div className="end-line"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;