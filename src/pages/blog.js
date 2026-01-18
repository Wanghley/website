import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchBlogs } from '../api/blog';
import './css/blog.css';
import { Helmet } from "react-helmet-async";
import { 
    FaSearch, FaArrowRight, FaBookOpen, FaPen, FaNewspaper, 
    FaChevronUp, FaFilter, FaTimes, FaClock 
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IoClose, IoGridOutline, IoListOutline } from 'react-icons/io5';
import { BsCalendar3, BsSortDown } from 'react-icons/bs';
import NavbarSpacer from '../components/NavbarSpacer';
import { Link } from 'react-router-dom';

// Calculate reading time
const calculateReadTime = (content) => {
    if (!content) return 3;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Format date helper
const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateLong = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Skeleton Card Component
const SkeletonCard = ({ variant = 'grid' }) => (
    <div className={`blog-card blog-card--skeleton ${variant === 'list' ? 'blog-card--list' : ''}`}>
        <div className="blog-card__image skeleton-shimmer"></div>
        <div className="blog-card__body">
            <div className="skeleton-line skeleton-line--sm skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-line--lg skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
            <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
        </div>
    </div>
);

// Blog Card Component
const BlogCard = ({ post, variant = 'grid', index }) => {
    const { Title, Teaser, Categories, publishedAt, slug, Featured, Content } = post.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.medium?.url || 
                     Featured?.data?.attributes?.formats?.small?.url ||
                     Featured?.data?.attributes?.url ||
                     'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80';
    
    const category = Categories && Categories.length > 0 ? Categories[0] : 'Article';
    const readTime = calculateReadTime(Content);

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
            className={`blog-card ${variant === 'list' ? 'blog-card--list' : ''} ${isVisible ? 'blog-card--visible' : ''}`}
            style={{ '--index': index }}
        >
            <Link to={`/blog/${slug}`} className="blog-card__link">
                <div className="blog-card__image-container">
                    <img 
                        src={imageUrl} 
                        alt={Title} 
                        className="blog-card__image"
                        loading="lazy"
                    />
                    <div className="blog-card__image-overlay">
                        <span className="blog-card__cta">
                            Read Article <FaArrowRight />
                        </span>
                    </div>
                    <span className="blog-card__category-badge">{category}</span>
                </div>
                
                <div className="blog-card__body">
                    <div className="blog-card__meta">
                        {publishedAt && (
                            <time className="blog-card__date">
                                <BsCalendar3 /> {formatDateShort(publishedAt)}
                            </time>
                        )}
                        <span className="blog-card__read-time">
                            <FaClock /> {readTime} min read
                        </span>
                    </div>
                    
                    <h3 className="blog-card__title">{Title}</h3>
                    
                    {Teaser && (
                        <p className="blog-card__excerpt">{Teaser}</p>
                    )}
                    
                    <div className="blog-card__footer">
                        <span className="blog-card__read-more">
                            Continue reading <FaArrowRight />
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
};

// Featured Post Component
const FeaturedPost = ({ post, loading }) => {
    if (loading) {
        return (
            <div className="featured-post featured-post--skeleton">
                <div className="featured-post__image-wrapper skeleton-shimmer"></div>
                <div className="featured-post__content">
                    <div className="skeleton-line skeleton-line--sm skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-line--lg skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-line--md skeleton-shimmer"></div>
                </div>
            </div>
        );
    }

    if (!post) return null;

    const { Title, Teaser, Categories, slug, Featured, publishedAt, Content } = post.attributes;
    const imageUrl = Featured?.data?.attributes?.formats?.large?.url || 
                     Featured?.data?.attributes?.formats?.medium?.url || 
                     'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80';

    const category = Categories && Categories.length > 0 ? Categories[0] : 'Article';
    const readTime = calculateReadTime(Content);

    return (
        <Link to={`/blog/${slug}`} className="featured-post">
            <div className="featured-post__image-wrapper">
                <img src={imageUrl} alt={Title} className="featured-post__image" />
                <div className="featured-post__gradient"></div>
            </div>
            <div className="featured-post__content">
                <div className="featured-post__meta">
                    <span className="featured-post__category">{category}</span>
                    <span className="featured-post__date">{formatDateLong(publishedAt)}</span>
                    <span className="featured-post__read-time">{readTime} min read</span>
                </div>
                <h3 className="featured-post__title">{Title}</h3>
                {Teaser && <p className="featured-post__excerpt">{Teaser}</p>}
                <span className="featured-post__link">
                    Read Article <FaArrowRight />
                </span>
            </div>
        </Link>
    );
};

// Main Blog Component
const Blogs = () => {
    const [posts, setPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(null);
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
    const loadedPostIds = useRef(new Set());
    const searchInputRef = useRef(null);

    // Load posts function
    const loadPosts = useCallback(async (pageNum, isInitial = false) => {
        if (loading && !isInitial) return;
        
        try {
            setLoading(true);
            const newPosts = await fetchBlogs(pageNum);
            
            if (!newPosts || newPosts.length === 0) {
                setHasMore(false);
                if (isInitial) {
                    setPosts([]);
                    setTotalPosts(0);
                }
                return;
            }

            // Extract categories from all posts
            const allCategories = new Set(['All']);
            newPosts.forEach(post => {
                if (post.attributes?.Categories) {
                    post.attributes.Categories.forEach(category => {
                        allCategories.add(category);
                    });
                }
            });
            setCategories(Array.from(allCategories));

            if (isInitial) {
                // Initial load - replace all posts
                setPosts(newPosts);
                loadedPostIds.current = new Set(newPosts.map(p => p.id));
                setTotalPosts(newPosts.length);
                setPage(2);
            } else {
                // Pagination - add new posts, avoiding duplicates
                const uniqueNewPosts = newPosts.filter(post => !loadedPostIds.current.has(post.id));
                
                if (uniqueNewPosts.length > 0) {
                    uniqueNewPosts.forEach(post => loadedPostIds.current.add(post.id));
                    setPosts(prevPosts => [...prevPosts, ...uniqueNewPosts]);
                    setPage(pageNum + 1);
                }
            }

            // Check if we have more posts to load
            if (newPosts.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
            if (isInitial) {
                setInitialLoading(false);
            }
        }
    }, [loading]);

    // Initial load
    useEffect(() => {
        loadPosts(1, true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (loading || !hasMore || initialLoading) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.offsetHeight - 400;
        
        if (scrollPosition >= threshold) {
            loadPosts(page, false);
        }
    }, [loading, hasMore, page, initialLoading, loadPosts]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
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
                searchInputRef.current?.blur();
                setFiltersOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter and sort posts - this is where the main logic happens
    const filteredAndSortedPosts = useMemo(() => {
        let result = [...posts];

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(post => {
                const title = post.attributes?.Title?.toLowerCase() || '';
                const teaser = post.attributes?.Teaser?.toLowerCase() || '';
                const content = post.attributes?.Content?.toLowerCase() || '';
                const categories = post.attributes?.Categories || [];
                
                return title.includes(term) ||
                       teaser.includes(term) ||
                       content.includes(term) ||
                       categories.some(cat => cat.toLowerCase().includes(term));
            });
        }

        // Filter by category
        if (activeCategory !== 'All') {
            result = result.filter(post => 
                post.attributes?.Categories?.includes(activeCategory)
            );
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.attributes?.publishedAt || 0);
            const dateB = new Date(b.attributes?.publishedAt || 0);
            const titleA = a.attributes?.Title || '';
            const titleB = b.attributes?.Title || '';
            
            switch (sortBy) {
                case 'oldest':
                    return dateA - dateB;
                case 'alphabetical':
                    return titleA.localeCompare(titleB);
                case 'newest':
                default:
                    return dateB - dateA;
            }
        });

        return result;
    }, [posts, searchTerm, activeCategory, sortBy]);

    // Get the latest post for the featured section
    const latestPost = useMemo(() => {
        if (posts.length === 0) return null;
        
        // Sort by date and get the most recent
        const sorted = [...posts].sort((a, b) => {
            const dateA = new Date(a.attributes?.publishedAt || 0);
            const dateB = new Date(b.attributes?.publishedAt || 0);
            return dateB - dateA;
        });
        
        return sorted[0];
    }, [posts]);

    const clearFilters = () => {
        setSearchTerm('');
        setActiveCategory('All');
        setSortBy('newest');
    };

    const hasActiveFilters = searchTerm || activeCategory !== 'All' || sortBy !== 'newest';

    // Use actual post count
    const postCount = posts.length;

    const stats = [
        { icon: FaBookOpen, value: postCount || '—', label: 'Articles' },
        { icon: FaPen, value: Math.max(0, categories.length - 1) || '—', label: 'Topics' },
        { icon: FaNewspaper, value: '2024', label: 'Since' },
    ];

    return (
        <div className="blog-page-new">
            <Helmet>
                <title>Blog | Wanghley - Thoughts & Insights</title>
                <meta name="description" content="Explore thoughts, insights, and stories about AI, health tech, engineering, and innovation." />
                <link rel="canonical" href="https://wanghley.com/blog" />
                <meta name="keywords" content="Blog, Wanghley, AI, Health Tech, Engineering, Insights" />
                <meta property="og:title" content="Wanghley's Blog" />
                <meta property="og:description" content="Thoughts and insights on technology, engineering, and innovation." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/blog" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png" />
            </Helmet>
            
            <NavbarSpacer />

            {/* ===== HERO SECTION ===== */}
            <header className="blog-hero">
                <div className="blog-hero__background">
                    <div className="blog-hero__orb blog-hero__orb--1"></div>
                    <div className="blog-hero__orb blog-hero__orb--2"></div>
                    <div className="blog-hero__grid"></div>
                </div>

                <div className="blog-hero__container">
                    <div className="blog-hero__text">
                        <span className="blog-hero__badge">
                            <HiSparkles /> Blog
                        </span>
                        
                        <h1 className="blog-hero__title">
                            Writing & <span className="blog-hero__title-highlight">Thoughts</span>
                        </h1>
                        
                        <p className="blog-hero__subtitle">
                            Exploring ideas at the intersection of technology, health, 
                            and social impact through technical deep-dives and reflections.
                        </p>

                        <div className="blog-hero__stats">
                            {stats.map((stat, i) => (
                                <div key={i} className="blog-hero__stat">
                                    <stat.icon className="blog-hero__stat-icon" />
                                    <strong className="blog-hero__stat-value">{stat.value}</strong>
                                    <span className="blog-hero__stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="blog-hero__featured">
                        <span className="blog-hero__featured-badge">
                            <HiSparkles /> Latest Article
                        </span>
                        <FeaturedPost post={latestPost} loading={initialLoading} />
                    </div>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className="blog-body">
                <div className="blog-body__container">
                    
                    {/* Toolbar */}
                    <div className="blog-toolbar">
                        <div className="blog-toolbar__search">
                            <FaSearch className="blog-toolbar__search-icon" />
                            <input 
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="blog-toolbar__search-input"
                            />
                            <kbd className="blog-toolbar__shortcut">⌘K</kbd>
                            {searchTerm && (
                                <button 
                                    className="blog-toolbar__search-clear"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                >
                                    <IoClose />
                                </button>
                            )}
                        </div>

                        <div className="blog-toolbar__actions">
                            <button 
                                className={`blog-toolbar__filter-btn ${filtersOpen ? 'active' : ''}`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                <FaFilter />
                                <span>Filters</span>
                                {hasActiveFilters && <span className="blog-toolbar__filter-dot"></span>}
                            </button>

                            <div className="blog-toolbar__view-toggle">
                                <button 
                                    className={`blog-toolbar__view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                >
                                    <IoGridOutline />
                                </button>
                                <button 
                                    className={`blog-toolbar__view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label="List view"
                                >
                                    <IoListOutline />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    <div className={`blog-filters ${filtersOpen ? 'blog-filters--open' : ''}`}>
                        <div className="blog-filters__inner">
                            {/* Categories */}
                            <div className="blog-filters__group blog-filters__group--categories">
                                <label className="blog-filters__label">Topic</label>
                                <div className="blog-filters__tags">
                                    {categories.map(category => (
                                        <button 
                                            key={category}
                                            className={`blog-filters__tag ${activeCategory === category ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(category)}
                                        >
                                            {category}
                                            {activeCategory === category && (
                                                <span className="blog-filters__tag-count">
                                                    {category === 'All' 
                                                        ? posts.length 
                                                        : posts.filter(p => p.attributes?.Categories?.includes(category)).length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="blog-filters__group blog-filters__group--sort">
                                <label className="blog-filters__label">Sort by</label>
                                <div className="blog-filters__sort-wrapper">
                                    <select 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="blog-filters__select"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="alphabetical">A → Z</option>
                                    </select>
                                    <BsSortDown className="blog-filters__sort-icon" />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <div className="blog-filters__group blog-filters__group--actions">
                                    <label className="blog-filters__label">&nbsp;</label>
                                    <button className="blog-filters__clear" onClick={clearFilters}>
                                        <FaTimes /> Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="blog-results">
                        {initialLoading ? (
                            <span>Loading articles...</span>
                        ) : (
                            <span>
                                Showing <strong>{filteredAndSortedPosts.length}</strong>
                                {posts.length !== filteredAndSortedPosts.length && (
                                    <> of <strong>{posts.length}</strong></>
                                )}
                                {' '}article{filteredAndSortedPosts.length !== 1 ? 's' : ''}
                                {activeCategory !== 'All' && <> in <em>{activeCategory}</em></>}
                                {searchTerm && <> matching "<em>{searchTerm}</em>"</>}
                            </span>
                        )}
                    </div>

                    {/* Blog Grid */}
                    {initialLoading ? (
                        <div className={`blog-grid ${viewMode === 'list' ? 'blog-grid--list' : ''}`}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} variant={viewMode} />
                            ))}
                        </div>
                    ) : filteredAndSortedPosts.length > 0 ? (
                        <div className={`blog-grid ${viewMode === 'list' ? 'blog-grid--list' : ''}`}>
                            {filteredAndSortedPosts.map((post, index) => (
                                <BlogCard 
                                    key={post.id} 
                                    post={post} 
                                    variant={viewMode}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="blog-empty">
                            <div className="blog-empty__icon">
                                <FaBookOpen />
                            </div>
                            <h3 className="blog-empty__title">No articles found</h3>
                            <p className="blog-empty__text">
                                {hasActiveFilters 
                                    ? "Try adjusting your search or filter criteria."
                                    : "No blog posts available yet. Check back soon!"}
                            </p>
                            {hasActiveFilters && (
                                <button className="blog-empty__btn" onClick={clearFilters}>
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Loading More */}
                    {loading && !initialLoading && (
                        <div className="blog-loading">
                            <div className="blog-loading__dots">
                                <span></span><span></span><span></span>
                            </div>
                            <p>Loading more articles...</p>
                        </div>
                    )}

                    {/* End Message */}
                    {!hasMore && !loading && posts.length > 0 && !hasActiveFilters && (
                        <div className="blog-end">
                            <HiSparkles />
                            <span>You've seen all {posts.length} articles</span>
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
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button 
            className={`blog-back-to-top ${visible ? 'blog-back-to-top--visible' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
        >
            <FaChevronUp />
        </button>
    );
};

export default Blogs;