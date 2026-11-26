import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePostHog } from '../lib/analytics';
import './css/article.css';
import { formatDate, formatMonth } from '../utils/formatDate';
import { fetchPage } from '../api/cms';
import { fetchAllPosts } from '../api/site';
import { Helmet } from "react-helmet-async";
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
import { newestFirst } from './bench/bento';

const postDate = (post) => post.date || post.publishedAt;

// Main Blog Post Component
const BlogPostPage = () => {
    const { slug } = useParams();
    const posthog = usePostHog();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allPosts, setAllPosts] = useState([]);

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

    // The newer and older post at the end of the page. The list is cached (the
    // blog page reads the same one); a failure here is not an error for the page.
    useEffect(() => {
        let cancelled = false;
        fetchAllPosts()
            .then((rows) => { if (!cancelled) setAllPosts(newestFirst(rows.filter((p) => p?.title), postDate)); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const headings = useMemo(() => extractHeadings(blogPost?.body), [blogPost]);
    const activeHeadingId = useActiveHeading(!loading && !!blogPost);
    useReadCompletion(!!blogPost, () => posthog?.capture('blog_read_completed', {
        slug,
        title: blogPost?.title,
        reading_time_min: calculateReadingTime(blogPost?.body),
        categories: blogPost?.categories,
    }));

    if (loading) {
        return <ArticleSkeleton label="Loading the article." />;
    }

    if (error) {
        return (
            <ArticleState refdes="U3" title="The article did not load" lede={error}>
                <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
                <Link to="/blog" className="bp-link">All posts →</Link>
            </ArticleState>
        );
    }

    if (!blogPost) {
        return (
            <ArticleState refdes="U3" title="No article here" lede="That article does not exist, or it has moved.">
                <Link to="/blog" className="btn btn--primary">Browse all posts</Link>
            </ArticleState>
        );
    }

    // Extract blog post data
    const {
        title: Title, body: Content, categories: Categories, updatedAt, excerpt: Teaser, cover: coverMedia,
    } = blogPost;
    const publishedDate = postDate(blogPost);

    const cover = pickImage(coverMedia);
    const categoryList = Categories?.slice(0, 3) || [];
    const readingTime = calculateReadingTime(Content);
    const blogUrl = `https://wanghley.com/blog/${slug}`;

    // No "Updated" row: the CMS's updatedAt is the day the content was imported
    // (the same day on every entry), not the day anyone revised the post.
    const factRows = [
        { label: 'Published', value: publishedDate ? formatDate(publishedDate) : null },
        { label: 'Reading time', value: readingTime ? `${readingTime} min` : null },
        {
            label: 'Topics',
            value: categoryList.length ? (
                <ul className="article-facts__list">
                    {categoryList.map((cat) => <li key={cat}>{cat}</li>)}
                </ul>
            ) : null,
        },
    ];

    const { newer, older } = adjacent(allPosts, slug);
    const asTile = (p) => p && ({
        href: `/blog/${p.slug}`,
        title: p.title,
        meta: [postDate(p) && formatMonth(postDate(p)), p.categories?.[0]].filter(Boolean).join(' · '),
        image: pickImage(p.cover, ['thumbnail', 'small'])?.url,
    });

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

            <ArticleHero
                section="Blog"
                sectionPath="/blog"
                refdes="U3"
                title={Title}
                lede={Teaser}
                cover={cover}
            >
                <div className="article-actions">
                    <ShareButton title={Title} url={blogUrl} event="blog_post_shared" />
                </div>
            </ArticleHero>

            <section className="bp-sec bp-sec--light article-body">
                <div className="bench-col">
                    <ArticleLayout
                        hasToc={headings.length > 0}
                        toc={<TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="blog_toc_clicked" />}
                        tocInline={<TableOfContents headings={headings} activeId={activeHeadingId} slug={slug} event="blog_toc_clicked" inline />}
                        facts={<ArticleFacts title="Post details" rows={factRows} />}
                        factsInline={<ArticleFacts title="Post details" rows={factRows} variant="strip-narrow" />}
                    >
                        {Content && <ArticleBody source={Content} headings={headings} raw />}
                    </ArticleLayout>

                    <AdjacentNav
                        label="More posts"
                        newer={asTile(newer)}
                        older={asTile(older)}
                        onNavigate={(direction) => posthog?.capture('blog_adjacent_clicked', {
                            from_slug: slug,
                            to_slug: (direction === 'newer' ? newer : older)?.slug,
                            direction,
                        })}
                    />

                    <p className="article-back">
                        <Link to="/blog" className="bp-link">← All posts</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default BlogPostPage;
