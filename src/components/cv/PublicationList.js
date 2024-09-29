import React from 'react';

const PublicationList = ({ publications }) => {
    // Log the received publications
    console.log('Publications received:', publications);

    // Check if publications is defined and has data
    if (!publications || !publications.data || !Array.isArray(publications.data)) {
        return <p>No publications available.</p>; // Handle no publications case
    }

    return (
        <section className="publications">
            <h2>Publications</h2>
            <ul>
                {publications.data.length > 0 ? (
                    publications.data.map((publication) => {
                        console.log('Publication item:', publication); // Log each publication item

                        const { id, attributes } = publication;
                        const {
                            Title,
                            publication: publicationDate, // Ensure this matches your data structure
                            publisher,
                            abstract,
                            DOI,
                            Type,
                            peerReviewed,
                            Language,
                            Authors,
                        } = attributes;

                        // Log all publication attributes
                        console.log(Title, publicationDate, publisher, abstract, DOI, Type, peerReviewed, Language, Authors);

                        // Prepare author names in APA style format
                        const authorNames = Authors
                            .sort((a, b) => a.order - b.order) // Sort authors by their order
                            .map((author) => `${author.lastName}, ${author.firstName}`)
                            .join(", ");

                        return (
                            <li key={id}>
                                <p>
                                    {authorNames} ({new Date(publicationDate).getFullYear()}). <i>{Title}</i>. {publisher}.
                                    {DOI && (
                                        <>
                                            {" "}
                                            <a href={`https://doi.org/${DOI}`} target="_blank" rel="noopener noreferrer">
                                                https://doi.org/{DOI}
                                            </a>
                                        </>
                                    )}
                                </p>
                                {abstract && <p><strong>Abstract:</strong> {abstract}</p>}
                                {Type && <p><strong>Type:</strong> {Type}</p>}
                                <p><strong>Language:</strong> {Language}</p>
                                <p><strong>Peer Reviewed:</strong> {peerReviewed ? "Yes" : "No"}</p>
                            </li>
                        );
                    })
                ) : (
                    <p>No publications available.</p> // If there are no publications
                )}
            </ul>
        </section>
    );
};

export default PublicationList;
