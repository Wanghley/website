import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePostHog } from '../lib/analytics';
import './css/article.css';
import { formatMonth } from '../utils/formatDate';
import { FaGithub, FaPlay } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import MediaGallery from './ProjectMediaGallery';
import ArticleBody from './article/ArticleBody';
import ArticleHero from './article/ArticleHero';
import ArticleLayout from './article/ArticleLayout';
import ArticleFacts from './article/ArticleFacts';
import ArticleSkeleton from './article/ArticleSkeleton';
import ArticleState from './article/ArticleState';
import AdjacentNav from './article/AdjacentNav';
import { adjacent } from './article/adjacent';
import TableOfContents from './article/TableOfContents';
import ShareButton from './article/ShareButton';
import { useActiveHeading, useReadCompletion } from './article/hooks';
import { calculateReadingTime, extractHeadings, pickImage } from './article/utils';
import { fetchPage, mediaUrl } from '../api/cms';
import { fetchAllProjects } from '../api/site';
import { newestFirst } from './bench/bento';
import ProjectReport from './ProjectReport';
import ProjectSite, { frameUrl } from './ProjectSite';
import ViewSwitch from './article/ViewSwitch';
import { projectViews, pickView } from './article/views';

const withProtocol = (url) => (url.includes('http') ? url : `https://${url}`);

