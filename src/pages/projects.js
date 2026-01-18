import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProjects } from '../api/projects';
import './css/projects.css';
import { Helmet } from 'react-helmet';
import { FaSearch, FaTags, FaArrowRight, FaFolder, FaCode, FaRocket, FaGithub, FaExternalLinkAlt, FaTimes, FaChevronDown } from 'react-icons/fa';
import { HiSparkles, HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi';
import { BiFilterAlt } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import NavbarSpacer from '../components/NavbarSpacer';
import { Link } from 'react-router-dom';

// Skeleton Card Component
const SkeletonCard = ({ variant = 'grid' }) => (
    <div className={`project-skeleton-card ${variant === 'list' ? 'project-skeleton-card--list' : ''}`}>
        <div className="project-skeleton-image shimmer"></div>
        <div className="project-skeleton-content">
            <div className="project-skeleton-category shimmer"></div>
            <div className="project-skeleton-title shimmer"></div>
            <div className="project-skeleton-text shimmer"></div>
            <div className="project-skeleton-text short shimmer"></div>
            <div className="project-skeleton-tags">
                <div className="project-skeleton-tag shimmer"></div>
                <div className="project-skeleton-tag shimmer"></div>
            </div>
        </div>
    </div>
);

// Project Card Component
const ProjectCard = ({ project, variant = 'grid', index }) => {
    const { Title, Teaser, Category, Start, slug, Featured, Github, Demo } = project.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.medium?.url || 
                     Featured?.data?.attributes?.formats?.small?.url ||
                     Featured?.data?.attributes?.url ||
                     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    if (variant === 'list') {
        return (
            <Link 
                to={`/projects/${slug}`} 
                className={`project-card project-card--list ${isVisible ? 'visible' : ''}`}
                ref={cardRef}
                style={{ '--delay': `${index * 0.05}s` }}
            >
                <div className="project-card__image-wrapper">
                    <img 
                        src={imageUrl} 
                        alt={Title} 
                        className="project-card__image"
                        loading="lazy"
                    />
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
                    <div className="project-card__actions">
                        <span className="project-card__link">
                            View Details <FaArrowRight />
                        </span>
                        {Github && (
                            <span className="project-card__icon-link" onClick={(e) => { e.preventDefault(); window.open(Github, '_blank'); }}>
                                <FaGithub />
                            </span>
                        )}
                        {Demo && (
                            <span className="project-card__icon-link" onClick={(e) => { e.preventDefault(); window.open(Demo, '_blank'); }}>
                                <FaExternalLinkAlt />
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link 
            to={`/projects/${slug}`} 
            className={`project-card ${isVisible ? 'visible' : ''}`}
            ref={cardRef}
            style={{ '--delay': `${index * 0.05}s` }}
        >
            <div className="project-card__image-wrapper">
                <img 
                    src={imageUrl} 
                    alt={Title} 
                    className="project-card__image"
                    loading="lazy"
                />
                <div className="project-card__overlay">
                    <span className="project-card__view">
                        <FaArrowRight /> View Project
                    </span>
                </div>
                {Category && (
                    <span className="project-card__badge">{Category}</span>
                )}
            </div>
            <div className="project-card__content">
                <div className="project-card__meta">
                    {Start && (
                        <span className="project-card__date">{formatDate(Start)}</span>
                    )}
                </div>
                <h3 className="project-card__title">{Title}</h3>
                {Teaser && (
                    <p className="project-card__teaser">{Teaser}</p>
                )}
                <div className="project-card__footer">
                    <span className="project-card__read-more">
                        Explore <FaArrowRight />
                    </span>
                    <div className="project-card__quick-links">
                        {Github && (
                            <span 
                                className="project-card__quick-link" 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(Github, '_blank'); }}
                                title="View Source"
                            >
                                <FaGithub />
                            </span>
                        )}
                        {Demo && (
                            <span 
                                className="project-card__quick-link" 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(Demo, '_blank'); }}
                                title="Live Demo"
                            >
                                <FaExternalLinkAlt />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Featured Hero Card Component
const FeaturedHeroCard = ({ project, loading }) => {
    if (loading) {
        return (
            <div className="projects-hero__featured-skeleton">
                <div className="skeleton-image shimmer"></div>
                <div className="skeleton-content">
                    <div className="skeleton-category shimmer"></div>
                    <div className="skeleton-title shimmer"></div>
                    <div className="skeleton-text shimmer"></div>
                    <div className="skeleton-text short shimmer"></div>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const { Title, Teaser, Category, slug, Featured, Start } = project.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.large?.url || 
                     Featured?.data?.attributes?.formats?.medium?.url || 
                     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Link to={`/projects/${slug}`} className="projects-hero__featured-card">
            <div className="projects-hero__featured-image">
                <img src={imageUrl} alt={Title} />
                <div className="projects-hero__featured-gradient"></div>
            </div>
            <div className="projects-hero__featured-content">
                <div className="projects-hero__featured-meta">
                    {Category && <span className="projects-hero__featured-category">{Category}</span>}
                    {Start && <span className="projects-hero__featured-date">{formatDate(Start)}</span>}
                </div>
                <h3>{Title}</h3>
                <p>{Teaser}</p>
                <span className="projects-hero__featured-link">
                    <span>View Project</span>
                    <FaArrowRight />
                </span>
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
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const uniqueProjectIds = useRef(new Set());
    const searchInputRef = useRef(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const loadProjects = useCallback(async (pageNum) => {
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
                    project => !uniqueProjectIds.current.has(project.id)
                );
                filteredProjects.forEach(project => uniqueProjectIds.current.add(project.id));
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
    }, []);

    useEffect(() => {
        loadProjects(1);
    }, [loadProjects]);

    const handleScroll = useCallback(() => {
        if (loading || !hasMore) return;
        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 400;
        if (isBottom) {
            loadProjects(page);
        }
    }, [loading, hasMore, page, loadProjects]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setSearchTerm('');
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredAndSortedProjects = React.useMemo(() => {
        let result = projects.filter(project => {
            const matchesSearch = project.attributes.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (project.attributes.Teaser && project.attributes.Teaser.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                 (project.attributes.Description && project.attributes.Description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = activeCategory === 'All' || 
                                   project.attributes.Category === activeCategory;
            
            return matchesSearch && matchesCategory;
        });

        // Sort
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.attributes.Start) - new Date(a.attributes.Start));
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.attributes.Start) - new Date(b.attributes.Start));
        } else if (sortBy === 'alphabetical') {
            result.sort((a, b) => a.attributes.Title.localeCompare(b.attributes.Title));
        }

        return result;
    }, [projects, searchTerm, activeCategory, sortBy]);

    const latestProject = projects.length > 0 ? projects[0] : null;

    const stats = [
        { icon: FaFolder, label: 'Projects', value: projects.length || '—' },
        { icon: FaCode, label: 'Technologies', value: '20+' },
        { icon: FaRocket, label: 'Deployed', value: '15+' },
    ];

    const clearFilters = () => {
        setSearchTerm('');
        setActiveCategory('All');
        setSortBy('newest');
    };

    const hasActiveFilters = searchTerm || activeCategory !== 'All' || sortBy !== 'newest';

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
                    <div className="projects-hero__gradient projects-hero__gradient--3"></div>
                    <div className="projects-hero__grid"></div>
                    <div className="projects-hero__particles">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="projects-hero__particle" style={{
                                '--x': `${Math.random() * 100}%`,
                                '--y': `${Math.random() * 100}%`,
                                '--duration': `${15 + Math.random() * 20}s`,
                                '--delay': `${Math.random() * 5}s`
                            }}></div>
                        ))}
                    </div>
                </div>

                <div className="projects-hero__content">
                    <span className="projects-hero__label">
                        <HiSparkles /> Portfolio
                    </span>
                    <h1 className="projects-hero__title">
                        <span className="projects-hero__title-line">Engineering</span>
                        <span className="projects-hero__title-accent">Innovation</span>
                    </h1>
                    <p className="projects-hero__subtitle">
                        From concept to deployment — exploring the intersection of technology, health, and social impact through hands-on engineering.
                    </p>

                    <div className="projects-hero__stats">
                        {stats.map((stat, index) => (
                            <div key={index} className="projects-hero__stat" style={{ '--delay': `${index * 0.1}s` }}>
                                <div className="projects-hero__stat-icon-wrapper">
                                    <stat.icon className="projects-hero__stat-icon" />
                                </div>
                                <span className="projects-hero__stat-value">{stat.value}</span>
                                <span className="projects-hero__stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="projects-hero__scroll-indicator">
                        <span>Scroll to explore</span>
                        <FaChevronDown className="projects-hero__scroll-icon" />
                    </div>
                </div>

                {/* Featured Project Preview */}
                <div className="projects-hero__featured">
                    <span className="projects-hero__featured-label">
                        <HiSparkles /> Latest Project
                    </span>
                    <FeaturedHeroCard project={latestProject} loading={initialLoading} />
                </div>
            </section>

            {/* Main Content */}
            <section className="projects-main">
                <div className="projects-container">
                    {/* Search & Filter Bar */}
                    <div className={`projects-controls ${isVisible ? 'visible' : ''}`}>
                        <div className="projects-controls__top">
                            <div className="projects-search">
                                <FaSearch className="projects-search__icon" />
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    placeholder="Search projects..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="projects-search__input"
                                />
                                <kbd className="projects-search__shortcut">⌘K</kbd>
                                {searchTerm && (
                                    <button 
                                        className="projects-search__clear"
                                        onClick={() => setSearchTerm('')}
                                        aria-label="Clear search"
                                    >
                                        <IoClose />
                                    </button>
                                )}
                            </div>

                            <div className="projects-controls__actions">
                                <button 
                                    className={`projects-filter-toggle ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <BiFilterAlt />
                                    <span>Filters</span>
                                    {hasActiveFilters && <span className="projects-filter-toggle__badge"></span>}
                                </button>

                                <div className="projects-view-toggle">
                                    <button 
                                        className={`projects-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        aria-label="Grid view"
                                    >
                                        <HiOutlineViewGrid />
                                    </button>
                                    <button 
                                        className={`projects-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        aria-label="List view"
                                    >
                                        <HiOutlineViewList />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Filters */}
                        <div className={`projects-controls__filters ${showFilters ? 'expanded' : ''}`}>
                            <div className="projects-filters">
                                <span className="projects-filters__label">
                                    <FaTags /> Categories:
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
                                                    {category === 'All' 
                                                        ? projects.length 
                                                        : projects.filter(p => p.attributes.Category === category).length
                                                    }
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="projects-sort">
                                <label className="projects-sort__label">Sort by:</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="projects-sort__select"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="alphabetical">A-Z</option>
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <button className="projects-clear-filters" onClick={clearFilters}>
                                    <FaTimes /> Clear all filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Info */}
                    <div className="projects-results-info">
                        <span className="projects-results-info__count">
                            {initialLoading ? (
                                <span className="projects-results-info__loading">Loading projects...</span>
                            ) : (
                                <>
                                    <strong>{filteredAndSortedProjects.length}</strong> project{filteredAndSortedProjects.length !== 1 ? 's' : ''} found
                                    {activeCategory !== 'All' && <span> in <em>{activeCategory}</em></span>}
                                    {searchTerm && <span> matching "<em>{searchTerm}</em>"</span>}
                                </>
                            )}
                        </span>
                    </div>

                    {/* Projects Grid */}
                    {initialLoading ? (
                        <div className={`projects-grid ${viewMode === 'list' ? 'projects-grid--list' : ''}`}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonCard key={index} variant={viewMode} />
                            ))}
                        </div>
                    ) : filteredAndSortedProjects.length > 0 ? (
                        <div className={`projects-grid ${viewMode === 'list' ? 'projects-grid--list' : ''}`}>
                            {filteredAndSortedProjects.map((project, index) => (
                                <ProjectCard 
                                    key={project.id || index} 
                                    project={project} 
                                    variant={viewMode}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="projects-empty">
                            <div className="projects-empty__illustration">
                                <FaFolder />
                                <div className="projects-empty__circles">
                                    <div className="projects-empty__circle"></div>
                                    <div className="projects-empty__circle"></div>
                                    <div className="projects-empty__circle"></div>
                                </div>
                            </div>
                            <h3>No projects found</h3>
                            <p>We couldn't find any projects matching your criteria. Try adjusting your search or filters.</p>
                            <button className="projects-empty__reset" onClick={clearFilters}>
                                <FaTimes /> Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Load More Indicator */}
                    {loading && !initialLoading && (
                        <div className="projects-loading">
                            <div className="projects-loading__spinner">
                                <div className="projects-loading__dot"></div>
                                <div className="projects-loading__dot"></div>
                                <div className="projects-loading__dot"></div>
                            </div>
                            <span>Loading more projects...</span>
                        </div>
                    )}

                    {/* End of Content */}
                    {!hasMore && !loading && filteredAndSortedProjects.length > 0 && (
                        <div className="projects-end">
                            <div className="projects-end__content">
                                <div className="projects-end__icon">
                                    <HiSparkles />
                                </div>
                                <span>You've explored all projects</span>
                                <p>Check back later for new additions</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Back to Top Button */}
            <BackToTop />
        </div>
    );
};

// Back to Top Component
const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 500);
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button 
            className={`back-to-top ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            <FaChevronDown style={{ transform: 'rotate(180deg)' }} />
        </button>
    );
};

export default Projects;