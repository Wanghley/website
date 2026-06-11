import React from 'react';

// Abbreviates a given name to initials, e.g. "Wanghley Soares" -> "W.S."
const formatInitials = (firstName = '') =>
    firstName
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + '.')
        .join('');

const isCvOwner = (author) =>
    author.lastName?.toLowerCase().includes('martins') &&
    author.firstName?.trim().charAt(0).toLowerCase() === 'w';

// "2025-08-09" -> "Aug 2025"; falls back to just the year if no month is present
const formatPublicationDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    if (!month) return year;
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
    });
};

const PublicationList = ({ publications }) => {
    if (!publications || publications.length === 0) {
        return (
            <section className="publications">
                <h2>Publications</h2>
                <p className="publications-empty">No publications available.</p>
            </section>
        );
    }

    return (
        <section className="publications">
            <h2>Publications</h2>
            <ul>
                {publications.map((publication, index) => {
                    const {
                        Title,
                        Type,
                        publication: pubDate,
                        publisher,
                        DOI,
                        Authors = [],
                        peerReviewed,
                    } = publication.attributes;

                    return (
                        <li key={publication.id ?? index} className="publication-item">
                            <span className="publication-index">{index + 1}</span>
                            <div className="publication-content">
                                <div className="publication-header">
                                    <h3>{Title}</h3>
                                    {pubDate && <span className="publication-date">{formatPublicationDate(pubDate)}</span>}
                                </div>

                                {Authors.length > 0 && (
                                    <p className="authors">
                                        {Authors.map((author, idx) => (
                                            <span
                                                key={author.id ?? idx}
                                                className={isCvOwner(author) ? 'author author--self' : 'author'}
                                            >
                                                {author.lastName}, {formatInitials(author.firstName)}
                                                {idx < Authors.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </p>
                                )}

                                <div className="publication-meta">
                                    {publisher && <span className="venue">{publisher}</span>}
                                    {Type && <span className="pub-type">{Type}</span>}
                                    {peerReviewed && <span className="peer-badge">Peer-Reviewed</span>}
                                </div>

                                {DOI && (
                                    <a
                                        href={`https://doi.org/${DOI}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="doi-link"
                                    >
                                        DOI: {DOI}
                                    </a>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default PublicationList;
