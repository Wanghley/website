import React, { useState, useEffect, useCallback } from 'react';
import { CardGrid } from '../components';
import { fetchProjects } from '../api/projects';
import './css/projects.css';
import { Helmet } from 'react-helmet';
import { FaSearch, FaTags, FaCalendarAlt, FaArrowRight, FaFolder, FaCode, FaRocket } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import NavbarSpacer from '../components/NavbarSpacer';
import { Link } from 'react-router-dom';

// Skeleton Card Component
const SkeletonCard = () => (
    <div className="project-skeleton-card">
        <div className="project-skeleton-image shimmer"></div>
        <div className="project-skeleton-content">
            <div className="project-skeleton-category shimmer"></div>
            <div className="project-skeleton-title shimmer"></div>
            <div className="project-skeleton-text shimmer"></div>
            <div className="project-skeleton-text short shimmer"></div>
        </div>
    </div>
);

// Project Card Component
const ProjectCard = ({ project }) => {
    const { Title, Teaser, Category, Start, slug, Featured } = project.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.medium?.url || 
                     Featured?.data?.attributes?.formats?.small?.url ||
                     Featured?.data?.attributes?.url ||
                     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Link to={`/projects/${slug}`} className="project-card">
            <div className="project-card__image-wrapper">
                <img 
                    src={imageUrl} 
                    alt={Title} 
                    className="project-card__image"
                    loading="lazy"
                />
                <div className="project-card__overlay">
                    <span className="project-card__view">View Project</span>
                </div>
            </div>
            <div className="project-card__content">
                <div className="project-card__meta">
                    {Category && (
                        <span className="project-card__category">{Category}</span>
                    )}
                    {Start && (
                        <span className="project-card__date">{formatDate(Start)}</span>
                    )}
                </div>
                <h3 className="project-card__title">{Title}</h3>
                {Teaser && (
                    <p className="project-card__teaser">{Teaser}</p>
                )}
            </div>
        </Link>
    );
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [isVisible, setIsVisible] = useState(false);
    const uniqueProjectIds = new Set();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const loadProjects = async (pageNum) => {
        try {
            setLoading(true);
            const newProjects = await fetchProjects(pageNum);

            if (newProjects && newProjects.length > 0) {
                const allCategories = new Set(['All']);
                newProjects.forEach(project => {
                    if (project.attributes.Category) {
                        allCategories.add(project.attributes.Category);
                    }
                });
                setCategories(Array.from(allCategories));

                const filteredProjects = newProjects.filter(
                    project => !uniqueProjectIds.has(project.attributes.id)
                );
                filteredProjects.forEach(project => uniqueProjectIds.add(project.attributes.id));
                setProjects(prevProjects => [...prevProjects, ...filteredProjects]);
                setPage(pageNum + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadProjects(page);
    }, []);

    const handleScroll = useCallback(() => {
        if (loading || !hasMore) return;
        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 200;
        if (isBottom) {
            loadProjects(page);
        }
    }, [loading, hasMore, page]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.attributes.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (project.attributes.Description && project.attributes.Description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = activeCategory === 'All' || 
                               project.attributes.Category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const latestProject = projects.length > 0 ? projects[0] : null;

    // Stats for the hero section
    const stats = [
        { icon: FaFolder, label: 'Projects', value: projects.length || '10+' },
        { icon: FaCode, label: 'Technologies', value: '20+' },
        { icon: FaRocket, label: 'Deployed', value: '15+' },
    ];

    return (
        <div className="projects-page">
            <Helmet>
                <title>Projects | Wanghley - Engineering & Innovation</title>
                <meta name="description" content="Explore a diverse range of projects I've worked on, showcasing my skills and expertise in AI, health tech, and software engineering." />
                <link rel="canonical" href="https://wanghley.com/projects" />
                <meta name="keywords" content="Projects, Wanghley, Portfolio, AI, Health Tech, Software Engineering" />
                <meta name="author" content="Wanghley" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Wanghley's Projects" />
                <meta property="og:description" content="Explore a diverse range of projects showcasing skills in AI, health tech, and software engineering." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/projects" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1740099778/projects/large_e851a845_4eab_40ea_adc8_11bb99b908e8_fcd76cabf2.jpg" />
                <meta property="og:site_name" content="Wanghley – Sci&Tech" />
            </Helmet>
            
            <NavbarSpacer />

            {/* Hero Section */}
            <section className={`projects-hero ${isVisible ? 'visible' : ''}`}>
                <div className="projects-hero__bg">
                    <div className="projects-hero__gradient projects-hero__gradient--1"></div>
                    <div className="projects-hero__gradient projects-hero__gradient--2"></div>
                    <div className="projects-hero__grid"></div>
                </div>

                <div className="projects-hero__content">
                    <span className="projects-hero__label">
                        <HiSparkles /> Portfolio
                    </span>
                    <h1 className="projects-hero__title">
                        Engineering<br />
                        <span className="projects-hero__title-accent">Innovation</span>
                    </h1>
                    <p className="projects-hero__subtitle">
                        From concept to deployment — exploring the intersection of technology, health, and social impact.
                    </p>

                    <div className="projects-hero__stats">
                        {stats.map((stat, index) => (
                            <div key={index} className="projects-hero__stat">
                                <stat.icon className="projects-hero__stat-icon" />
                                <span className="projects-hero__stat-value">{stat.value}</span>
                                <span className="projects-hero__stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Project Preview */}
                {latestProject && !initialLoading && (
                    <div className="projects-hero__featured">
                        <span className="projects-hero__featured-label">Latest Project</span>
                        <Link to={`/projects/${latestProject.attributes.slug}`} className="projects-hero__featured-card">
                            <div className="projects-hero__featured-image">
                                <img 
                                    src={latestProject.attributes.Featured?.data?.attributes?.formats?.medium?.url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'} 
                                    alt={latestProject.attributes.Title}
                                />
                            </div>
                            <div className="projects-hero__featured-content">
                                <span className="projects-hero__featured-category">
                                    {latestProject.attributes.Category}
                                </span>
                                <h3>{latestProject.attributes.Title}</h3>
                                <p>{latestProject.attributes.Teaser}</p>
                                <span className="projects-hero__featured-link">
                                    View Project <FaArrowRight />
                                </span>
                            </div>
                        </Link>
                    </div>
                )}

                {initialLoading && (
                    <div className="projects-hero__featured">
                        <span className="projects-hero__featured-label">Latest Project</span>
                        <div className="projects-hero__featured-skeleton">
                            <div className="skeleton-image shimmer"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-category shimmer"></div>
                                <div className="skeleton-title shimmer"></div>
                                <div className="skeleton-text shimmer"></div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Main Content */}
            <section className="projects-main">
                <div className="projects-container">
                    {/* Search & Filter Bar */}
                    <div className={`projects-controls ${isVisible ? 'visible' : ''}`}>
                        <div className="projects-search">
                            <FaSearch className="projects-search__icon" />
                            <input 
                                type="text" 
                                placeholder="Search projects..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="projects-search__input"
                            />
                            {searchTerm && (
                                <button 
                                    className="projects-search__clear"
                                    onClick={() => setSearchTerm('')}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        
                        <div className="projects-filters">
                            <span className="projects-filters__label">
                                <FaTags /> Filter:
                            </span>
                            <div className="projects-filters__list">
                                {categories.map(category => (
                                    <button 
                                        key={category}
                                        className={`projects-filter-btn ${activeCategory === category ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                        {activeCategory === category && (
                                            <span className="projects-filter-btn__count">
                                                {category === 'All' ? projects.length : projects.filter(p => p.attributes.Category === category).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Info */}
                    <div className="projects-results-info">
                        <span>
                            {initialLoading ? 'Loading...' : `Showing ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
                            {activeCategory !== 'All' && ` in ${activeCategory}`}
                            {searchTerm && ` matching "${searchTerm}"`}
                        </span>
                    </div>

                    {/* Projects Grid */}
                    {initialLoading ? (
                        <div className="projects-grid">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonCard key={index} />
                            ))}
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="projects-grid">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard key={project.id || index} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="projects-empty">
                            <div className="projects-empty__icon">
                                <FaFolder />
                            </div>
                            <h3>No projects found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                            <button 
                                className="projects-empty__reset"
                                onClick={() => {
                                    setSearchTerm('');
                                    setActiveCategory('All');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Load More Indicator */}
                    {loading && !initialLoading && (
                        <div className="projects-loading">
                            <div className="projects-loading__spinner"></div>
                            <span>Loading more projects...</span>
                        </div>
                    )}

                    {/* End of Content */}
                    {!hasMore && !loading && filteredProjects.length > 0 && (
                        <div className="projects-end">
                            <div className="projects-end__line"></div>
                            <span>You've seen all projects</span>
                            <div className="projects-end__line"></div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Projects;