// A short list of plain items for a facts row.
const list = (items) => {
    const kept = items.filter(Boolean);
    return kept.length ? (
        <ul className="article-facts__list">
            {kept.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    ) : null;
};

// Main Project Page Component
const ProjectPage = () => {
    const { slug } = useParams();
    const posthog = usePostHog();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allProjects, setAllProjects] = useState([]);
    // Which view shows (?view=report), and which ones have been opened so far.
    // A view that was opened stays mounted, hidden, so its place in a long report is kept.
    const [searchParams, setSearchParams] = useSearchParams();
    const [opened, setOpened] = useState({});

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
                posthog?.captureException?.(err, { slug });
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProject();
        }
    }, [slug, posthog]);

    // The newer and older project at the end of the page. The list is cached
    // (the projects page reads the same one); a failure here is not an error for the page.
    useEffect(() => {
        let cancelled = false;
        fetchAllProjects()
            .then((rows) => { if (!cancelled) setAllProjects(newestFirst(rows.filter((p) => p?.title), (p) => p.startDate)); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const headings = useMemo(() => extractHeadings(project?.body), [project]);
    const activeHeadingId = useActiveHeading(!loading && !!project);
    useReadCompletion(!!project, () => posthog?.capture('project_read_completed', {
        slug,
        title: project?.title,
        category: project?.category,
        reading_time_min: calculateReadingTime(project?.body),
    }));

    if (loading) {
        return <ArticleSkeleton label="Loading the project." />;
    }

    if (error) {
        return (
            <ArticleState refdes="U2" title="The project did not load" lede={error}>
                <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
                <Link to="/projects" className="bp-link">All projects →</Link>
            </ArticleState>
        );
    }

    if (!project) {
        return (
            <ArticleState refdes="U2" title="No project here" lede="That project does not exist, or it has moved.">
                <Link to="/projects" className="btn btn--primary">Browse all projects</Link>
            </ArticleState>
        );
    }

    // Extract project data
    const {
        title: Title, githubUrl: Github, body: Description, category: Category, demoUrl: Demo,
        endDate: End, startDate: Start, summary: Teaser, videoUrl, cover: coverMedia, gallery, skills,
    } = project;

    const cover = pickImage(coverMedia);
    const media = (gallery || []).map((item) => mediaUrl(item)).filter(Boolean);

    const readingTime = calculateReadingTime(Description);
    const projectUrl = `https://wanghley.com/projects/${slug}`;
    const hasVideo = !!videoUrl;
    const hasGallery = media.length > 0;
    const reportUrl = mediaUrl(project.report);
    const hasSite = !!frameUrl(project.site);
    const views = projectViews({
        hasOverview: !!(Description || hasVideo || hasGallery),
        hasSite,
        hasReport: !!reportUrl,
    });
    const active = pickView(views, searchParams.get('view'));
    const selectView = (id) => {
        setOpened((prev) => ({ ...prev, [active]: true, [id]: true }));
        setSearchParams(id === views[0].id ? {} : { view: views.find((view) => view.id === id).slug }, { replace: true, preventScrollReset: true });
        posthog?.capture('project_view_selected', { slug, title: Title, view: id });
    };
    const dates = Start ? [formatMonth(Start), End ? formatMonth(End) : 'Present'].join(' – ') : null;

    // The facts: what the CMS holds about the project, in one place.
    const stack = (skills || []).map((skill) => skill?.name).filter(Boolean).join(', ');
    const factRows = [
        { label: 'Period', value: dates },
        { label: 'Field', value: Category },
        { label: 'Stack', value: stack },
        {
            label: 'Includes',
            value: list([
                readingTime ? `Write-up, ${readingTime} min read` : null,
                ...views.filter((view) => view.id !== 'overview').map((view) => view.label),
                hasVideo ? <a href="#video">Demo video</a> : null,
                hasGallery ? <a href="#gallery">{media.length} {media.length === 1 ? 'photo' : 'photos'}</a> : null,
            ]),
        },
    ];

    const { newer, older } = adjacent(allProjects, slug);
    const asTile = (p) => p && ({
        href: `/projects/${p.slug}`,
        title: p.title,
        meta: [p.startDate && formatMonth(p.startDate), p.category].filter(Boolean).join(' · '),
        image: pickImage(p.cover, ['thumbnail', 'small'])?.url,
    });

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

            <ArticleHero
                section="Projects"
                sectionPath="/projects"
                refdes="U2"
                title={Title}
                lede={Teaser}
                cover={cover}
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
                        <a
                            className="btn btn--ghost"
                            href="#video"
                            onClick={(event) => {
                                // The video lives in the overview: bring it back first.
                                if (active === 'overview') return;
                                event.preventDefault();
                                selectView('overview');
                                setTimeout(() => document.getElementById('video')?.scrollIntoView(), 0);
                            }}
                        ><FaPlay aria-hidden="true" /> Demo video</a>
                    )}
                    <ShareButton title={Title} url={projectUrl} event="project_shared" />
                </div>
            </ArticleHero>

            <section className="bp-sec bp-sec--light article-body">
                <div className="bench-col">
                    {views.length > 1 && (
                        <ViewSwitch views={views} active={active} onChange={selectView} label="What to show for this project" />
                    )}

                    {views.map(({ id }) => (active === id || opened[id]) && (
                        <div
                            key={id}
                            className="article-view"
                            id={`project-view-panel-${id}`}
                            role={views.length > 1 ? 'tabpanel' : undefined}
                            aria-labelledby={views.length > 1 ? `project-view-tab-${id}` : undefined}
                            hidden={active !== id}
                        >
                            {id === 'overview' && (
                                <>
                                    {Description ? (
                                        <ArticleLayout
                                            hasToc={headings.length > 0}
                                            toc={<TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="project_toc_clicked" />}
                                            tocInline={<TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="project_toc_clicked" inline />}
                                            facts={<ArticleFacts title="Project details" rows={factRows} />}
                                            factsInline={<ArticleFacts title="Project details" rows={factRows} variant="strip-narrow" />}
                                        >
                                            <ArticleBody source={Description} headings={headings} />
                                        </ArticleLayout>
                                    ) : (
                                        // No write-up: nothing to sit beside, so the facts run across.
                                        <ArticleFacts title="Project details" rows={factRows} variant="strip" />
                                    )}

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
                                </>
                            )}
                            {id === 'site' && <ProjectSite site={project.site} title={Title} />}
                            {id === 'report' && <ProjectReport url={reportUrl} title={Title} />}
                        </div>
                    ))}

                    <AdjacentNav
                        label="More projects"
                        newer={asTile(newer)}
                        older={asTile(older)}
                        onNavigate={(direction) => posthog?.capture('project_adjacent_clicked', {
                            from_slug: slug,
                            to_slug: (direction === 'newer' ? newer : older)?.slug,
                            direction,
                        })}
                    />

                    <p className="article-back">
                        <Link to="/projects" className="bp-link">← All projects</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default ProjectPage;
