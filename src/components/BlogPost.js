import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/BlogPost.css';
import { formatDate } from '../utils/formatDate';
import { 
    FaTag, FaCalendarAlt, FaArrowLeft, FaChevronUp, 
    FaShareAlt, FaLink, FaClock, FaBookOpen, FaUser
} from "react-icons/fa";
import { HiSparkles, HiOutlineBookOpen } from 'react-icons/hi';
import { BsArrowUpRight, BsChevronRight } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Helmet } from "react-helmet-async";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

// Reading time calculator
const calculateReadingTime = (text) => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Copy link functionality
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

// Back to Top Button Component
const BackToTop = React.memo(() => {
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
});

BackToTop.displayName = 'BackToTop';

// Progress Bar Component
const ReadingProgress = React.memo(() => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.min(scrollPercent, 100));
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="blog-progress">
            <div className="blog-progress__bar" style={{ width: `${progress}%` }} />
        </div>
    );
});

ReadingProgress.displayName = 'ReadingProgress';

// Table of Contents Component
const TableOfContents = React.memo(({ headings, activeId }) => {
    if (!headings || headings.length === 0) return null;

    return (
        <nav className="blog-toc" aria-label="Table of contents">
            <div className="blog-toc__header">
                <HiOutlineBookOpen className="blog-toc__icon" />
                <h3 className="blog-toc__title">On This Page</h3>
            </div>
            <ul className="blog-toc__list">
                {headings.map((heading, index) => (
                    <li 
                        key={index} 
                        className={`blog-toc__item blog-toc__item--level-${heading.level} ${activeId === heading.id ? 'blog-toc__item--active' : ''}`}
                    >
                        <a href={`#${heading.id}`}>
                            <span className="blog-toc__marker"></span>
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
});

TableOfContents.displayName = 'TableOfContents';

// Share Button Component
const ShareButton = React.memo(({ title, url }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            const success = await copyToClipboard(url);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    return (
        <button className="blog-btn blog-btn--outline" onClick={handleShare}>
            {copied ? <FaLink /> : <FaShareAlt />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
    );
});

ShareButton.displayName = 'ShareButton';

// Loading Skeleton Component
const BlogSkeleton = () => (
    <div className="blog-post-page blog-post-page--loading">
        <div className="blog-skeleton">
            <div className="blog-skeleton__hero">
                <div className="blog-skeleton__hero-content">
                    <div className="blog-skeleton__breadcrumb shimmer"></div>
                    <div className="blog-skeleton__meta shimmer"></div>
                    <div className="blog-skeleton__title shimmer"></div>
                    <div className="blog-skeleton__teaser shimmer"></div>
                </div>
            </div>
            <div className="blog-skeleton__body">
                <div className="blog-skeleton__sidebar">
                    <div className="blog-skeleton__toc shimmer"></div>
                </div>
                <div className="blog-skeleton__main">
                    <div className="blog-skeleton__line blog-skeleton__line--full shimmer"></div>
                    <div className="blog-skeleton__line blog-skeleton__line--lg shimmer"></div>
                    <div className="blog-skeleton__line blog-skeleton__line--md shimmer"></div>
                    <div className="blog-skeleton__line blog-skeleton__line--full shimmer"></div>
                    <div className="blog-skeleton__line blog-skeleton__line--sm shimmer"></div>
                </div>
            </div>
        </div>
    </div>
);

// Mobile TOC Component
const MobileTOC = React.memo(({ headings, isOpen, onClose }) => {
    if (!headings || headings.length === 0) return null;

    return (
        <>
            <div 
                className={`blog-mobile-toc__backdrop ${isOpen ? 'blog-mobile-toc__backdrop--visible' : ''}`}
                onClick={onClose}
            />
            <div className={`blog-mobile-toc ${isOpen ? 'blog-mobile-toc--open' : ''}`}>
                <div className="blog-mobile-toc__header">
                    <h3>Contents</h3>
                    <button onClick={onClose} aria-label="Close menu">
                        <IoClose />
                    </button>
                </div>
                <ul className="blog-mobile-toc__list">
                    {headings.map((heading, index) => (
                        <li key={index} className={`blog-mobile-toc__item level-${heading.level}`}>
                            <a href={`#${heading.id}`} onClick={onClose}>
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
});

MobileTOC.displayName = 'MobileTOC';

// Related Posts Component
const RelatedPosts = React.memo(({ posts, currentSlug }) => {
    const filteredPosts = posts.filter(post => post.attributes?.slug !== currentSlug).slice(0, 3);
    
    if (filteredPosts.length === 0) return null;

    return (
        <div className="blog-related">
            <h4 className="blog-related__title">Related Articles</h4>
            <div className="blog-related__grid">
                {filteredPosts.map((post, index) => {
                    const imageUrl = post.attributes?.Featured?.data?.attributes?.formats?.small?.url ||
                                     post.attributes?.Featured?.data?.attributes?.url ||
                                     'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80';
                    
                    return (
                        <Link 
                            key={post.id || index}
                            to={`/blog/${post.attributes?.slug}`}
                            className="blog-related__item"
                        >
                            <div className="blog-related__image">
                                <img src={imageUrl} alt={post.attributes?.Title} loading="lazy" />
                            </div>
                            <div className="blog-related__content">
                                <h5>{post.attributes?.Title}</h5>
                                {post.attributes?.publishedAt && (
                                    <span>{formatDate(post.attributes.publishedAt)}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
});

RelatedPosts.displayName = 'RelatedPosts';

// Main Blog Post Component
const BlogPostPage = () => {
    const { slug } = useParams();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeHeadingId, setActiveHeadingId] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const contentRef = useRef(null);

    // Scroll to top on mount and slug change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug]);

    // Fetch blog post data
    useEffect(() => {
        const fetchBlogPost = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(
                    `${baseURL}/api/slugify/slugs/blog/${slug}?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                
                const postData = response.data.data;
                setBlogPost(postData);

                // Extract headings for TOC
                if (postData?.attributes?.Content) {
                    const tempHeadings = [];
                    const lines = postData.attributes.Content.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/^(#{1,3})\s+(.*)/);
                        if (match) {
                            const text = match[2].trim();
                            const id = text.toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '');
                            tempHeadings.push({ level: match[1].length, text, id });
                        }
                    });
                    setHeadings(tempHeadings);
                }

                // Fetch related posts
                const relatedResponse = await axios.get(
                    `${baseURL}/api/blogs?populate=*&pagination[limit]=4`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setRelatedPosts(relatedResponse.data.data || []);

            } catch (err) {
                console.error("Error fetching blog post:", err);
                setError("Failed to load article. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlogPost();
        }
    }, [slug]);

    // Intersection Observer for active heading
    useEffect(() => {
        if (loading || !blogPost) return;

        const observerOptions = {
            rootMargin: '-100px 0px -60% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveHeadingId(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        const timer = setTimeout(() => {
            const headingElements = document.querySelectorAll(
                '.blog-content h1[id], .blog-content h2[id], .blog-content h3[id]'
            );
            headingElements.forEach(heading => observer.observe(heading));
        }, 300);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [loading, blogPost]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Memoized markdown components
    const markdownComponents = useMemo(() => ({
        p: ({ node, children }) => {
            const hasOnlyImage = node.children?.length === 1 && 
                (node.children[0].tagName === 'img' || 
                 (node.children[0].type === 'element' && node.children[0].tagName === 'img'));
            
            if (hasOnlyImage) {
                return <>{children}</>;
            }
            
            return <p className="blog-paragraph">{children}</p>;
        },
        h1: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h1 id={id} className="blog-content__heading blog-content__heading--h1">{children}</h1>;
        },
        h2: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h2 id={id} className="blog-content__heading blog-content__heading--h2">{children}</h2>;
        },
        h3: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h3 id={id} className="blog-content__heading blog-content__heading--h3">{children}</h3>;
        },
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            
            if (!inline && language) {
                return (
                    <div className="blog-code-wrapper">
                        <span className="blog-code-lang">{language}</span>
                        <SyntaxHighlighter 
                            style={oneDark} 
                            language={language} 
                            PreTag="div"
                            className="blog-code-block"
                            {...props}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            }
            
            if (!inline) {
                return (
                    <div className="blog-code-wrapper">
                        <SyntaxHighlighter 
                            style={oneDark} 
                            PreTag="div"
                            className="blog-code-block"
                            {...props}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            }
            
            return <code className="blog-inline-code" {...props}>{children}</code>;
        },
        table: ({ children }) => (
            <div className="blog-table-wrapper">
                <table className="blog-table">{children}</table>
            </div>
        ),
        img: ({ src, alt }) => (
            <figure className="blog-figure">
                <img src={src} alt={alt || ''} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
            </figure>
        ),
        blockquote: ({ children }) => (
            <blockquote className="blog-blockquote">
                <div className="blog-blockquote__icon">💡</div>
                <div className="blog-blockquote__content">{children}</div>
            </blockquote>
        ),
        a: ({ href, children }) => {
            const isInternal = href?.startsWith('/') || href?.startsWith('#');
            
            if (isInternal) {
                return (
                    <a href={href} className="blog-link">
                        {children}
                    </a>
                );
            }
            
            return (
                <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="blog-link"
                >
                    {children}
                    <BsArrowUpRight className="blog-link__icon" />
                </a>
            );
        },
        ul: ({ children }) => <ul className="blog-list blog-list--ul">{children}</ul>,
        ol: ({ children }) => <ol className="blog-list blog-list--ol">{children}</ol>,
        li: ({ children }) => <li className="blog-list__item">{children}</li>,
        hr: () => <hr className="blog-divider" />,
    }), []);

    // Loading state
    if (loading) {
        return <BlogSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="blog-post-page blog-post-page--error">
                <div className="blog-error">
                    <div className="blog-error__icon">⚠️</div>
                    <h2 className="blog-error__title">Something went wrong</h2>
                    <p className="blog-error__message">{error}</p>
                    <div className="blog-error__actions">
                        <button 
                            className="blog-btn blog-btn--primary"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                        <Link to="/blog" className="blog-btn blog-btn--outline-dark">
                            Back to Blog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (!blogPost) {
        return (
            <div className="blog-post-page blog-post-page--error">
                <div className="blog-error">
                    <div className="blog-error__icon">🔍</div>
                    <h2 className="blog-error__title">Article Not Found</h2>
                    <p className="blog-error__message">
                        The article you're looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/blog" className="blog-btn blog-btn--primary">
                        Browse All Articles
                    </Link>
                </div>
            </div>
        );
    }

    // Extract blog post data
    const {
        Title, Content, Categories, publishedAt, updated, Teaser, Featured
    } = blogPost.attributes;

    const featuredImage = Featured?.data?.attributes?.formats?.large?.url || 
                          Featured?.data?.attributes?.formats?.medium?.url ||
                          Featured?.data?.attributes?.url;
    
    const categoryList = Categories?.slice(0, 3) || [];
    const readingTime = calculateReadingTime(Content);
    const blogUrl = `https://wanghley.com/blog/${slug}`;

    // Schema.org structured data
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": Title,
        "image": featuredImage,
        "datePublished": publishedAt,
        "dateModified": updated || publishedAt,
        "author": {
            "@type": "Person",
            "name": "Wanghley",
            "url": "https://wanghley.com/about"
        },
        "publisher": {
            "@type": "Person",
            "name": "Wanghley"
        },
        "description": Teaser || Content?.substring(0, 160)
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wanghley.com" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://wanghley.com/blog" },
            { "@type": "ListItem", "position": 3, "name": Title }
        ]
    };

    return (
        <article className="blog-post-page">
            <Helmet>
                <title>{Title} | Wanghley's Blog</title>
                <meta name="description" content={Teaser || Content?.substring(0, 160)} />
                <meta name="keywords" content={categoryList.join(', ')} />
                <link rel="canonical" href={blogUrl} />
                <meta property="og:title" content={Title} />
                <meta property="og:description" content={Teaser || Content?.substring(0, 160)} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={blogUrl} />
                <meta property="og:image" content={featuredImage || 'https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png'} />
                <meta property="article:published_time" content={publishedAt} />
                <meta property="article:modified_time" content={updated || publishedAt} />
                <meta property="article:author" content="Wanghley" />
                <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <ReadingProgress />

            {/* Hero Section */}
            <header className="blog-hero">
                <div className="blog-hero__bg">
                    {featuredImage && (
                        <img 
                            src={featuredImage} 
                            alt="" 
                            className="blog-hero__bg-img" 
                            aria-hidden="true"
                        />
                    )}
                    <div className="blog-hero__overlay" />
                    <div className="blog-hero__pattern" />
                </div>

                <div className="blog-hero__container">
                    {/* Breadcrumb */}
                    <nav className="blog-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/" className="blog-breadcrumb__item">Home</Link>
                        <BsChevronRight className="blog-breadcrumb__sep" />
                        <Link to="/blog" className="blog-breadcrumb__item">Blog</Link>
                        <BsChevronRight className="blog-breadcrumb__sep" />
                        <span className="blog-breadcrumb__item blog-breadcrumb__item--current">{Title}</span>
                    </nav>

                    {/* Meta Tags */}
                    <div className="blog-hero__tags">
                        {categoryList.length > 0 && (
                            <span className="blog-tag blog-tag--category">
                                <FaTag /> {categoryList[0]}
                            </span>
                        )}
                        <span className="blog-tag">
                            <FaCalendarAlt />
                            {publishedAt ? formatDate(publishedAt) : 'N/A'}
                        </span>
                        <span className="blog-tag">
                            <FaClock /> {readingTime} min read
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="blog-hero__title">{Title}</h1>

                    {/* Teaser */}
                    {Teaser && (
                        <p className="blog-hero__teaser">{Teaser}</p>
                    )}

                    {/* Author & Share */}
                    <div className="blog-hero__actions">
                        <div className="blog-hero__author">
                            <div className="blog-hero__author-avatar">
                                <FaUser />
                            </div>
                            <div className="blog-hero__author-info">
                                <span className="blog-hero__author-name">Wanghley</span>
                                <span className="blog-hero__author-role">Engineer & Writer</span>
                            </div>
                        </div>
                        <ShareButton title={Title} url={blogUrl} />
                    </div>
                </div>

                {/* Featured Image */}
                {featuredImage && (
                    <div className="blog-hero__image">
                        <img src={featuredImage} alt={Title} />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <div className="blog-layout">
                {/* Sidebar */}
                <aside className="blog-sidebar">
                    <div className="blog-sidebar__sticky">
                        <TableOfContents headings={headings} activeId={activeHeadingId} />
                        <RelatedPosts posts={relatedPosts} currentSlug={slug} />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="blog-main" ref={contentRef}>
                    {/* Content Card */}
                    <div className="blog-content-card">
                        {Content && (
                            <div className="blog-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                                    components={markdownComponents}
                                >
                                    {Content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Tags Section */}
                    {categoryList.length > 0 && (
                        <div className="blog-tags-section">
                            <h4>Topics</h4>
                            <div className="blog-tags-list">
                                {categoryList.map((cat, index) => (
                                    <span key={index} className="blog-tag-pill">{cat}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Navigation */}
                    <div className="blog-footer">
                        <Link to="/blog" className="blog-footer__back">
                            <FaArrowLeft />
                            <span>Back to All Articles</span>
                        </Link>
                    </div>
                </main>
            </div>

            {/* Mobile TOC Toggle */}
            {headings.length > 0 && (
                <button 
                    className="blog-mobile-toggle"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open table of contents"
                >
                    <FaBookOpen />
                    <span>Contents</span>
                </button>
            )}

            {/* Mobile TOC Drawer */}
            <MobileTOC 
                headings={headings} 
                isOpen={mobileMenuOpen} 
                onClose={() => setMobileMenuOpen(false)} 
            />

            <BackToTop />
        </article>
    );
};

export default BlogPostPage;
