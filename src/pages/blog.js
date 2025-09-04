import React, { useState, useEffect } from 'react';
import { CardGrid } from '../components';
import { fetchBlogs } from '../api/blog';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './css/blog.css';
import { Helmet } from 'react-helmet';
import { FaSearch, FaTags, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const Blogs = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const uniquePostIds = new Set();

    const loadPosts = async (page) => {
        try {
            setLoading(true);
            const newPosts = await fetchBlogs(page);

            if (newPosts && newPosts.length > 0) {
                // Extract all categories for the filter
                const allCategories = new Set(['All']);
                newPosts.forEach(post => {
                    if (post.attributes.Categories) {
                        post.attributes.Categories.forEach(category => {
                            allCategories.add(category);
                        });
                    }
                });
                setCategories(Array.from(allCategories));

                // Filter posts
                const filteredPosts = newPosts.filter(
                    post => !uniquePostIds.has(post.attributes.id)
                );
                filteredPosts.forEach(post => uniquePostIds.add(post.attributes.id));
                setPosts(prevPosts => [...prevPosts, ...filteredPosts]);
                setPage(page + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(page);
    }, []);

    const handleScroll = () => {
        if (loading) return;
        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100;
        if (isBottom && hasMore) {
            loadPosts(page);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, page]);

    // Filter posts based on search and category
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.attributes.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (post.attributes.Content && post.attributes.Content.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = activeCategory === 'All' || 
                               (post.attributes.Categories && post.attributes.Categories.includes(activeCategory));
        
        return matchesSearch && matchesCategory;
    });

    // Format date function
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get latest post for the header
    const latestPost = posts.length > 0 ? posts[0] : null;

    return (
        <div className="blog-page">
            <Helmet>
                <title>Wanghley's Blog</title>
                <meta name="description" content="Discover thoughts, insights, and stories from my journey through technology and life." />
                <link rel="canonical" href="https://wanghley.com/blog" />
                <meta name="keywords" content="Blog, Wanghley, Technology, Insights, Stories, Experiences" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Wanghley" />

                <meta property="og:title" content="Wanghley's Blog" />
                <meta property="og:description" content="Discover thoughts, insights, and stories from my journey through technology and life." />
                <meta property="og:url" content="https://wanghley.com/blog" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1700976651/branding/Logo_Wanghley_Simbolo_Fundo_Transparente_1_min_c28472b597.png" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Wanghley – Sci&Tech" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:locale:alternate" content="pt_BR" />
            </Helmet>
            
            {latestPost && (
                <div className="blog-featured-header" style={{
                    backgroundImage: `url(${latestPost.attributes.Featured?.data?.attributes?.formats?.large?.url || 'https://res.cloudinary.com/wanghley/image/upload/v1700976651/branding/Logo_Wanghley_Simbolo_Fundo_Transparente_1_min_c28472b597.png'})`
                }}>
                    <div className="blog-featured-overlay">
                        <div className="blog-featured-content">
                            <div className="blog-featured-meta">
                                {latestPost.attributes.Categories && latestPost.attributes.Categories.length > 0 && (
                                    <span className="blog-featured-category">{latestPost.attributes.Categories[0]}</span>
                                )}
                                <span className="blog-featured-date">
                                    <FaCalendarAlt />
                                    {formatDate(latestPost.attributes.publishedAt)}
                                </span>
                            </div>
                            <h1 className="blog-featured-title">{latestPost.attributes.Title}</h1>
                            <p className="blog-featured-excerpt">
                                {latestPost.attributes.Teaser}
                            </p>
                            <a href={`/blog/${latestPost.attributes.slug}`} className="blog-featured-button">
                                Read Article <FaArrowRight />
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="blog-container">
                <div className="blog-controls-container">
                    <h2 className="blog-section-title">All Articles</h2>
                    <div className="blog-controls">
                        <div className="blog-search">
                            <input 
                                type="text" 
                                placeholder="Search articles..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>
                        
                        <div className="blog-categories">
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
                
                {filteredPosts.length > 0 ? (
                    <div className="blog-grid">
                        <CardGrid cardData={filteredPosts} type='blog'/>
                    </div>
                ) : !loading ? (
                    <div className="no-results">
                        <h3>No articles found</h3>
                        <p>Try adjusting your search or category filters</p>
                    </div>
                ) : null}
                
                {loading && (
                    <div className="loading-container">
                        <CircularProgress />
                    </div>
                )}
                
                {!hasMore && !loading && filteredPosts.length > 0 && (
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

export default Blogs;