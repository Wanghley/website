import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/BlogPost.css';
import { formatDate } from '../utils/formatDate'; // Update this import path if needed

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

const BlogPostPage = () => {
    const { slug } = useParams();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogPost = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/api/slugify/slugs/blog/${slug}?populate=*`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );
                setBlogPost(response.data.data);
            } catch (error) {
                console.error('Fetch blog post error:', error.response || error.message || error);
                setError('Failed to fetch blog post details.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogPost();
    }, [slug]);

    if (loading) return <p className="loading-text">Loading...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!blogPost) return <p className="no-blog-post-text">No blog post found.</p>;

    console.log("Blog post:", blogPost.attributes);

    const { Title, publishedAt, Content, Categories } = blogPost.attributes;
    const featuredImage = blogPost.attributes.Featured?.data?.attributes?.formats?.large?.url;

    return (
        <article className="blog-page">
            <header className="blog-page__header">
                {featuredImage && (
                    <div className="blog-page__image-container">
                        <img src={featuredImage} alt={Title} className="blog-page__image" />
                        <div className="blog-page__overlay">
                            <h1 className="blog-page__title">{Title}</h1>
                            <div className="blog-page__info">
                                <span className="blog-page__category">{Categories}</span>
                                <span className="blog-page__dates">
                                    {publishedAt ? formatDate(publishedAt) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                {!featuredImage && (
                     <div className="blog-page__title-container">
                        <h1 className="blog-page__title">{Title}</h1>
                     <div className="blog-page__info">
                         <span className="blog-page__category">{Categories}</span>
                         <span className="blog-page__dates">
                             {publishedAt ? formatDate(publishedAt) : 'N/A'}
                         </span>
                     </div>
                </div>
                )}
            </header>

            <section className="blog-page__content">
                {Content && <ReactMarkdown className="blog-page__text">{Content}</ReactMarkdown>}
            </section>

        </article>
    );
};

export default BlogPostPage;
