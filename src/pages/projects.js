import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePostHog } from '../lib/analytics';
import { fetchAllProjects } from '../api/site';
import { mediaUrl } from '../api/cms';
import { formatMonth } from '../utils/formatDate';
import { PageHeader, BenchCard, BenchCards } from '../components/bench';
import '../components/css/list-page.css';

// The whole list is a few dozen rows, so it loads in one go: search and the
// category filter then cover every project, not just the pages scrolled so far.

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const Projects = () => {
    const posthog = usePostHog();
    const [projects, setProjects] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const searchInputRef = useRef(null);

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

    // Keyboard: Cmd/Ctrl+K focuses search, Escape clears it
    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setSearchTerm('');
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // newest first; date-only strings sort correctly as text
    const sorted = useMemo(
        () => [...projects].sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || ''))),
        [projects]
    );

    const categories = useMemo(() => {
        const counts = {};
        sorted.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
        const named = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map((name) => ({ name, count: counts[name] }));
        return [{ name: 'All', count: sorted.length }, ...named];
    }, [sorted]);

    const shown = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return sorted.filter((a) => {
            const matchesSearch = !q || a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
            const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [sorted, searchTerm, activeCategory]);

    const filtering = Boolean(searchTerm.trim()) || activeCategory !== 'All';
    const clearFilters = () => { setSearchTerm(''); setActiveCategory('All'); };

    return (
        <main id="main" className="projects-page">
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
                        lede="Hardware, signal processing and machine learning, newest first."
                        meta={status === 'ready' ? [`${sorted.length} projects`] : []}
                    />
                </div>
            </section>

            <section className="bp-sec bp-sec--light projects-body" aria-label="Project list">
                <div className="bench-col">
                    <div className="list-toolbar">
                        <div className="list-search">
                            <label htmlFor="project-search" className="sr-only">Search projects</label>
                            <input
                                id="project-search"
                                ref={searchInputRef}
                                type="search"
                                placeholder="Search projects"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchTerm(val);
                                    if (val.trim().length >= 3) posthog?.capture('project_searched', { search_term: val.trim() });
                                }}
                            />
                            {searchTerm ? (
                                <button type="button" className="list-search__clear" onClick={() => setSearchTerm('')}>Clear</button>
                            ) : (
                                <kbd aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
                            )}
                        </div>

                        {categories.length > 2 && (
                            <div className="list-filters" role="group" aria-label="Filter by category">
                                {categories.map(({ name, count }) => (
                                    <button
                                        key={name}
                                        type="button"
                                        className="list-chip"
                                        aria-pressed={activeCategory === name}
                                        onClick={() => { setActiveCategory(name); posthog?.capture('project_filter_applied', { category: name }); }}
                                    >
                                        {name}<span className="list-chip__n">{count}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="list-results" role="status" aria-live="polite">
                        {status === 'loading' && 'Loading projects.'}
                        {status === 'ready' && (filtering
                            ? `${shown.length} of ${sorted.length} projects${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}${searchTerm.trim() ? ` matching "${searchTerm.trim()}"` : ''}`
                            : `${sorted.length} projects`)}
                    </p>

                    {status === 'loading' && (
                        <ul className="bp-cards" aria-hidden="true">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <li key={i} className="bp-card">
                                    <span className="bp-card__media"><span className="bp-card__blank" /></span>
                                    <span className="list-skeleton list-skeleton--meta" />
                                    <span className="list-skeleton list-skeleton--title" />
                                    <span className="list-skeleton list-skeleton--text" />
                                </li>
                            ))}
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
                        <BenchCards>
                            {shown.map((project, index) => {
                                const { title: Title, summary: Teaser, category: Category, startDate: Start, slug, githubUrl: Github, demoUrl: Demo } = project;
                                return (
                                    <BenchCard
                                        key={project.documentId ?? slug}
                                        href={`/projects/${slug}`}
                                        title={Title}
                                        text={Teaser}
                                        meta={[Start && formatMonth(Start), Category].filter(Boolean).join(' · ')}
                                        image={mediaUrl(project.cover)}
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
                            {filtering && <button type="button" className="btn btn--primary" onClick={clearFilters}>Show all {sorted.length} projects</button>}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Projects;
