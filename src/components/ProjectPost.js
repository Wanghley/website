import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePostHog } from '../lib/analytics';
import './css/article.css';
import { formatMonth } from '../utils/formatDate';
import { FaGithub, FaPlay } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import MediaGallery from './ProjectMediaGallery';
import { PageHeader } from './bench';
import ArticleBody from './article/ArticleBody';
import TableOfContents from './article/TableOfContents';
import ShareButton from './article/ShareButton';
import { useActiveHeading, useReadCompletion } from './article/hooks';
import { calculateReadingTime, extractHeadings, pickImage } from './article/utils';
import { fetchPage, mediaUrl } from '../api/cms';

const withProtocol = (url) => (url.includes('http') ? url : `https://${url}`);

// Loading: the same two bands with plain blocks where the text will be
const ProjectSkeleton = () => (
    <main id="main" className="article-page" aria-busy="true">
        <section className="bp-sec bp-sec--head">
            <div className="bench-col">
                <div className="bp-rule" aria-hidden="true" />
                <div className="article-skeleton article-skeleton--title" />
                <div className="article-skeleton article-skeleton--lede" />
            </div>
        </section>
        <section className="bp-sec bp-sec--light">
            <div className="bench-col">
                <div className="article-skeleton article-skeleton--block" />
                <div className="article-skeleton article-skeleton--line" />
                <div className="article-skeleton article-skeleton--line article-skeleton--short" />
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

    // Fetch project data
    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data } = await fetchPage('projects', {
                    'filters[slug][$eq]': slug,
                    'pagination[pageSize]': 1,
                    populate: '*',
                });
                const projectData = data[0] || null;
                setProject(projectData);
                posthog?.capture('project_viewed', {
                    slug,
                    title: projectData?.title,
                    category: projectData?.category,
                });
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

    const headings = useMemo(() => extractHeadings(project?.body), [project]);
    const activeHeadingId = useActiveHeading(!loading && !!project);
    useReadCompletion(!!project, () => posthog?.capture('project_read_completed', {
        slug,
        title: project?.title,
        category: project?.category,
        reading_time_min: calculateReadingTime(project?.body),
    }));

    if (loading) {
        return <ProjectSkeleton />;
    }

    if (error) {
        return (
            <main id="main" className="article-page">
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="U2" title="The project did not load" size="md" lede={error} />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col article-state">
                        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
                        <Link to="/projects" className="bp-link">All projects →</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (!project) {
        return (
            <main id="main" className="article-page">
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="U2" title="No project here" size="md" lede="That project does not exist, or it has moved." />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col article-state">
                        <Link to="/projects" className="btn btn--primary">Browse all projects</Link>
                    </div>
                </section>
            </main>
        );
    }

    // Extract project data
    const {
        title: Title, githubUrl: Github, body: Description, category: Category, demoUrl: Demo,
        endDate: End, startDate: Start, summary: Teaser, videoUrl, cover: coverMedia, gallery,
    } = project;

    const cover = pickImage(coverMedia);
    const media = (gallery || []).map((item) => mediaUrl(item)).filter(Boolean);

    const readingTime = calculateReadingTime(Description);
    const projectUrl = `https://wanghley.com/projects/${slug}`;
    const hasVideo = !!videoUrl;
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
        <main id="main" className="article-page">
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
                    <nav className="article-crumbs" aria-label="Breadcrumb">
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
                        <div className="article-actions">
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
                            <ShareButton title={Title} url={projectUrl} event="project_shared" />
                        </div>
                    </PageHeader>
                </div>
            </section>

            <section className="bp-sec bp-sec--light article-body">
                <div className="bench-col">
                    {cover && (
                        <figure className="article-cover">
                            <img src={cover.url} alt={Title} width={cover.width} height={cover.height} />
                        </figure>
                    )}

                    <div className="article-layout">
                        <aside className="article-aside">
                            <TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="project_toc_clicked" />
                        </aside>

                        <article className="article-main">
                            <TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="project_toc_clicked" inline />

                            {Description && <ArticleBody source={Description} headings={headings} />}

                            {hasVideo && (
                                <section className="article-section" id="video" aria-labelledby="article-video-title">
                                    <h2 id="article-video-title" className="article-section__title">Demo video</h2>
                                    <video
                                        className="article-video"
                                        controls
                                        preload="none"
                                        poster={cover?.url}
                                        onPlay={() => posthog?.capture('project_video_played', { slug, title: Title })}
                                    >
                                        <source src={videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </section>
                            )}

                            {hasGallery && (
                                <section
                                    className="article-section"
                                    id="gallery"
                                    aria-labelledby="article-gallery-title"
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
                                    <h2 id="article-gallery-title" className="article-section__title">Gallery</h2>
                                    <MediaGallery media={media} />
                                </section>
                            )}

                            <p className="article-back">
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
