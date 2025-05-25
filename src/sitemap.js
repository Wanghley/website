const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

async function fetchDynamicRoutes(endpoint) {
    try {
        const response = await axios.get(`${baseURL}/api/${endpoint}?populate=*`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        return response.data.data.map((item) => ({
            url: `/${endpoint}/${item.attributes.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: item.attributes.updatedAt // Add last modification date
        }));
    } catch (error) {
        console.error(`Error fetching ${endpoint} routes:`, error);
        return [];
    }
}

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://wanghley.com' });

  // Static routes
  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.7 });
  sitemap.write({ url: '/curriculum-vitae', changefreq: 'monthly', priority: 0.7 });

  // Dynamic routes
  const blogRoutes = await fetchDynamicRoutes('blogs');
  const projectRoutes = await fetchDynamicRoutes('projects');

  blogRoutes.forEach((route) => sitemap.write(route));
  projectRoutes.forEach((route) => sitemap.write(route));

  sitemap.end();

  // Write sitemap to file
  const sitemapPath = './public/sitemap.xml';
  streamToPromise(sitemap)
    .then((data) => {
      createWriteStream(sitemapPath).write(data);
      console.log(`Sitemap generated at ${sitemapPath}`);
    })
    .catch((error) => console.error('Error generating sitemap:', error));
}

const generateSitemapIndex = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
            <loc>https://wanghley.com/sitemap-static.xml</loc>
        </sitemap>
        <sitemap>
            <loc>https://wanghley.com/sitemap-blog.xml</loc>
        </sitemap>
        <sitemap>
            <loc>https://wanghley.com/sitemap-projects.xml</loc>
        </sitemap>
    </sitemapindex>`;
};

generateSitemap();