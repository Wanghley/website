// src/utils/formatDate.js

// The CMS sends date-only values ("2024-01-01"). new Date() reads those as UTC
// midnight, which is the evening before in every US timezone, so a January
// start rendered as December. Read the parts instead; full timestamps are
// real instants and go through new Date() as before.
const toDate = (value) => {
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(value ?? '').trim());
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3] || 1)) : new Date(value);
};

export const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return toDate(dateString).toLocaleDateString(undefined, options);
};

// "Jan 2024": for ranges where the day does not matter (CV, certifications).
export const formatMonth = (dateString) => {
    const options = { month: 'short', year: 'numeric' };
    return toDate(dateString).toLocaleDateString('en-US', options);
};
