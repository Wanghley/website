import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePostHog } from '../lib/analytics';
import { fetchAllProjects } from '../api/site';
import { mediaUrl } from '../api/cms';
import { formatMonth } from '../utils/formatDate';
import { PageHeader, BenchCard, BenchCards, BenchCardSkeleton, ListToolbar } from '../components/bench';
import { orderProjects, projectSizes, readingOrder, visibleChips } from '../components/bench/bento';
import '../components/css/list-page.css';

// The whole list is a few dozen rows, so it loads in one go: search and the
// category filter then cover every project, not just the pages scrolled so far.

const SKELETON_SIZES = ['lead', 'std', 'std', 'std', 'std', 'std'];

const Projects = () => {
    const posthog = usePostHog();
    const [projects, setProjects] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const rows = await fetchAllProjects();
            setProjects(rows.filter((p) => p?.title));
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onSearch = useCallback((val) => {
        setSearchTerm(val);
        if (val.trim().length >= 3) posthog?.capture('project_searched', { search_term: val.trim() });
    }, [posthog]);

    const onChip = useCallback((name) => {
        setActiveCategory(name);
        posthog?.capture('project_filter_applied', { category: name });
    }, [posthog]);

    const filtering = Boolean(searchTerm.trim()) || activeCategory !== 'All';
    const clearFilters = () => { setSearchTerm(''); setActiveCategory('All'); };

    // Chips count every project; only the ones with two or more are offered.
    const chips = useMemo(() => {
        const counts = {};
        projects.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
        const named = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map((name) => ({ name, count: counts[name] }));
        return visibleChips([{ name: 'All', count: projects.length }, ...named]);
    }, [projects]);

    // Selected projects first, then the rest newest first. While a search or a
    // filter is on: plain newest first, every tile the same size.
    const shown = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        const matching = projects.filter((a) => {
            const matchesSearch = !q || a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
            const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
        return orderProjects(matching, { selectedFirst: !filtering });
    }, [projects, searchTerm, activeCategory, filtering]);

    // The tiles in the order they appear on the grid, so tabbing goes the way the eye does.
    const tiles = useMemo(() => {
        const sizes = projectSizes(shown, { uniform: filtering });
        return readingOrder(sizes).map((i) => ({ project: shown[i], size: sizes[i] }));
    }, [shown, filtering]);

    return (
        <main id="main" className="projects-page list-page">
            <Helmet>
                <title>Projects | Wanghley Martins</title>
                <meta name="description" content="Projects by Wanghley Martins: hardware, signal processing and machine learning." />
                <link rel="canonical" href="https://wanghley.com/projects" />
                <meta property="og:title" content="Projects | Wanghley Martins" />
                <meta property="og:description" content="Hardware, signal processing and machine learning projects." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/projects" />
            </Helmet>

            <section className="bp-sec bp-sec--head">
                <div className="bench-col">
                    <PageHeader
                        refdes="U2"
                        title="Projects"
                        lede="Hardware, signal processing and machine learning. Selected work first, then the rest, newest first."
                        meta={status === 'ready' ? [`${projects.length} projects`] : []}
                    />
                </div>
            </section>

            <section className="bp-sec bp-sec--light projects-body" aria-label="Project list">
                <div className="bench-col">
                    <ListToolbar
                        noun="projects"
                        status={status}
                        searchTerm={searchTerm}
                        onSearch={onSearch}
                        chips={chips}
                        activeCategory={activeCategory}
                        onChip={onChip}
                        total={projects.length}
                        shown={shown.length}
                    />

                    {status === 'loading' && (
                        <ul className="bp-cards bp-cards--bento" aria-hidden="true">
                            {SKELETON_SIZES.map((size, i) => <BenchCardSkeleton key={i} size={size} />)}
                        </ul>
                    )}

                    {status === 'error' && (
                        <div className="list-empty">
                            <h2 className="list-empty__title">The projects did not load</h2>
                            <p>The data service did not answer. Check your connection and try again.</p>
                            <button type="button" className="btn btn--primary" onClick={load}>Try again</button>
                        </div>
                    )}

                    {status === 'ready' && shown.length > 0 && <h2 className="sr-only">All projects</h2>}

                    {status === 'ready' && shown.length > 0 && (
                        <BenchCards bento>
                            {tiles.map(({ project, size }, index) => {
                                const { title: Title, summary: Teaser, category: Category, startDate: Start, slug, githubUrl: Github, demoUrl: Demo } = project;
                                return (
                                    <BenchCard
                                        key={project.documentId ?? slug}
                                        size={size}
                                        href={`/projects/${slug}`}
                                        title={Title}
                                        text={Teaser}
                                        meta={[Start && formatMonth(Start), Category].filter(Boolean).join(' · ')}
                                        image={mediaUrl(project.cover, size === 'std' ? ['medium', 'small', 'large'] : ['large', 'medium'])}
                                        onClick={() => posthog?.capture('project_card_clicked', { title: Title, slug, category: Category, index })}
                                        actions={[
                                            Github && { label: 'Source', href: Github, onClick: () => posthog?.capture('project_github_quick_clicked', { title: Title, slug }) },
                                            Demo && { label: 'Demo', href: Demo, onClick: () => posthog?.capture('project_demo_quick_clicked', { title: Title, slug }) },
                                        ].filter(Boolean)}
                                    />
                                );
                            })}
                        </BenchCards>
                    )}

                    {status === 'ready' && shown.length === 0 && (
                        <div className="list-empty">
                            <h2 className="list-empty__title">No projects match</h2>
                            <p>Try a shorter search, or another category.</p>
                            {filtering && <button type="button" className="btn btn--primary" onClick={clearFilters}>Show all {projects.length} projects</button>}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Projects;
