import React from 'react';
import './css/Card.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons from Font Awesome
import { faGithub } from '@fortawesome/free-brands-svg-icons'; // Import necessary icons from Font Awesome


const Card = ({ imageUrl, title, date, teaser, category }) => {
    return (
        <article className="card">
            <div className="card__img" style={{ backgroundImage: `url(${imageUrl})` }}>
                <div className="card__date">{date}</div>
                <a href="#" className="card_link">
                    <div className="card__img--hover"></div>
                </a>
            </div>
            <div className="card__info">
                <span className="card__category">{category}</span>
                <h3 className="card__title">{title}</h3>
                <p className="card__teaser">{teaser}</p>
                <div className="card__icons">
                    <a href="#" className="card__icon">
                        <FontAwesomeIcon icon={faGithub} /> Source{/* GitHub Icon */}
                    </a>
                    <a href="#" className="card__icon">
                        <FontAwesomeIcon icon={faExternalLinkAlt} /> Demo {/* Demo Icon */}
                    </a>
                </div>
            </div>
        </article>
    );
}

export default Card;