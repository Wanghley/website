import React from 'react';

import '../css/PublicationList.css';

const PublicationList = ({ publications }) => {
    // Log the received publications
    console.log('Publications received:', publications);

    // Check if publications is defined and has data
    if (!publications) {
        return <p>No publications available.</p>; // Handle no publications case
    }

    return (
        <section className="publications">
            <h2>Publications</h2>
            <ul>
                {publications.map((publication, index) => (
                    <li key={index} className="publication-item">
                        <div className="publication-header">
                            <h3>{publication.attributes.Title}</h3>
                            <span className="journal">{publication.attributes.Type}</span>
                            <span className="publication-date">{publication.attributes.publication.split('-')[0]}</span>
                        </div>

                        <div className="authors">
                            {publication.attributes.Authors.map((author, idx) => (
                                <span key={idx}>
                                    {author.lastName}, {author.firstName.split(' ').map((name) => name[0] + '.').join('')}
                                    {idx < publication.attributes.Authors.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>

                        {publication.attributes.DOI && (
                            <a
                                href={`https://doi.org/${publication.attributes.DOI}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="doi-link"
                            >
                                doi.org/{publication.attributes.DOI}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </section>


    );
};

export default PublicationList;
