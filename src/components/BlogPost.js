import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/BlogPost.css';
import { formatDate } from '../utils/formatDate'; // Update this import path if needed
import { Helmet } from 'react-helmet';

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

const BlogPostPage = () => {
    const { slug } = useParams();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latestPosts, setLatestPosts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [socialMedia, setSocialMedia] = useState([]);

    useEffect(() => {
        const fetchBlogPost = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/api/slugify/slugs/blog/${slug}?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setBlogPost(response.data.data);
            } catch (error) {
                console.error('Fetch blog post error:', error.response || error.message || error);
                setError('Failed to fetch blog post details.');
            } finally {
                setLoading(false);
            }
        };

        const fetchLatestPosts = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/api/latest-posts?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setLatestPosts(response.data.data);
            } catch (error) {
                console.error('Fetch latest posts error:', error.response || error.message || error);
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/api/projects?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setProjects(response.data.data);
            } catch (error) {
                console.error('Fetch projects error:', error.response || error.message || error);
            }
        };

        const fetchSocialMedia = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/api/social-media-links`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setSocialMedia(response.data.data);
            } catch (error) {
                console.error('Fetch social media links error:', error.response || error.message || error);
            }
        };

        fetchBlogPost();
        fetchLatestPosts();
        fetchProjects();
        fetchSocialMedia();
    }, [slug]);

    if (loading) return <p className="loading-text">Loading...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!blogPost) return <p className="no-blog-post-text">No blog post found.</p>;

    const { Title, published, Content, Categories, updated } = blogPost.attributes;
    const featuredImage = blogPost.attributes.Featured?.data?.attributes?.formats?.large?.url;

    // Convert categories array to a comma-separated string
    const categoryList = Categories.slice(0, 3).join(', ');

    // Add this before the return statement
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": Title,
        "image": featuredImage,
        "datePublished": published,
        "author": {
            "@type": "Person",
            "name": "Wanghley"
        }
    };

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": Title,
        "image": featuredImage,
        "datePublished": published,
        "dateModified": updated,
        "author": {
            "@type": "Person",
            "name": "Wanghley",
            "url": "https://wanghley.com/about"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://wanghley.com"
        }, {
            "@type": "ListItem", 
            "position": 2,
            "name": "Blog",
            "item": "https://wanghley.com/blog"
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": Title
        }]
    };

    return (
        <div className="blog-page-container">
            <Helmet>
                <title>{Title}</title>
                <meta name="description" content={Content} />
                <link rel="canonical" href={`https://wanghley.com/blog/${slug}`} />
                <meta name="keywords" content={Categories.join(', ')} />
                <meta name="author" content="Wanghley" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={Title} />
                <meta property="og:description" content={Content} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://wanghley.com/blog/${slug}`} />
                <meta property="og:image" content={featuredImage || 'https://example.com/default-image.jpg'} />
                <meta property="og:site_name" content="Wanghley – Sci&Tech" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:locale:alternate" content="pt_BR" />
                <meta property="article:published_time" content={published} />
            </Helmet>
            <article className="blog-page">
                <header className="blog-page__header">
                    {featuredImage && (
                        <>
                            <div className="blog-page__image-container">
                                <img src={featuredImage} alt={Title} className="blog-page__image" />
                                <div className="blog-page__overlay">
                                    <h1 className="blog-page__title">{Title}</h1>
                                    <div className="blog-page__info">
                                        <span className="blog-page__category">{categoryList}</span>
                                        <span className="blog-page__dates">
                                            {published ? formatDate(published) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="blog-page__title-mobile">{Title}</h1>
                            <div className="blog-page__info-mobile">
                                <span className="blog-page__category">{categoryList}</span>
                                <span className="blog-page__dates">
                                    {published ? formatDate(published) : 'N/A'}
                                </span>
                            </div>
                        </>

                    )}
                    {!featuredImage && (
                        <div className="blog-page__title-container">
                            <h1 className="blog-page__title">{Title}</h1>
                            <div className="blog-page__info">
                                <span className="blog-page__category">{categoryList}</span>
                                <span className="blog-page__dates">
                                    {published ? formatDate(published) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    )}
                </header>

                <section className="blog-page__content">
                    {Content && <ReactMarkdown className="blog-page__text">{Content}</ReactMarkdown>}
                </section>
            </article>

            <aside className="sidebar">
                <section className="sidebar__section">
                    <h2>Latest Posts</h2>
                    <ul>
                        {latestPosts.map(post => (
                            <li key={post.id}><a href={`/blog/${post.slug}`}>{post.title}</a></li>
                        ))}
                    </ul>
                </section>

                <section className="sidebar__section">
                    <h2>Projects</h2>
                    <ul>
                        {projects.map(project => (
                            <li key={project.id}><a href={`/projects/${project.slug}`}>{project.title}</a></li>
                        ))}
                    </ul>
                </section>

                <section className="sidebar__section">
                    <h2>Social Media</h2>
                    <ul>
                        {socialMedia.map(link => (
                            <li key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a></li>
                        ))}
                    </ul>
                </section>
            </aside>
        </div>
    );
};

export default BlogPostPage;
