import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePostHog } from '../lib/analytics';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/ProjectPost.css';
import { formatMonth } from '../utils/formatDate';
import { FaGithub, FaLink, FaShareAlt, FaPlay } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Helmet } from "react-helmet-async";
import MediaGallery from './ProjectMediaGallery';
import mermaid from 'mermaid';
import benchPrism from '../lib/benchPrism';
import { PageHeader, Prose } from './bench';

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

// Initialize Mermaid once, outside the component. Diagrams are drawn in the
// Bench light palette because they sit on the paper band.
let mermaidInitialized = false;
const initializeMermaid = () => {
    if (mermaidInitialized) return;

    mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif',
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
        themeVariables: {
            primaryColor: '#E7E3DB',
            primaryTextColor: '#121314',
            primaryBorderColor: '#8F4F1C',
            lineColor: '#44423D',
            secondaryColor: '#F2EFE9',
            tertiaryColor: '#E7E3DB',
            background: '#F2EFE9',
            mainBkg: '#E7E3DB',
            nodeBorder: '#625F59',
            clusterBkg: '#F2EFE9',
            clusterBorder: '#625F59',
            titleColor: '#121314',
            edgeLabelBackground: '#F2EFE9',
        },
    });
    mermaidInitialized = true;
};

// Mermaid Diagram Component - Optimized
const MermaidDiagram = React.memo(({ code }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!code) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const renderDiagram = async () => {
            try {
                initializeMermaid();

                // Clear any previous diagram with the same ID
                const existingElement = document.getElementById(idRef.current);
                if (existingElement) {
                    existingElement.remove();
                }

                const { svg: renderedSvg } = await mermaid.render(idRef.current, code.trim());

                if (isMounted) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                if (isMounted) {
                    setError(err.message || 'Failed to render diagram');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Small delay to prevent blocking
        const timeoutId = setTimeout(renderDiagram, 50);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [code]);

    if (isLoading) {
        return <div className="proj-mermaid proj-mermaid--note" role="status">Rendering diagram.</div>;
    }

    if (error) {
        return (
            <div className="proj-mermaid proj-mermaid--note">
                <p>This diagram did not render.</p>
                <details>
                    <summary>Show the error</summary>
                    <pre>{error}</pre>
                </details>
            </div>
        );
    }

    if (!svg) {
        return null;
    }

    // Mermaid sets aria-roledescription but no role, which assistive tech rejects
    const labelled = svg.replace('<svg', '<svg role="img" aria-label="Diagram"');
    return <div className="proj-mermaid" dangerouslySetInnerHTML={{ __html: labelled }} />;
});

MermaidDiagram.displayName = 'MermaidDiagram';

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

const slugify = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
// Plain text of rendered markdown children, so a heading with emphasis or inline
// code still gets the same anchor the table of contents links to.
const textOf = (node) => React.Children.toArray(node)
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : textOf(c?.props?.children)))
    .join('');
const withProtocol = (url) => (url.includes('http') ? url : `https://${url}`);

// The best CMS rendition of an image, with its size so the page does not jump
// when it loads.
const pickImage = (attrs, order = ['large', 'medium', 'small']) => {
    for (const key of order) {
        const f = attrs?.formats?.[key];
        if (f?.url) return { url: f.url, width: f.width, height: f.height };
    }
    return attrs?.url ? { url: attrs.url, width: attrs.width, height: attrs.height } : null;
};

