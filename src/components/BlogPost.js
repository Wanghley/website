import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePostHog } from '../lib/analytics';
import './css/article.css';
import { formatDate } from '../utils/formatDate';
import { fetchPage } from '../api/cms';
import { fetchRecentPosts } from '../api/site';
import { Helmet } from "react-helmet-async";
import { PageHeader, BenchCard, BenchCards } from './bench';
import ArticleBody from './article/ArticleBody';
import TableOfContents from './article/TableOfContents';
import ShareButton from './article/ShareButton';
import { useActiveHeading, useReadCompletion } from './article/hooks';
import { calculateReadingTime, extractHeadings, pickImage } from './article/utils';

// Loading: the same two bands with plain blocks where the text will be
const BlogSkeleton = () => (
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
        <p className="sr-only" role="status">Loading the article.</p>
    </main>
);

// Main Blog Post Component
const BlogPostPage = () => {
    const { slug } = useParams();
    const posthog = usePostHog();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);

    // Fetch blog post data
    useEffect(() => {
        const fetchBlogPost = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data } = await fetchPage('blog-posts', {
                    'filters[slug][$eq]': slug,
                    'pagination[pageSize]': 1,
                    populate: '*',
                });
                const postData = data[0] || null;
                setBlogPost(postData);
                posthog?.capture('blog_post_viewed', {
                    slug,
                    title: postData?.title,
                    category: postData?.categories?.[0],
                });

                // More to read: the latest posts, minus this one. A failure here is not an error for the page.
                try {
                    const latest = await fetchRecentPosts(4);
                    setRelatedPosts(latest.data || []);
                } catch {
                    setRelatedPosts([]);
                }
            } catch (err) {
                console.error("Error fetching blog post:", err);
                setError("The data service did not answer. Check your connection and try again.");
                posthog?.captureException?.(err, { slug });
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlogPost();
        }
    }, [slug, posthog]);

    const headings = useMemo(() => extractHeadings(blogPost?.body), [blogPost]);
    const activeHeadingId = useActiveHeading(!loading && !!blogPost);
    useReadCompletion(!!blogPost, () => posthog?.capture('blog_read_completed', {
        slug,
        title: blogPost?.title,
        reading_time_min: calculateReadingTime(blogPost?.body),
        categories: blogPost?.categories,
    }));

    if (loading) {
        return <BlogSkeleton />;
    }

    if (error) {
        return (
            <main id="main" className="article-page">
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="U3" title="The article did not load" size="md" lede={error} />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col article-state">
                        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
                        <Link to="/blog" className="bp-link">All posts →</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (!blogPost) {
        return (
            <main id="main" className="article-page">
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="U3" title="No article here" size="md" lede="That article does not exist, or it has moved." />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col article-state">
                        <Link to="/blog" className="btn btn--primary">Browse all posts</Link>
                    </div>
                </section>
            </main>
        );
    }

    // Extract blog post data
    const {
        title: Title, body: Content, categories: Categories, date, publishedAt, updatedAt, excerpt: Teaser, cover: coverMedia,
    } = blogPost;
    const publishedDate = date || publishedAt;

    const cover = pickImage(coverMedia);
    const categoryList = Categories?.slice(0, 3) || [];
    const readingTime = calculateReadingTime(Content);
    const blogUrl = `https://wanghley.com/blog/${slug}`;
    const more = relatedPosts.filter((post) => post.slug !== slug).slice(0, 3);

    // Schema.org structured data
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": Title,
        "image": cover?.url,
        "datePublished": publishedDate,
        "dateModified": updatedAt || publishedDate,
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
        <main id="main" className="article-page">
            <Helmet>
                <title>{Title} | Wanghley Martins</title>
                <meta name="description" content={Teaser || Content?.substring(0, 160)} />
                <link rel="canonical" href={blogUrl} />
                <meta property="og:title" content={Title} />
                <meta property="og:description" content={Teaser || Content?.substring(0, 160)} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={blogUrl} />
                <meta property="og:image" content={cover?.url || 'https://wanghley.com/og-image.png'} />
                <meta property="article:published_time" content={publishedDate} />
                <meta property="article:modified_time" content={updatedAt || publishedDate} />
                <meta property="article:author" content="Wanghley" />
                <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <section className="bp-sec bp-sec--head">
                <div className="bench-col">
                    <nav className="article-crumbs" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <span aria-hidden="true">/</span>
                        <Link to="/blog">Blog</Link>
                    </nav>
                    <PageHeader
                        size="md"
                        refdes="U3"
                        title={Title}
                        lede={Teaser}
                        meta={[categoryList[0], publishedDate ? formatDate(publishedDate) : null, readingTime ? `${readingTime} min read` : null].filter(Boolean)}
                    >
                        <div className="article-actions">
                            <ShareButton title={Title} url={blogUrl} event="blog_post_shared" />
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
                            <TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="blog_toc_clicked" />
                        </aside>

                        <article className="article-main">
                            <TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="blog_toc_clicked" inline />

                            {Content && <ArticleBody source={Content} headings={headings} raw />}

                            {categoryList.length > 0 && (
                                <ul className="article-topics" aria-label="Topics">
                                    {categoryList.map((cat) => <li key={cat}>{cat}</li>)}
                                </ul>
                            )}

                            {more.length > 0 && (
                                <section className="article-section" aria-labelledby="article-more-title">
                                    <h2 id="article-more-title" className="article-section__title">More posts</h2>
                                    <BenchCards>
                                        {more.map((post, index) => (
                                            <BenchCard
                                                key={post.documentId ?? post.slug}
                                                href={`/blog/${post.slug}`}
                                                title={post.title}
                                                text={post.excerpt}
                                                meta={(post.date || post.publishedAt) ? formatDate(post.date || post.publishedAt) : undefined}
                                                image={pickImage(post.cover, ['small', 'medium'])?.url}
                                                onClick={() => posthog?.capture('blog_related_post_clicked', { from_slug: slug, to_slug: post.slug, title: post.title, index })}
                                            />
                                        ))}
                                    </BenchCards>
                                </section>
                            )}

                            <p className="article-back">
                                <Link to="/blog" className="bp-link">← All posts</Link>
                            </p>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default BlogPostPage;
