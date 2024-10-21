import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/ProjectPost.css';
import { formatDate } from '../utils/formatDate';

// import icon from react-icons
import { FaTag } from "react-icons/fa";


// Import components for specific Markdown elements

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark  } from 'react-syntax-highlighter/dist/esm/styles/prism';

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

const ProjectPage = () => {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            } catch (error) {
                console.error('Fetch project error:', error.response || error.message || error);
                setError('Failed to fetch project details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

    if (loading) return <p className="loading-text">Loading...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!project) return <p className="no-project-text">No project found.</p>;

    const { Title, Github, Description, Category, Demo, End, Start, Teaser, video } = project.attributes;
    const featuredImage = project.attributes.Featured?.data?.attributes?.formats?.large?.url;
    const media = project.attributes.Media?.data
        ? project.attributes.Media.data.map((item) => item.attributes.formats.large.url)
        : [];

    // Custom components for ReactMarkdown
    const markdownComponents = {
        // Render paragraphs
        p: ({ node, ...props }) => <p className="project-page__markdown-paragraph" {...props} />,

        // Render headers
        h1: ({ node, ...props }) => <h1 className="project-page__markdown-header" {...props} />,
        h2: ({ node, ...props }) => <h2 className="project-page__markdown-header" {...props} />,
        h3: ({ node, ...props }) => <h3 className="project-page__markdown-header" {...props} />,

        // Render lists
        ul: ({ node, ...props }) => <ul className="project-page__markdown-list" {...props} />,
        ol: ({ node, ...props }) => <ol className="project-page__markdown-list" {...props} />,
        li: ({ node, ...props }) => <li className="project-page__markdown-list-item" {...props} />,

        // Render tables
        table: ({ node, ...props }) => <table className="project-page__markdown-table" {...props} />,
        tr: ({ node, ...props }) => <tr className="project-page__markdown-table-row" {...props} />,
        th: ({ node, ...props }) => <th className="project-page__markdown-table-header" {...props} />,
        td: ({ node, ...props }) => <td className="project-page__markdown-table-cell" {...props} />,

        // Render code blocks
code: ({ node, inline, className, children, ...props }) => {
    // Extract the language from the className
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    // Inline code rendering
    const renderInlineCode = () => (
        <code className="project-page__markdown-inline-code" {...props}>
            {children}
        </code>
    );

    // Block code rendering
    const renderBlockCode = () => (
        <SyntaxHighlighter style={materialDark} language={language} {...props}>
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    );

    return inline ? renderInlineCode() : renderBlockCode();
},


        // Render blockquotes
        blockquote: ({ node, ...props }) => (
            <blockquote className="project-page__markdown-blockquote" {...props} />
        ),

        // Render images
        img: ({ node, alt, src, title }) => (
            <img className="project-page__markdown-image" alt={alt} src={src} title={title} />
        ),

        // Render links
        a: ({ node, ...props }) => (
            <a className="project-page__markdown-link" {...props} />
        ),

        // Render horizontal rules
        hr: ({ node, ...props }) => (
            <hr className="project-page__markdown-horizontal-rule" {...props} />
        ),

        // Render details for collapsible sections
        details: ({ node, ...props }) => (
            <details className="project-page__markdown-details" {...props} />
        ),

        // Render summary for collapsible sections
        summary: ({ node, ...props }) => (
            <summary className="project-page__markdown-summary" {...props} />
        ),

        // Render task lists
        taskList: ({ node, ...props }) => (
            <ul className="project-page__markdown-task-list" {...props} />
        ),

        // Render task list items
        taskListItem: ({ node, ...props }) => (
            <li className="project-page__markdown-task-list-item" {...props} />
        ),
    };

    return (
        <article className="project-page">
            <header className="project-page__header">
                {featuredImage && (
                    <div className="project-page__image-container">
                        <img src={featuredImage} alt={Title} className="project-page__image" />
                        <div className="project-page__overlay">
                            <h1 className="project-page__title">{Title}</h1>
                            <div className="project-page__info">
                                <span className="project-page__category">
                                    <FaTag />
                                    {Category}
                                </span>
                                <span className="project-page__dates">
                                    {Start ? formatDate(Start) : 'N/A'}
                                    {End && <span><strong> - </strong>{formatDate(End)}</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <section className="project-page__content">
                <div className="project-page__links">
                    {Github && (
                        <a href={Github} target="_blank" rel="noopener noreferrer" className="project-page__button project-page__button--github">
                            View on GitHub
                        </a>
                    )}
                    {Demo && (
                        <a href={Demo} target="_blank" rel="noopener noreferrer" className="project-page__button project-page__button--demo">
                            Visit Demo
                        </a>
                    )}
                </div>
                {Description && (
                    <ReactMarkdown className="project-page__description" components={markdownComponents}>
                        {Description}
                    </ReactMarkdown>
                )}
            </section>

            {video?.url && (
                <section className="project-page__video">
                    <video controls>
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </section>
            )}

            {Teaser && (
                <section className="project-page__teaser">
                    <p><strong>Teaser:</strong> {Teaser}</p>
                </section>
            )}

            {media.length > 0 && (
                <section className="project-page__media">
                    {media.map((url, index) => (
                        <div key={index} className="project-page__media-item">
                            <img src={url} alt={`Media ${index + 1}`} className="project-page__media-image" />
                        </div>
                    ))}
                </section>
            )}
        </article>
    );
};

export default ProjectPage;
