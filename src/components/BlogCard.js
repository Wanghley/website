import React from 'react';
import PropTypes from 'prop-types';
import './css/Card.css';
import './css/BlogCard.css';
import { Link } from 'react-router-dom';

const BlogCard = ({
    imageUrl,
    title,
    date,
    teaser,
    slug,
    content = '',
    categories = []
}) => {
    const truncatedTeaser = truncateText(teaser, 100);
    const blogLink = `${slug}`;
    const displayedCategories = categories.slice(0, 3).join(', '); // Join categories with comma

    return (
        <article className="cardblog">
            <Link to={blogLink} className="cardblog__link">
                <div className="cardblog__img" style={{ backgroundImage: `url(${imageUrl})` }}>
                    <div className="cardblog__date">{formatDate(date)}</div>
                {categories.length > 0 && (
                    <div className="cardblog__categories">
                        <p className="cardblog__categories-text">{displayedCategories}</p>
                    </div>
                )}
                </div>
            </Link>
            <div className="cardblog__info">
                <Link to={blogLink} className="cardblog__icon" title="Read Full Post">
                    <h3 className="cardblog__title">{title}</h3>
                </Link>
                <p className="cardblog__teaser">{truncatedTeaser}</p>
            </div>
        </article>
    );
}

const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
};

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

BlogCard.propTypes = {
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    teaser: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    content: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string)
};

export default BlogCard;