// Table of contents: a sticky rail on wide screens, a <details> on narrow ones.
const TableOfContents = React.memo(({ headings, activeId, slug, inline = false }) => {
    const posthog = usePostHog();
    if (!headings || headings.length === 0) return null;

    const list = (
        <ul className="proj-toc__list">
            {headings.map((heading, index) => (
                <li key={`${heading.id}-${index}`} className={`proj-toc__item proj-toc__item--${heading.level}`}>
                    <a
                        href={`#${heading.id}`}
                        aria-current={activeId === heading.id ? 'true' : undefined}
                        onClick={() => posthog?.capture('project_toc_clicked', { slug, heading: heading.text, level: heading.level })}
                    >
                        {heading.text}
                    </a>
                </li>
            ))}
        </ul>
    );

    return inline ? (
        <details className="proj-toc proj-toc--inline">
            <summary>On this page</summary>
            {list}
        </details>
    ) : (
        <nav className="proj-toc proj-toc--rail" aria-label="On this page">
            <p className="proj-toc__title">On this page</p>
            {list}
        </nav>
    );
});

TableOfContents.displayName = 'TableOfContents';

// Share Button Component
const ShareButton = React.memo(({ title, url }) => {
    const [copied, setCopied] = useState(false);
    const posthog = usePostHog();

    const handleShare = async () => {
        posthog?.capture('project_shared', { title, url });
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
        <button type="button" className="btn btn--ghost" onClick={handleShare}>
            {copied ? <FaLink aria-hidden="true" /> : <FaShareAlt aria-hidden="true" />}
            <span role="status">{copied ? 'Link copied' : 'Share'}</span>
        </button>
    );
});

ShareButton.displayName = 'ShareButton';

// Loading: the same two bands with plain blocks where the text will be
const ProjectSkeleton = () => (
    <main id="main" className="proj-page" aria-busy="true">
        <section className="bp-sec bp-sec--head">
            <div className="bench-col">
                <div className="bp-rule" aria-hidden="true" />
                <div className="proj-skeleton proj-skeleton--title" />
                <div className="proj-skeleton proj-skeleton--lede" />
            </div>
        </section>
        <section className="bp-sec bp-sec--light">
            <div className="bench-col">
                <div className="proj-skeleton proj-skeleton--block" />
                <div className="proj-skeleton proj-skeleton--line" />
                <div className="proj-skeleton proj-skeleton--line proj-skeleton--short" />
            </div>
        </section>
        <p className="sr-only" role="status">Loading the project.</p>
    </main>
);

