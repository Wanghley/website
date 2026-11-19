// Typed reads for the site's own content: the home page, the about article,
// contact details, places, affiliations and the CV page. Each one is a single
// request per page load (see cms.js).
import { fetchSingle, fetchCollection, fetchPage } from './cms';

export const fetchHomePage = () => fetchSingle('home-page', { populate: '*' });
export const fetchSiteSettings = () => fetchSingle('site-settings', { populate: '*' });
export const fetchCvPage = () => fetchSingle('cv-page');
export const fetchAboutArticle = () => fetchSingle('about');
export const fetchPersonalInfo = () => fetchSingle('personal-information', { populate: '*' });

export const fetchPlaces = () => fetchCollection('places', { sort: 'sortOrder:asc' });
export const fetchAffiliations = () => fetchCollection('affiliations', { sort: 'sortOrder:asc', populate: 'logo' });

export const fetchFeaturedProjects = (count) => fetchPage('projects', {
  'filters[featured][$eq]': true,
  sort: 'sortOrder:asc',
  'pagination[pageSize]': count,
  populate: '*',
});

export const fetchFeaturedSkills = () => fetchCollection('skills', {
  'filters[featured][$eq]': true,
  populate: '*',
});

export const fetchRecentPosts = (count) => fetchPage('blog-posts', {
  sort: 'date:desc',
  'pagination[pageSize]': count,
  populate: '*',
});

// Lists for the CV and the list pages. Every entry, newest first.
export const fetchEducations = () => fetchCollection('educations', { sort: 'startDate:desc', populate: '*' });
export const fetchExperiences = () => fetchCollection('experiences', { sort: 'startDate:desc', populate: '*' });
export const fetchCertifications = () => fetchCollection('certifications', { sort: 'issuedDate:desc', populate: '*' });
export const fetchPublications = () => fetchCollection('publications', { sort: 'publishedDate:desc', populate: '*' });
export const fetchAllProjects = () => fetchCollection('projects', { sort: 'startDate:desc', populate: '*' });
export const fetchAllPosts = () => fetchCollection('blog-posts', { sort: 'date:desc', populate: '*' });
export const fetchAllSkills = () => fetchCollection('skills', { sort: 'name:asc', populate: '*' });
