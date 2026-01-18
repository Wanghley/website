import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchProjects, fetchProjectsCount } from '../api/projects';
import './css/projects.css';
import { Helmet } from 'react-helmet';
import { FaSearch, FaArrowRight, FaFolder, FaCode, FaRocket, FaGithub, FaExternalLinkAlt, FaTimes, FaChevronUp, FaFilter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IoClose, IoGridOutline, IoListOutline } from 'react-icons/io5';
import { BsCalendar3, BsSortDown } from 'react-icons/bs';
import NavbarSpacer from '../components/NavbarSpacer';
import { Link } from 'react-router-dom';

// Skeleton Card Component
const SkeletonCard = ({ variant = 'grid' }) => (
    <div className={`project-card project-card--skeleton ${variant === 'list' ? 'project-card--list' : ''}`}>
        <div className="project-card__image skeleton-shimmer"></div>
        <div className="project-card__body">
            <div className="skeleton-line skeleton-line--sm skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-line--lg skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
        </div>
    </div>
);

// Project Card Component
const ProjectCard = ({ project, variant = 'grid', index }) => {
    const { Title, Teaser, Category, Start, slug, Featured, Github, Demo } = project.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.medium?.url || 
                     Featured?.data?.attributes?.formats?.small?.url ||
                     Featured?.data?.attributes?.url ||
                     'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <article 
            ref={cardRef}
            className={`project-card ${variant === 'list' ? 'project-card--list' : ''} ${isVisible ? 'project-card--visible' : ''}`}
            style={{ '--index': index }}
        >
            <Link to={`/projects/${slug}`} className="project-card__link">
                <div className="project-card__image-container">
                    <img 
                        src={imageUrl} 
                        alt={Title} 
                        className="project-card__image"
                        loading="lazy"
                    />
                    <div className="project-card__image-overlay">
                        <span className="project-card__cta">
                            View Project <FaArrowRight />
                        </span>
                    </div>
                    {Category && (
                        <span className="project-card__category-badge">{Category}</span>
                    )}
                </div>
                
                <div className="project-card__body">
                    <div className="project-card__meta">
                        {Start && (
                            <time className="project-card__date">
                                <BsCalendar3 /> {formatDate(Start)}
                            </time>
                        )}
                    </div>
                    
                    <h3 className="project-card__title">{Title}</h3>
                    
                    {Teaser && (
                        <p className="project-card__excerpt">{Teaser}</p>
                    )}
                    
                    <div className="project-card__footer">
                        <span className="project-card__read-more">
                            Learn more <FaArrowRight />
                        </span>
                        
                        <div className="project-card__actions" onClick={(e) => e.preventDefault()}>
                            {Github && (
                                <button 
                                    className="project-card__action-btn"
                                    onClick={(e) => { e.stopPropagation(); window.open(Github, '_blank'); }}
                                    aria-label="View source code"
                                >
                                    <FaGithub />
                                </button>
                            )}
                            {Demo && (
                                <button 
                                    className="project-card__action-btn"
                                    onClick={(e) => { e.stopPropagation(); window.open(Demo, '_blank'); }}
                                    aria-label="View live demo"
                                >
                                    <FaExternalLinkAlt />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};

// Featured Project Component
const FeaturedProject = ({ project, loading }) => {
    if (loading) {
        return (
            <div className="featured-project featured-project--skeleton">
                <div className="featured-project__image skeleton-shimmer"></div>
                <div className="featured-project__content">
                    <div className="skeleton-line skeleton-line--sm skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-line--xl skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-line--lg skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const { Title, Teaser, Category, slug, Featured, Start } = project.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.large?.url || 
                     Featured?.data?.attributes?.formats?.medium?.url || 
                     'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <Link to={`/projects/${slug}`} className="featured-project">
            <div className="featured-project__image-wrapper">
                <img src={imageUrl} alt={Title} className="featured-project__image" />
                <div className="featured-project__gradient"></div>
            </div>
            <div className="featured-project__content">
                <div className="featured-project__meta">
                    {Category && <span className="featured-project__category">{Category}</span>}
                    {Start && <time className="featured-project__date">{formatDate(Start)}</time>}
                </div>
                <h3 className="featured-project__title">{Title}</h3>
                {Teaser && <p className="featured-project__excerpt">{Teaser}</p>}
                <span className="featured-project__link">
                    Explore Project <FaArrowRight />
                </span>
            </div>
        </Link>
    );
};

// Main Projects Component
const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [totalProjects, setTotalProjects] = useState(null); // Store total count from API
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const uniqueProjectIds = useRef(new Set());
    const searchInputRef = useRef(null);

    const loadProjects = useCallback(async (pageNum) => {
        try {
            setLoading(true);
            const response = await fetchProjects(pageNum);
            
            // Extract projects and pagination info
            const newProjects = response.data;
            const pagination = response.meta?.pagination;

            // Set total count from API on first load
            if (pageNum === 1 && pagination?.total) {
                setTotalProjects(pagination.total);
            }

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

                // Check if there are more pages
                if (pagination && pageNum >= pagination.pageCount) {
                    setHasMore(false);
                }
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
        if (isBottom) loadProjects(page);
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

    const filteredAndSortedProjects = useMemo(() => {
        let result = projects.filter(project => {
            const matchesSearch = 
                project.attributes.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.attributes.Teaser && project.attributes.Teaser.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = activeCategory === 'All' || 
                                   project.attributes.Category === activeCategory;
            
            return matchesSearch && matchesCategory;
        });

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

    const clearFilters = () => {
        setSearchTerm('');
        setActiveCategory('All');
        setSortBy('newest');
    };

    const hasActiveFilters = searchTerm || activeCategory !== 'All' || sortBy !== 'newest';

    // Use totalProjects from API, fallback to loaded count
    const projectCount = totalProjects ?? projects.length;

    const stats = [
        { icon: FaFolder, value: projectCount || '—', label: 'Projects' },
        { icon: FaCode, value: '20+', label: 'Technologies' },
        { icon: FaRocket, value: '15+', label: 'Deployed' },
    ];

    return (
        <div className="projects-page">
            <Helmet>
                <title>Projects | Wanghley - Engineering & Innovation</title>
                <meta name="description" content="Explore a diverse range of projects showcasing skills in AI, health tech, and software engineering." />
                <link rel="canonical" href="https://wanghley.com/projects" />
                <meta name="keywords" content="Projects, Wanghley, Portfolio, AI, Health Tech, Software Engineering" />
                <meta property="og:title" content="Wanghley's Projects" />
                <meta property="og:description" content="Explore projects showcasing skills in AI, health tech, and software engineering." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/projects" />
            </Helmet>
            
            <NavbarSpacer />

            {/* ===== HERO SECTION ===== */}
            <header className="projects-hero">
                <div className="projects-hero__background">
                    <div className="projects-hero__orb projects-hero__orb--1"></div>
                    <div className="projects-hero__orb projects-hero__orb--2"></div>
                    <div className="projects-hero__grid"></div>
                </div>

                <div className="projects-hero__container">
                    <div className="projects-hero__text">
                        <span className="projects-hero__badge">
                            <HiSparkles /> Portfolio
                        </span>
                        
                        <h1 className="projects-hero__title">
                            Building the <span className="projects-hero__title-highlight">Future</span>
                        </h1>
                        
                        <p className="projects-hero__subtitle">
                            From concept to deployment — exploring the intersection of technology, 
                            health, and social impact through hands-on engineering.
                        </p>

                        <div className="projects-hero__stats">
                            {stats.map((stat, i) => (
                                <div key={i} className="projects-hero__stat">
                                    <stat.icon className="projects-hero__stat-icon" />
                                    <strong className="projects-hero__stat-value">{stat.value}</strong>
                                    <span className="projects-hero__stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="projects-hero__featured">
                        <span className="projects-hero__featured-badge">
                            <HiSparkles /> Latest Project
                        </span>
                        <FeaturedProject project={latestProject} loading={initialLoading} />
                    </div>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className="projects-body">
                <div className="projects-body__container">
                    
                    {/* Toolbar */}
                    <div className="projects-toolbar">
                        <div className="projects-toolbar__search">
                            <FaSearch className="projects-toolbar__search-icon" />
                            <input 
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="projects-toolbar__search-input"
                            />
                            <kbd className="projects-toolbar__shortcut">⌘K</kbd>
                            {searchTerm && (
                                <button 
                                    className="projects-toolbar__search-clear"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    <IoClose />
                                </button>
                            )}
                        </div>

                        <div className="projects-toolbar__actions">
                            <button 
                                className={`projects-toolbar__filter-btn ${filtersOpen ? 'active' : ''}`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                <FaFilter />
                                <span>Filters</span>
                                {hasActiveFilters && <span className="projects-toolbar__filter-dot"></span>}
                            </button>

                            <div className="projects-toolbar__view-toggle">
                                <button 
                                    className={`projects-toolbar__view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                >
                                    <IoGridOutline />
                                </button>
                                <button 
                                    className={`projects-toolbar__view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label="List view"
                                >
                                    <IoListOutline />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    <div className={`projects-filters ${filtersOpen ? 'projects-filters--open' : ''}`}>
                        <div className="projects-filters__group">
                            <label className="projects-filters__label">Category</label>
                            <div className="projects-filters__tags">
                                {categories.map(category => (
                                    <button 
                                        key={category}
                                        className={`projects-filters__tag ${activeCategory === category ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                        {activeCategory === category && (
                                            <span className="projects-filters__tag-count">
                                                {category === 'All' 
                                                    ? totalProjects ?? projects.length 
                                                    : projects.filter(p => p.attributes.Category === category).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="projects-filters__group">
                            <label className="projects-filters__label">Sort by</label>
                            <div className="projects-filters__sort">
                                <BsSortDown />
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="projects-filters__select"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="alphabetical">A → Z</option>
                                </select>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button className="projects-filters__clear" onClick={clearFilters}>
                                <FaTimes /> Clear filters
                            </button>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="projects-results">
                        {initialLoading ? (
                            <span>Loading projects...</span>
                        ) : (
                            <span>
                                Showing <strong>{filteredAndSortedProjects.length}</strong>
                                {totalProjects && totalProjects !== filteredAndSortedProjects.length && !hasActiveFilters && (
                                    <> of <strong>{totalProjects}</strong></>
                                )}
                                {' '}project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
                                {activeCategory !== 'All' && <> in <em>{activeCategory}</em></>}
                                {searchTerm && <> matching "<em>{searchTerm}</em>"</>}
                            </span>
                        )}
                    </div>

                    {/* Projects Grid */}
                    {initialLoading ? (
                        <div className={`projects-grid ${viewMode === 'list' ? 'projects-grid--list' : ''}`}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} variant={viewMode} />
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
                            <div className="projects-empty__icon">
                                <FaFolder />
                            </div>
                            <h3 className="projects-empty__title">No projects found</h3>
                            <p className="projects-empty__text">
                                Try adjusting your search or filter criteria.
                            </p>
                            <button className="projects-empty__btn" onClick={clearFilters}>
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Loading More */}
                    {loading && !initialLoading && (
                        <div className="projects-loading">
                            <div className="projects-loading__dots">
                                <span></span><span></span><span></span>
                            </div>
                            <p>Loading more projects...</p>
                        </div>
                    )}

                    {/* End Message */}
                    {!hasMore && !loading && filteredAndSortedProjects.length > 0 && (
                        <div className="projects-end">
                            <HiSparkles />
                            <span>You've seen all {totalProjects ?? projects.length} projects</span>
                        </div>
                    )}
                </div>
            </main>

            {/* Back to Top */}
            <BackToTop />
        </div>
    );
};

// Back to Top Component
const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setVisible(window.pageYOffset > 500);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button 
            className={`back-to-top ${visible ? 'back-to-top--visible' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
        >
            <FaChevronUp />
        </button>
    );
};

export default Projects;