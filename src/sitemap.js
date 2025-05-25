const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream, promises: fs } = require('fs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;
const SITE_URL = 'https://wanghley.com';
const PUBLIC_DIR = './public';

// Configuration for different content types
const CONTENT_TYPES = {
  static: {
    changefreq: 'daily',
    priority: 1.0,
    routes: [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/about', priority: 0.7, changefreq: 'monthly' },
      { url: '/curriculum-vitae', priority: 0.7, changefreq: 'monthly' },
      { url: '/contact', priority: 0.5, changefreq: 'monthly' }
    ]
  },
  blogs: {
    changefreq: 'weekly',
    priority: 0.8,
    filename: 'sitemap-blog.xml'
  },
  projects: {
    changefreq: 'weekly',
    priority: 0.8,
    filename: 'sitemap-projects.xml'
  }
};

async function fetchDynamicRoutes(endpoint) {
    try {
        const response = await axios.get(`${baseURL}/api/${endpoint}?populate=*`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        
        return response.data.data.map((item) => ({
            url: `/${endpoint}/${item.attributes.slug}`,
            changefreq: CONTENT_TYPES[endpoint].changefreq,
            priority: CONTENT_TYPES[endpoint].priority,
            lastmod: item.attributes.updatedAt,
            img: item.attributes.featuredImage?.url ? [{
                url: item.attributes.featuredImage.url,
                caption: item.attributes.title
            }] : undefined
        }));
    } catch (error) {
        console.error(`Error fetching ${endpoint} routes:`, error);
        return [];
    }
}

async function generateSitemapFile(routes, filename) {
    const stream = new SitemapStream({ hostname: SITE_URL });
    routes.forEach(route => stream.write(route));
    stream.end();

    const data = await streamToPromise(stream);
    const filepath = path.join(PUBLIC_DIR, filename);
    await fs.writeFile(filepath, data);
    console.log(`Generated ${filename}`);
    return filename;
}

async function generateSitemapIndex(sitemaps) {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${sitemaps.map(filename => `
        <sitemap>
            <loc>${SITE_URL}/${filename}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
        </sitemap>`).join('')}
    </sitemapindex>`;

    const indexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    await fs.writeFile(indexPath, sitemapIndex);
    console.log('Generated sitemap index');
}

async function generateSitemaps() {
    try {
        // Ensure public directory exists
        await fs.mkdir(PUBLIC_DIR, { recursive: true });

        const generatedSitemaps = [];

        // Generate static sitemap
        await generateSitemapFile(CONTENT_TYPES.static.routes, 'sitemap-static.xml');
        generatedSitemaps.push('sitemap-static.xml');

        // Generate dynamic sitemaps
        const dynamicTypes = ['blogs', 'projects'];
        for (const type of dynamicTypes) {
            const routes = await fetchDynamicRoutes(type);
            if (routes.length > 0) {
                const filename = CONTENT_TYPES[type].filename;
                await generateSitemapFile(routes, filename);
                generatedSitemaps.push(filename);
            }
        }

        // Generate sitemap index
        await generateSitemapIndex(generatedSitemaps);

    } catch (error) {
        console.error('Error generating sitemaps:', error);
        process.exit(1);
    }
}

// Execute the sitemap generation
generateSitemaps();