import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/ProjectPost.css';
import { formatDate } from '../utils/formatDate';
import { 
    FaTag, FaGithub, FaExternalLinkAlt, FaCalendarAlt, 
    FaArrowLeft, FaChevronUp, FaShareAlt, FaLink, FaClock,
    FaPlay, FaImages, FaBookOpen
} from "react-icons/fa";
import { HiSparkles, HiOutlineBookOpen } from 'react-icons/hi';
import { BsArrowUpRight, BsChevronRight } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
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

// Back to Top Button Component
const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setVisible(window.pageYOffset > 500);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button 
            className={`proj-back-to-top ${visible ? 'proj-back-to-top--visible' : ''}`}
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
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.min(scrollPercent, 100));
        };

        window.addEventListener('scroll', updateProgress);
        updateProgress();
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="proj-progress">
            <div className="proj-progress__bar" style={{ width: `${progress}%` }} />
        </div>
    );
};

// Table of Contents Component
const TableOfContents = ({ headings, activeId }) => {
    if (!headings || headings.length === 0) return null;

    return (
        <nav className="proj-toc" aria-label="Table of contents">
            <div className="proj-toc__header">
                <HiOutlineBookOpen className="proj-toc__icon" />
                <h3 className="proj-toc__title">On This Page</h3>
            </div>
            <ul className="proj-toc__list">
                {headings.map((heading, index) => (
                    <li 
                        key={index} 
                        className={`proj-toc__item proj-toc__item--level-${heading.level} ${activeId === heading.id ? 'proj-toc__item--active' : ''}`}
                    >
                        <a href={`#${heading.id}`}>
                            <span className="proj-toc__marker"></span>
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
        <button className="proj-btn proj-btn--outline" onClick={handleShare}>
            {copied ? <FaLink /> : <FaShareAlt />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
    );
};

// Loading Skeleton Component
const ProjectSkeleton = () => (
    <div className="proj-page proj-page--loading">
        <div className="proj-skeleton">
            <div className="proj-skeleton__hero">
                <div className="proj-skeleton__hero-content">
                    <div className="proj-skeleton__breadcrumb shimmer"></div>
                    <div className="proj-skeleton__meta shimmer"></div>
                    <div className="proj-skeleton__title shimmer"></div>
                    <div className="proj-skeleton__teaser shimmer"></div>
                    <div className="proj-skeleton__actions">
                        <div className="proj-skeleton__btn shimmer"></div>
                        <div className="proj-skeleton__btn shimmer"></div>
                    </div>
                </div>
            </div>
            <div className="proj-skeleton__body">
                <div className="proj-skeleton__sidebar">
                    <div className="proj-skeleton__toc shimmer"></div>
                </div>
                <div className="proj-skeleton__main">
                    <div className="proj-skeleton__line proj-skeleton__line--full shimmer"></div>
                    <div className="proj-skeleton__line proj-skeleton__line--lg shimmer"></div>
                    <div className="proj-skeleton__line proj-skeleton__line--md shimmer"></div>
                    <div className="proj-skeleton__line proj-skeleton__line--full shimmer"></div>
                    <div className="proj-skeleton__line proj-skeleton__line--sm shimmer"></div>
                </div>
            </div>
        </div>
    </div>
);

// Mobile TOC Component
const MobileTOC = ({ headings, isOpen, onClose }) => {
    if (!headings || headings.length === 0) return null;

    return (
        <>
            <div 
                className={`proj-mobile-toc__backdrop ${isOpen ? 'proj-mobile-toc__backdrop--visible' : ''}`}
                onClick={onClose}
            />
            <div className={`proj-mobile-toc ${isOpen ? 'proj-mobile-toc--open' : ''}`}>
                <div className="proj-mobile-toc__header">
                    <h3>Contents</h3>
                    <button onClick={onClose} aria-label="Close menu">
                        <IoClose />
                    </button>
                </div>
                <ul className="proj-mobile-toc__list">
                    {headings.map((heading, index) => (
                        <li key={index} className={`proj-mobile-toc__item level-${heading.level}`}>
                            <a href={`#${heading.id}`} onClick={onClose}>
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

// Quick Navigation Component
const QuickNav = ({ hasGithub, hasDemo, hasVideo, hasGallery, github, demo }) => {
    const items = [];
    
    if (hasGithub) items.push({ icon: FaGithub, label: 'Source Code', href: github, external: true });
    if (hasDemo) items.push({ icon: FaExternalLinkAlt, label: 'Live Demo', href: demo, external: true });
    if (hasVideo) items.push({ icon: FaPlay, label: 'Watch Demo', href: '#video', external: false });
    if (hasGallery) items.push({ icon: FaImages, label: 'Gallery', href: '#gallery', external: false });

    if (items.length === 0) return null;

    return (
        <div className="proj-quick-nav">
            <h4 className="proj-quick-nav__title">Quick Links</h4>
            <div className="proj-quick-nav__grid">
                {items.map((item, index) => (
                    <a 
                        key={index}
                        href={item.external ? (item.href?.includes('http') ? item.href : `https://${item.href}`) : item.href}
                        target={item.external ? '_blank' : '_self'}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className="proj-quick-nav__item"
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

// Main Project Page Component
const ProjectPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeHeadingId, setActiveHeadingId] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const contentRef = useRef(null);

    // Scroll to top on mount and slug change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug]);

    // Fetch project data
    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(
                    `${baseURL}/api/slugify/slugs/project/${slug}?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                
                const projectData = response.data.data;
                setProject(projectData);

                // Extract headings for TOC
                if (projectData?.attributes?.Description) {
                    const tempHeadings = [];
                    const lines = projectData.attributes.Description.split('\n');
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
            } catch (err) {
                console.error("Error fetching project data:", err);
                setError("Failed to load project. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProject();
        }
    }, [slug]);

    // Intersection Observer for active heading
    useEffect(() => {
        if (loading || !project) return;

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
                '.proj-content h1[id], .proj-content h2[id], .proj-content h3[id]'
            );
            headingElements.forEach(heading => observer.observe(heading));
        }, 200);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [loading, project]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Loading state
    if (loading) {
        return <ProjectSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="proj-page proj-page--error">
                <div className="proj-error">
                    <div className="proj-error__icon">⚠️</div>
                    <h2 className="proj-error__title">Something went wrong</h2>
                    <p className="proj-error__message">{error}</p>
                    <div className="proj-error__actions">
                        <button 
                            className="proj-btn proj-btn--primary"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                        <Link to="/projects" className="proj-btn proj-btn--outline">
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (!project) {
        return (
            <div className="proj-page proj-page--error">
                <div className="proj-error">
                    <div className="proj-error__icon">🔍</div>
                    <h2 className="proj-error__title">Project Not Found</h2>
                    <p className="proj-error__message">
                        The project you're looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/projects" className="proj-btn proj-btn--primary">
                        Browse All Projects
                    </Link>
                </div>
            </div>
        );
    }

    // Extract project data
    const {
        Title, Github, Description, Category, Demo,
        End, Start, Teaser, video, Featured, Media
    } = project.attributes;

    const featuredImage = Featured?.data?.attributes?.formats?.large?.url || 
                          Featured?.data?.attributes?.formats?.medium?.url ||
                          Featured?.data?.attributes?.url;
    
    const media = Media?.data?.map(item => {
        return item.attributes.formats?.large?.url || 
               item.attributes.formats?.medium?.url || 
               item.attributes.formats?.small?.url || 
               item.attributes.url;
    }).filter(Boolean) || [];

    const readingTime = calculateReadingTime(Description);
    const projectUrl = `https://wanghley.com/projects/${slug}`;
    const hasVideo = video?.url;
    const hasGallery = media && media.length > 0;

    // Markdown components
    const markdownComponents = {
        h1: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h1 id={id} className="proj-content__heading proj-content__heading--h1">{children}</h1>;
        },
        h2: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h2 id={id} className="proj-content__heading proj-content__heading--h2">{children}</h2>;
        },
        h3: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h3 id={id} className="proj-content__heading proj-content__heading--h3">{children}</h3>;
        },
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
                <div className="proj-code-wrapper">
                    {match && <span className="proj-code-lang">{match[1]}</span>}
                    <SyntaxHighlighter 
                        style={oneDark} 
                        language={match ? match[1] : ''} 
                        PreTag="div"
                        className="proj-code-block"
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className="proj-inline-code" {...props}>{children}</code>
            );
        },
        table: ({ children }) => (
            <div className="proj-table-wrapper">
                <table className="proj-table">{children}</table>
            </div>
        ),
        img: ({ src, alt }) => (
            <figure className="proj-figure">
                <img src={src} alt={alt} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
            </figure>
        ),
        blockquote: ({ children }) => (
            <blockquote className="proj-blockquote">
                <div className="proj-blockquote__icon">💡</div>
                <div className="proj-blockquote__content">{children}</div>
            </blockquote>
        ),
        a: ({ href, children }) => (
            <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="proj-link"
            >
                {children}
                <BsArrowUpRight className="proj-link__icon" />
            </a>
        ),
        ul: ({ children }) => <ul className="proj-list proj-list--ul">{children}</ul>,
        ol: ({ children }) => <ol className="proj-list proj-list--ol">{children}</ol>,
        li: ({ children }) => <li className="proj-list__item">{children}</li>,
        p: ({ children }) => <p className="proj-paragraph">{children}</p>,
        hr: () => <hr className="proj-divider" />,
    };

    // Schema.org breadcrumb
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wanghley.com" },
            { "@type": "ListItem", "position": 2, "name": "Projects", "item": "https://wanghley.com/projects" },
            { "@type": "ListItem", "position": 3, "name": Title }
        ]
    };

    return (
        <article className="proj-page">
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
            <header className="proj-hero">
                <div className="proj-hero__bg">
                    {featuredImage && (
                        <img 
                            src={featuredImage} 
                            alt="" 
                            className="proj-hero__bg-img" 
                            aria-hidden="true"
                        />
                    )}
                    <div className="proj-hero__overlay" />
                    <div className="proj-hero__pattern" />
                </div>

                <div className="proj-hero__container">
                    {/* Breadcrumb */}
                    <nav className="proj-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/" className="proj-breadcrumb__item">Home</Link>
                        <BsChevronRight className="proj-breadcrumb__sep" />
                        <Link to="/projects" className="proj-breadcrumb__item">Projects</Link>
                        <BsChevronRight className="proj-breadcrumb__sep" />
                        <span className="proj-breadcrumb__item proj-breadcrumb__item--current">{Title}</span>
                    </nav>

                    {/* Meta Tags */}
                    <div className="proj-hero__tags">
                        {Category && (
                            <span className="proj-tag proj-tag--category">
                                <FaTag /> {Category}
                            </span>
                        )}
                        <span className="proj-tag">
                            <FaCalendarAlt />
                            {Start ? formatDate(Start) : 'N/A'}
                            {End && ` — ${formatDate(End)}`}
                        </span>
                        <span className="proj-tag">
                            <FaClock /> {readingTime} min read
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="proj-hero__title">{Title}</h1>

                    {/* Teaser */}
                    {Teaser && (
                        <p className="proj-hero__teaser">{Teaser}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="proj-hero__actions">
                        {Github && (
                            <a 
                                href={Github} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="proj-btn proj-btn--white"
                            >
                                <FaGithub />
                                <span>View Source</span>
                            </a>
                        )}
                        {Demo && (
                            <a 
                                href={Demo.includes('http') ? Demo : `https://${Demo}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="proj-btn proj-btn--primary"
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
                    <div className="proj-hero__image">
                        <img src={featuredImage} alt={Title} />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <div className="proj-layout">
                {/* Sidebar */}
                <aside className="proj-sidebar">
                    <div className="proj-sidebar__sticky">
                        <TableOfContents headings={headings} activeId={activeHeadingId} />
                        <QuickNav 
                            hasGithub={!!Github}
                            hasDemo={!!Demo}
                            hasVideo={hasVideo}
                            hasGallery={hasGallery}
                            github={Github}
                            demo={Demo}
                        />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="proj-main" ref={contentRef}>
                    {/* Content Card */}
                    <div className="proj-content-card">
                        {Description && (
                            <div className="proj-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                >
                                    {Description}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Video Section */}
                    {hasVideo && (
                        <section className="proj-section" id="video">
                            <div className="proj-section__header">
                                <HiSparkles className="proj-section__icon" />
                                <h2 className="proj-section__title">Project Demo</h2>
                            </div>
                            <div className="proj-video">
                                <video controls poster={featuredImage}>
                                    <source src={video.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </section>
                    )}

                    {/* Gallery Section */}
                    {hasGallery && (
                        <section className="proj-section" id="gallery">
                            <div className="proj-section__header">
                                <FaImages className="proj-section__icon" />
                                <h2 className="proj-section__title">Project Gallery</h2>
                            </div>
                            <MediaGallery media={media} />
                        </section>
                    )}

                    {/* Footer Navigation */}
                    <div className="proj-footer">
                        <Link to="/projects" className="proj-footer__back">
                            <FaArrowLeft />
                            <span>Back to All Projects</span>
                        </Link>
                    </div>
                </main>
            </div>

            {/* Mobile TOC Toggle */}
            {headings.length > 0 && (
                <button 
                    className="proj-mobile-toggle"
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

export default ProjectPage;