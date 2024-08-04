import React from 'react';
import './css/Card.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faBook } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons from Font Awesome
import { faGithub } from '@fortawesome/free-brands-svg-icons'; // Import necessary icons from Font Awesome
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Card = ({ imageUrl, title, date, teaser, category, slug, sourceURL = "#", demoURL = "#" }) => {
    const truncatedTeaser = truncateText(teaser, 100);
    const projectLink = `${slug}`;

    console.log("sourceURL", sourceURL);
    console.log("demoURL", demoURL);

    return (
        <article className="card">
            <Link to={projectLink} className="card__link">
                <div className="card__img" style={{ backgroundImage: `url(${imageUrl})` }}>
                    <div className="card__date">{date}</div>
                    <div className="card__img--hover"></div>
                </div>
            </Link>
            <div className="card__info">
                <h3 className="card__title">{title}</h3>
                <span className="card__category">{category}</span>

                <p className="card__teaser">{truncatedTeaser}</p>
                <div className="card__icons">
                    <Link to={projectLink} className="card__icon" title="Read More">
                        <FontAwesomeIcon icon={faBook} />
                    </Link>
                    <a href={sourceURL} className="card__icon" title="Source" target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faGithub} />
                    </a>
                    <a href={demoURL} className="card__icon" title="Demo" target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
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

export default Card;
