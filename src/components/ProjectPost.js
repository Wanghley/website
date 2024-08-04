import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/ProjectPost.css';

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!project) return <p>No project found.</p>;

    const { Title, Github, Description, Category, Demo, End, Start, Teaser, video } = project.attributes;
    const featuredImage = project.attributes.Featured?.data?.attributes?.formats?.large?.url;
    const media = project.attributes.Media?.data
        ? project.attributes.Media.data.map((item) => item.attributes.formats.large.url)
        : [];

    return (
        <article className="project-page">
            <header className="project-page__header">
                {featuredImage && (
                    <div className="project-page__image-container">
                        <img src={featuredImage} alt={Title} className="project-page__image" />
                        <div className="project-page__overlay">
                            <h1 className="project-page__title">{Title}</h1>
                            <div className="project-page__tags">
                                <span className="project-page__tag">{Category}</span>
                            </div>
                            <p className="project-page__dates">
                                <strong>Start:</strong> {Start} {End && <span><strong>End:</strong> {End}</span>}
                            </p>
                        </div>
                    </div>
                )}
            </header>

            <section className="project-page__content">
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
                {Description && <ReactMarkdown className="project-page__description">{Description}</ReactMarkdown>}
            </section>

            {video && (
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