// Main Project Page Component
const ProjectPage = () => {
    const { slug } = useParams();
    const posthog = usePostHog();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeHeadingId, setActiveHeadingId] = useState('');
    const readCompletionTracked = useRef(false);

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
                posthog?.capture('project_viewed', {
                    slug,
                    title: projectData?.attributes?.Title,
                    category: projectData?.attributes?.Category,
                });

                // Extract headings for TOC
                if (projectData?.attributes?.Description) {
                    const tempHeadings = [];
                    const lines = projectData.attributes.Description.split('\n');
                    lines.forEach(line => {
                        const match = line.match(/^(#{1,3})\s+(.*)/);
                        if (match) {
                            const text = match[2].trim();
                            tempHeadings.push({ level: match[1].length, text, id: slugify(text) });
                        }
                    });
                    setHeadings(tempHeadings);
                }
            } catch (err) {
                console.error("Error fetching project data:", err);
                setError("The data service did not answer. Check your connection and try again.");
                posthog?.captureException(err, { slug });
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProject();
        }
    }, [slug, posthog]);

    // Intersection Observer for the active heading
    useEffect(() => {
        if (loading || !project) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveHeadingId(entry.target.id);
                });
            },
            { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
        );

        const timer = setTimeout(() => {
            document.querySelectorAll('.proj-content :is(h2, h3, h4)[id]').forEach((heading) => observer.observe(heading));
        }, 300);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [loading, project]);

    // Reading completion tracking (fires once at 90% scroll depth)
    useEffect(() => {
        if (!project) return;
        readCompletionTracked.current = false;
        const handleScroll = () => {
            if (readCompletionTracked.current) return;
            const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrolled >= 0.9) {
                readCompletionTracked.current = true;
                posthog?.capture('project_read_completed', {
                    slug,
                    title: project?.attributes?.Title,
                    category: project?.attributes?.Category,
                    reading_time_min: calculateReadingTime(project?.attributes?.Description),
                });
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [project, posthog, slug]);

    // The page has one h1 (the title). Write-ups often start at `#`, so every
    // heading moves down until the shallowest one is an h2.
    const baseLevel = headings.length ? Math.min(...headings.map((h) => h.level)) : 2;
    const markdownComponents = useMemo(() => {
        const heading = (level) => ({ children }) => {
            const Tag = `h${Math.min(6, Math.max(2, level + 2 - baseLevel))}`;
            return <Tag id={slugify(textOf(children))}>{children}</Tag>;
        };
        return {
            h1: heading(1), h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6),
            // A paragraph holding only an image is a figure. Anything else keeps the
            // image inline, so a figure is never nested inside a <p>.
            p: ({ node, children }) => {
                const only = node.children?.length === 1 && node.children[0].tagName === 'img';
                if (only) {
                    const alt = node.children[0].properties?.alt;
                    return <figure className="proj-figure">{children}{alt && <figcaption>{alt}</figcaption>}</figure>;
                }
                return <p>{children}</p>;
            },
            img: ({ src, alt }) => <img src={src} alt={alt || ''} loading="lazy" />,
            // A wide table scrolls sideways on a phone, so its wrapper takes focus for keyboard users.
            table: ({ children }) => (
                <div className="bp-scroll" tabIndex={0} role="group" aria-label="Table">
                    <table>{children}</table>
                </div>
            ),
            // A task-list checkbox has no label of its own; the state is read out as text.
            input: ({ type, checked }) => (type === 'checkbox' ? (
                <>
                    <span className="sr-only">{checked ? 'Done: ' : 'To do: '}</span>
                    <input type="checkbox" checked={!!checked} readOnly disabled aria-hidden="true" tabIndex={-1} />
                </>
            ) : null),
            // react-markdown 9 has no `inline` flag: a fenced block arrives as <pre><code>.
            // `pre` steps aside so a block brings its own wrapper; inline code stays inline.
            pre: ({ children }) => <>{children}</>,
            code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');

                if (!language && !codeString.includes('\n')) {
                    return <code className="proj-inline-code" {...props}>{children}</code>;
                }
                if (language === 'mermaid' || language === 'mmd') {
                    return <MermaidDiagram code={codeString} />;
                }
                return (
                    <div className="proj-code-wrapper">
                        {language && <span className="proj-code-lang">{language}</span>}
                        <SyntaxHighlighter
                            style={benchPrism}
                            language={language || undefined}
                            PreTag="div"
                            className="proj-code-block"
                            tabIndex={0}
                            role="group"
                            aria-label={`${language || 'Code'} block`}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            },
            a: ({ href, children }) => {
                if (href?.startsWith('#')) return <a href={href}>{children}</a>;
                if (href?.startsWith('/')) return <Link to={href}>{children}</Link>;
                return <a href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>;
            },
        };
    }, [baseLevel]);

    if (loading) {
        return <ProjectSkeleton />;
    }

    if (error) {
        return (
            <main id="main" className="proj-page">
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="U2" title="The project did not load" size="md" lede={error} />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col proj-state">
                        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
                        <Link to="/projects" className="bp-link">All projects →</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (!project) {
        return (
            <main id="main" className="proj-page">
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="U2" title="No project here" size="md" lede="That project does not exist, or it has moved." />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col proj-state">
                        <Link to="/projects" className="btn btn--primary">Browse all projects</Link>
                    </div>
                </section>
            </main>
        );
    }

    // Extract project data
    const {
        Title, Github, Description, Category, Demo,
        End, Start, Teaser, video, Featured, Media
    } = project.attributes;

    const cover = pickImage(Featured?.data?.attributes);
    const media = Media?.data?.map((item) => pickImage(item.attributes)?.url).filter(Boolean) || [];

    const readingTime = calculateReadingTime(Description);
    const projectUrl = `https://wanghley.com/projects/${slug}`;
    const hasVideo = !!video?.url;
    const hasGallery = media.length > 0;
    const dates = Start ? [formatMonth(Start), End ? formatMonth(End) : 'Present'].join(' – ') : null;

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
        <main id="main" className="proj-page">
            <Helmet>
                <title>{Title} | Wanghley Martins</title>
                <meta name="description" content={Teaser || Description?.substring(0, 160)} />
                <link rel="canonical" href={projectUrl} />
                <meta property="og:title" content={Title} />
                <meta property="og:description" content={Teaser || Description?.substring(0, 160)} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={projectUrl} />
                <meta property="og:image" content={cover?.url || 'https://wanghley.com/og-image.png'} />
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <section className="bp-sec bp-sec--head">
                <div className="bench-col">
                    <nav className="proj-crumbs" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <span aria-hidden="true">/</span>
                        <Link to="/projects">Projects</Link>
                    </nav>
                    <PageHeader
                        size="md"
                        refdes="U2"
                        title={Title}
                        lede={Teaser}
                        meta={[Category, dates, readingTime ? `${readingTime} min read` : null].filter(Boolean)}
                    >
                        <div className="proj-actions">
                            {Demo && (
                                <a
                                    className="btn btn--primary"
                                    href={withProtocol(Demo)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => posthog?.capture('project_demo_clicked', { slug, title: Title })}
                                >
                                    Live demo <span aria-hidden="true">↗</span>
                                </a>
                            )}
                            {Github && (
                                <a
                                    className="btn btn--ghost"
                                    href={Github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => posthog?.capture('project_github_clicked', { slug, title: Title })}
                                >
                                    <FaGithub aria-hidden="true" /> Source <span aria-hidden="true">↗</span>
                                </a>
                            )}
                            {hasVideo && (
                                <a className="btn btn--ghost" href="#video"><FaPlay aria-hidden="true" /> Demo video</a>
                            )}
                            <ShareButton title={Title} url={projectUrl} />
                        </div>
                    </PageHeader>
                </div>
            </section>

            <section className="bp-sec bp-sec--light proj-body">
                <div className="bench-col">
                    {cover && (
                        <figure className="proj-cover">
                            <img src={cover.url} alt={Title} width={cover.width} height={cover.height} />
                        </figure>
                    )}

                    <div className="proj-layout">
                        <aside className="proj-aside">
                            <TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} />
                        </aside>

                        <article className="proj-article">
                            <TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} inline />

                            {Description && (
                                <Prose className="proj-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={markdownComponents}
                                    >
                                        {Description}
                                    </ReactMarkdown>
                                </Prose>
                            )}

                            {hasVideo && (
                                <section className="proj-section" id="video" aria-labelledby="proj-video-title">
                                    <h2 id="proj-video-title" className="proj-section__title">Demo video</h2>
                                    <video
                                        className="proj-video"
                                        controls
                                        preload="none"
                                        poster={cover?.url}
                                        onPlay={() => posthog?.capture('project_video_played', { slug, title: Title })}
                                    >
                                        <source src={video.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </section>
                            )}

                            {hasGallery && (
                                <section
                                    className="proj-section"
                                    id="gallery"
                                    aria-labelledby="proj-gallery-title"
                                    ref={(el) => {
                                        if (!el) return;
                                        const obs = new IntersectionObserver(([entry]) => {
                                            if (entry.isIntersecting) {
                                                posthog?.capture('project_gallery_viewed', { slug, title: Title, image_count: media.length });
                                                obs.disconnect();
                                            }
                                        }, { threshold: 0.3 });
                                        obs.observe(el);
                                    }}
                                >
                                    <h2 id="proj-gallery-title" className="proj-section__title">Gallery</h2>
                                    <MediaGallery media={media} />
                                </section>
                            )}

                            <p className="proj-back">
                                <Link to="/projects" className="bp-link">← All projects</Link>
                            </p>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ProjectPage;
