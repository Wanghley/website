import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/ProjectPost.css';
import { formatDate } from '../utils/formatDate';
import { FaTag } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

const ProjectPage = () => {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);

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

                if (response.data.data.attributes.Description) {
                    const tempHeadings = [];
                    response.data.data.attributes.Description.split('\n').forEach(line => {
                        const match = line.match(/^(#{1,6})\s+(.*)/);
                        if (match) {
                            tempHeadings.push({ level: match[1].length, text: match[2] });
                        }
                    });
                    setHeadings(tempHeadings);
                }
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

    const {
        Title, Github, Description, Category, Demo,
        End, Start, Teaser, video, Featured, Media
    } = project.attributes;

    const featuredImage = Featured?.data?.attributes?.formats?.large?.url;
    console.log('Media:', Media);
    const media = Media?.data?.flatMap(item => [
        item.attributes.formats.large?.url,
        item.attributes.formats.medium?.url
      ]).filter(url => url !== null && url !== undefined) || [];

    const markdownComponents = {
        h1: ({ children }) => <h1 id={children} className="project-page__markdown-header">{children}</h1>,
        h2: ({ children }) => <h2 id={children} className="project-page__markdown-header">{children}</h2>,
        h3: ({ children }) => <h3 id={children} className="project-page__markdown-header">{children}</h3>,
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
                <SyntaxHighlighter style={materialDark} language={match ? match[1] : ''} {...props}>
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className="project-page__markdown-inline-code" {...props}>{children}</code>
            );
        },
        table: props => (
            <table className="project-page__markdown-table">
                {props.children}
            </table>
        ),
        td: props => {
            const content = React.Children.map(props.children, child => {
                if (typeof child === 'object' && child !== null) {
                    return child.props?.children || '';
                }
                return child || '';
            }).join('');
    
            return (
                <td 
                    className="project-page__markdown-table-cell"
                    dangerouslySetInnerHTML={{ 
                        __html: content
                            .replace(/\\n/g, '<br />')
                            .replace(/\n/g, '<br />')
                            .replace(/•/g, '<br />•')
                    }}
                />
            );
        },
        th: props => {
            const content = React.Children.map(props.children, child => {
                if (typeof child === 'object' && child !== null) {
                    return child.props?.children || '';
                }
                return child || '';
            }).join('');
    
            return (
                <th 
                    className="project-page__markdown-table-header"
                    dangerouslySetInnerHTML={{ 
                        __html: content
                            .replace(/\\n/g, '<br />')
                            .replace(/\n/g, '<br />')
                            .replace(/•/g, '<br />•')
                    }}
                />
            );
        }
    };

    return (
        <article className="project-page">
            <div className="project-page__layout">
                {/* Sidebar */}
                <aside className="project-page__sidebar">
                    <h3>Index</h3>
                    <ol className="project-page__index-list">
                        {headings.map((heading, index) => (
                            <li key={index} className={`project-page__index-item level-${heading.level}`}>
                                <a href={`#${heading.text}`}>{heading.text}</a>
                            </li>
                        ))}
                    </ol>
                </aside>

                {/* Main Content */}
                <section className="project-page__main-content">
                    <header className="project-page__header">
                        {featuredImage && (
                            <div className="project-page__image-container">
                                <img src={featuredImage} alt={Title} className="project-page__image" />
                                <div className="project-page__overlay">
                                    <h1 className="project-page__title">{Title}</h1>
                                    <div className="project-page__info">
                                        <span className="project-page__category">
                                            <FaTag /> {Category}
                                        </span>
                                        <span className="project-page__dates">
                                            {Start ? formatDate(Start) : 'N/A'}
                                            {End && <strong> - </strong>}{End && formatDate(End)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Mobile Index */}
                    <div className="project-page__mobile-index">
                        <h3>Index</h3>
                        <ul>
                            {headings.map((heading, index) => (
                                <li key={index} className={`level-${heading.level}`}>
                                    <a href={`#${heading.text}`}>{heading.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Project Content */}
                    <section className="project-page__content">
                        <div className="project-page__links">
                            {Github && (
                                <a 
                                    href={Github} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="project-page__button project-page__button--github"
                                >
                                    View on GitHub
                                </a>
                            )}
                            {Demo && (
                                <a 
                                    href={Demo.includes('http') ? Demo : `https://${Demo}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="project-page__button project-page__button--demo"
                                >
                                    View Demo
                                </a>
                            )}
                        </div>

                        {/* Teaser and Media Gallery moved here */}
                        <div className="project-page__preview-content">
                            {Teaser && (
                                <section className="project-page__teaser">
                                    <p>{Teaser}</p>
                                </section>
                            )}
                            
                            {/* Media Gallery */}
                            {media.length > 0 && (
                            <>
                                <h2>Media Gallery</h2>
                                <section className="project-page__media">
                                {media.length <= 6 ? (
                                    <div className="project-page__media-grid">
                                    {media.map((url, index) => (
                                        <div key={index} className="project-page__media-item">
                                        <img src={url} alt={`Media ${index + 1}`} className="project-page__media-image" />
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <div className="project-page__media-carousel">
                                    {media.map((url, index) => (
                                        <div key={index} className="project-page__media-item">
                                        <img src={url} alt={`Media ${index + 1}`} className="project-page__media-image" />
                                        </div>
                                    ))}
                                    </div>
                                )}
                                </section>
                            </>
                            )}

                        </div>

                        {/* Main Description */}
                        {Description && (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                className="project-page__description"
                                components={markdownComponents}
                            >
                                {Description}
                            </ReactMarkdown>
                        )}

                        {/* Video Section */}
                        {video?.url && (
                            <section className="project-page__video">
                                <video controls>
                                    <source src={video.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </section>
                        )}
                    </section>
                </section>
            </div>
        </article>
    );
};

export default ProjectPage;