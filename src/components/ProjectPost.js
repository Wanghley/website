import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/ProjectPost.css';
import { formatDate } from '../utils/formatDate';
import { FaTag, FaGithub, FaExternalLinkAlt, FaCalendarAlt, FaArrowLeft, FaChevronUp, FaShareAlt, FaLink } from "react-icons/fa";
import { HiSparkles } from 'react-icons/hi';
import { BsArrowUpRight } from 'react-icons/bs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Helmet } from 'react-helmet';
import MediaGallery from './ProjectMediaGallery';

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

// Back to Top Button
const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setVisible(window.pageYOffset > 500);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button 
            className={`project-back-to-top ${visible ? 'visible' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
        >
            <FaChevronUp />
        </button>
    );
};

// Progress Bar Component
const ReadingProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            setProgress(scrollPercent);
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="reading-progress">
            <div className="reading-progress__bar" style={{ width: `${progress}%` }} />
        </div>
    );
};

// Table of Contents Component
const TableOfContents = ({ headings, activeId }) => {
    if (!headings || headings.length === 0) return null;

    return (
        <nav className="project-toc">
            <div className="project-toc__header">
                <span className="project-toc__icon">📑</span>
                <h3 className="project-toc__title">Contents</h3>
            </div>
            <ul className="project-toc__list">
                {headings.map((heading, index) => (
                    <li 
                        key={index} 
                        className={`project-toc__item project-toc__item--level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
                    >
                        <a href={`#${heading.id}`}>
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

// Share Button Component
const ShareButton = ({ title, url }) => {
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
        <button className="project-share-btn" onClick={handleShare}>
            {copied ? <FaLink /> : <FaShareAlt />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
    );
};

const ProjectPage = () => {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeHeadingId, setActiveHeadingId] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch project data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/api/slugify/slugs/project/${slug}?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setProject(response.data.data);

                // Extract headings for TOC
                if (response.data.data.attributes.Description) {
                    const tempHeadings = [];
                    const lines = response.data.data.attributes.Description.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/^(#{1,3})\s+(.*)/);
                        if (match) {
                            const text = match[2].trim();
                            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            tempHeadings.push({ 
                                level: match[1].length, 
                                text,
                                id
                            });
                        }
                    });
                    setHeadings(tempHeadings);
                }
            } catch (err) {
                console.error("Error fetching project data:", err);
                setError("Failed to load project.");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

    // Intersection Observer for active heading
    useEffect(() => {
        if (loading || !project) return;

        const observerOptions = {
            rootMargin: '-80px 0px -70% 0px',
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

        setTimeout(() => {
            const headingElements = document.querySelectorAll('.project-content h1[id], .project-content h2[id], .project-content h3[id]');
            headingElements.forEach(heading => observer.observe(heading));
        }, 100);

        return () => observer.disconnect();
    }, [loading, project]);

    // Loading state
    if (loading) {
        return (
            <div className="project-page project-page--loading">
                <div className="project-skeleton">
                    <div className="project-skeleton__hero shimmer"></div>
                    <div className="project-skeleton__content">
                        <div className="project-skeleton__sidebar">
                            <div className="project-skeleton__toc shimmer"></div>
                        </div>
                        <div className="project-skeleton__main">
                            <div className="project-skeleton__line project-skeleton__line--xl shimmer"></div>
                            <div className="project-skeleton__line project-skeleton__line--lg shimmer"></div>
                            <div className="project-skeleton__line shimmer"></div>
                            <div className="project-skeleton__line shimmer"></div>
                            <div className="project-skeleton__line project-skeleton__line--md shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div className="project-error">{error}</div>;
    if (!project) return <div className="project-error">Project not found.</div>;

    const {
        Title, Github, Description, Category, Demo,
        End, Start, Teaser, video, Featured, Media
    } = project.attributes;

    const featuredImage = Featured?.data?.attributes?.formats?.large?.url || 
                          Featured?.data?.attributes?.url;
    
    const media = Media?.data?.map(item => {
        return item.attributes.formats?.large?.url || 
               item.attributes.formats?.medium?.url || 
               item.attributes.formats?.small?.url || 
               item.attributes.url;
    }).filter(Boolean) || [];

    const readingTime = calculateReadingTime(Description);
    const projectUrl = `https://wanghley.com/projects/${slug}`;

    // Markdown components
    const markdownComponents = {
        h1: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h1 id={id} className="project-content__heading">{children}</h1>;
        },
        h2: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h2 id={id} className="project-content__heading">{children}</h2>;
        },
        h3: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h3 id={id} className="project-content__heading">{children}</h3>;
        },
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
                <SyntaxHighlighter 
                    style={oneDark} 
                    language={match ? match[1] : ''} 
                    PreTag="div"
                    className="project-code-block"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className="project-inline-code" {...props}>{children}</code>
            );
        },
        table: ({ children }) => (
            <div className="project-table-wrapper">
                <table className="project-table">{children}</table>
            </div>
        ),
        img: ({ src, alt }) => (
            <figure className="project-figure">
                <img src={src} alt={alt} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
            </figure>
        ),
        blockquote: ({ children }) => (
            <blockquote className="project-blockquote">{children}</blockquote>
        ),
        a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="project-link">
                {children}
                <BsArrowUpRight className="project-link__icon" />
            </a>
        ),
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
            "name": "Projects",
            "item": "https://wanghley.com/projects"
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": Title
        }]
    };

    return (
        <article className="project-page">
            <Helmet>
                <title>{Title} | Wanghley</title>
                <meta name="description" content={Teaser || Description?.substring(0, 160)} />
                <meta name="keywords" content={Category} />
                <link rel="canonical" href={projectUrl} />
                <meta property="og:title" content={Title} />
                <meta property="og:description" content={Teaser || Description?.substring(0, 160)} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={projectUrl} />
                <meta property="og:image" content={featuredImage || 'https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png'} />
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <ReadingProgress />

            {/* Hero Section */}
            <header className="project-hero">
                <div className="project-hero__background">
                    {featuredImage && (
                        <img 
                            src={featuredImage} 
                            alt="" 
                            className="project-hero__bg-image" 
                            aria-hidden="true"
                        />
                    )}
                    <div className="project-hero__overlay"></div>
                </div>

                <div className="project-hero__container">
                    {/* Breadcrumb */}
                    <nav className="project-breadcrumb">
                        <Link to="/projects" className="project-breadcrumb__link">
                            <FaArrowLeft />
                            <span>All Projects</span>
                        </Link>
                    </nav>

                    {/* Meta Info */}
                    <div className="project-hero__meta">
                        {Category && (
                            <span className="project-hero__category">
                                <FaTag /> {Category}
                            </span>
                        )}
                        <span className="project-hero__date">
                            <FaCalendarAlt />
                            {Start ? formatDate(Start) : 'N/A'}
                            {End && ` — ${formatDate(End)}`}
                        </span>
                        <span className="project-hero__reading-time">
                            📖 {readingTime} min read
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="project-hero__title">{Title}</h1>

                    {/* Teaser */}
                    {Teaser && (
                        <p className="project-hero__teaser">{Teaser}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="project-hero__actions">
                        {Github && (
                            <a 
                                href={Github} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="project-btn project-btn--github"
                            >
                                <FaGithub />
                                <span>View Code</span>
                            </a>
                        )}
                        {Demo && (
                            <a 
                                href={Demo.includes('http') ? Demo : `https://${Demo}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="project-btn project-btn--demo"
                            >
                                <FaExternalLinkAlt />
                                <span>Live Demo</span>
                            </a>
                        )}
                        <ShareButton title={Title} url={projectUrl} />
                    </div>
                </div>

                {/* Featured Image */}
                {featuredImage && (
                    <div className="project-hero__image-container">
                        <img 
                            src={featuredImage} 
                            alt={Title} 
                            className="project-hero__image"
                        />
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <div className="project-layout">
                {/* Mobile TOC Toggle */}
                <button 
                    className="project-mobile-toc-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    📑 Contents
                </button>

                {/* Mobile TOC */}
                <div className={`project-mobile-toc ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="project-mobile-toc__header">
                        <span>Contents</span>
                        <button onClick={() => setMobileMenuOpen(false)}>✕</button>
                    </div>
                    <ul className="project-mobile-toc__list">
                        {headings.map((heading, index) => (
                            <li key={index} className={`level-${heading.level}`}>
                                <a 
                                    href={`#${heading.id}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sidebar */}
                <aside className="project-sidebar">
                    <div className="project-sidebar__sticky">
                        <TableOfContents headings={headings} activeId={activeHeadingId} />
                        
                        {/* Quick Links */}
                        <div className="project-quick-links">
                            <h4>Quick Links</h4>
                            <div className="project-quick-links__buttons">
                                {Github && (
                                    <a href={Github} target="_blank" rel="noopener noreferrer">
                                        <FaGithub /> GitHub
                                    </a>
                                )}
                                {Demo && (
                                    <a href={Demo.includes('http') ? Demo : `https://${Demo}`} target="_blank" rel="noopener noreferrer">
                                        <FaExternalLinkAlt /> Demo
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="project-main">
                    {/* Content */}
                    {Description && (
                        <div className="project-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={markdownComponents}
                            >
                                {Description}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Video Section */}
                    {video?.url && (
                        <section className="project-video">
                            <h2 className="project-section-title">
                                <HiSparkles /> Project Demo
                            </h2>
                            <div className="project-video__wrapper">
                                <video controls>
                                    <source src={video.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </section>
                    )}

                    {/* Media Gallery */}
                    {media && media.length > 0 && (
                        <section className="project-gallery" id="gallery">
                            <h2 className="project-section-title">
                                <HiSparkles /> Project Gallery
                            </h2>
                            <MediaGallery media={media} />
                        </section>
                    )}

                    {/* Back to Projects */}
                    <div className="project-footer">
                        <Link to="/projects" className="project-footer__back">
                            <FaArrowLeft />
                            <span>Back to All Projects</span>
                        </Link>
                    </div>
                </main>
            </div>

            <BackToTop />
        </article>
    );
};

export default ProjectPage;