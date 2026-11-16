import { fetchHomePage, fetchSiteSettings } from '../api/site';
import useCmsData from './useCmsData';

// Contact details shared by the home page, /about, /curriculum-vitae and the
// error messages: the heading and "open to" line from the home page, the
// address and links from site settings.
const load = () => Promise.all([fetchHomePage(), fetchSiteSettings()]).then(([home, site]) => ({
  heading: home.contactHeading,
  open: home.contactOpenTo || site.openTo,
  email: site.contactEmail,
  links: (site.links || []).map((l) => ({ href: l.url, text: l.label })),
}));

export default function useContact() {
  return useCmsData(load);
}
