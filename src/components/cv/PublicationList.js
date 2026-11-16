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
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const PublicationList = ({ publications }) => {
  const empty = !publications || publications.length === 0;

  return (
    <>
      <h2 className="cv-section__title">Publications</h2>
      {empty ? (
        <p className="cv-empty">No publications listed yet.</p>
      ) : (
        <ol className="cv-list cv-pubs">
          {publications.map((publication, index) => {
            const { title, type, publishedDate, venue, doi, authors = [], peerReviewed } = publication;
            const meta = [venue, type, peerReviewed && 'Peer-reviewed'].filter(Boolean);
            const ordered = [...authors].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            return (
              <li key={publication.documentId ?? index} className="cv-pub">
                <span className="cv-pub__n" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="cv-pub__title">{title}</h3>
                  {ordered.length > 0 && (
                    <p className="cv-pub__authors">
                      {ordered.map((author, idx) => (
                        <span key={author.id ?? idx} className={isCvOwner(author) ? 'cv-pub__me' : undefined}>
                          {author.lastName}, {formatInitials(author.firstName)}
                          {idx < ordered.length - 1 ? '; ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="cv-pub__meta">
                    {[publishedDate && formatPublicationDate(publishedDate), ...meta].filter(Boolean).join(' · ')}
                  </p>
                  {doi && (
                    <a className="bp-link cv-pub__doi" href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">
                      doi.org/{doi}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
};

export default PublicationList;
