import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import './css/Card.css';
import { FaExternalLinkAlt, FaBook, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Card = ({ imageUrl, title, date, teaser, category, slug, sourceURL = "#", demoURL = "#", isBlogPost = false }) => {
    const truncatedTeaser = truncateText(teaser, 100);
    const projectLink = `${slug}`;

    return (
        <article className="card">
            <Link to={projectLink} className="card__link">
                <div className="card__img" style={{ backgroundImage: `url(${imageUrl})` }}>
                    <div className="card__date">{formatDate(date)}</div>
                    <div className="card__img--hover"></div>
                </div>
            </Link>
            <div className="card__info">
                <h3 className="card__title">{title}</h3>
                <span className="card__category">{category}</span>

                <p className="card__teaser">{truncatedTeaser}</p>
                <div className="card__icons">
                    <Link to={projectLink} className="card__icon" title={isBlogPost ? "Read Full Post" : "Read More"}>
                        <FaBook />
                    </Link>
                    {!isBlogPost && (
                        <>
                            <a href={sourceURL} className="card__icon" title="Source" target="_blank" rel="noreferrer">
                                <FaGithub />
                            </a>
                            <a href={demoURL} className="card__icon" title="Demo" target="_blank" rel="noreferrer">
                                <FaExternalLinkAlt />
                            </a>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

const truncateText = (text, maxLength) => {
    if (!text) return ''; // Handle case when text is undefined or null
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
};

// format date to human readable format yyyy-mm-dd to Month dd, yyyy
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Prop types validation
Card.propTypes = {
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    teaser: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    sourceURL: PropTypes.string,
    demoURL: PropTypes.string,
    isBlogPost: PropTypes.bool
};

export default Card;
