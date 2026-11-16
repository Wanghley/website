// The one place the site talks to the CMS (Strapi 5, flat responses).
//
//   collection  { data: [{ id, documentId, ...fields }], meta: { pagination } }
//   single      { data: { id, documentId, ...fields } }
//   media       { url, formats: { thumbnail, small, medium, large }, ... }
//
// Every request is memoized for the life of the page, so the navbar, footer and
// home sections that all read the same single type share one request.
import axios from 'axios';

const BASE = (process.env.REACT_APP_cms_base_url || '').replace(/\/$/, '');
const TOKEN = process.env.REACT_APP_cms_api_token;

const http = axios.create({
  baseURL: BASE,
  headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
});

const cache = new Map();

function memo(key, load) {
  if (!cache.has(key)) {
    const pending = load().catch((err) => {
      cache.delete(key); // a failed request is retried on the next call
      throw err;
    });
    cache.set(key, pending);
  }
  return cache.get(key);
}

// Relative media paths (local uploads) are served by the CMS, not the site.
export function cmsUrl(url) {
  if (!url) return null;
  return url.startsWith('/') ? `${BASE}${url}` : url;
}

// The best rendition of a media object, or the original when none is generated.
export function mediaUrl(media, order = ['medium', 'small', 'large']) {
  if (!media) return null;
  for (const key of order) {
    const url = media.formats?.[key]?.url;
    if (url) return cmsUrl(url);
  }
  return cmsUrl(media.url);
}

// One page of a collection, with its pagination meta.
export function fetchPage(endpoint, params = {}) {
  return memo(`page:${endpoint}:${JSON.stringify(params)}`, async () => {
    const { data } = await http.get(`/api/${endpoint}`, { params });
    return { data: data.data || [], meta: data.meta || null };
  });
}

// Every entry of a collection, walking the pages with meta.pagination.pageCount.
export function fetchCollection(endpoint, params = {}) {
  return memo(`all:${endpoint}:${JSON.stringify(params)}`, async () => {
    const rows = [];
    let page = 1;
    let pageCount = 1;
    do {
      const { data } = await http.get(`/api/${endpoint}`, {
        params: { ...params, 'pagination[page]': page, 'pagination[pageSize]': 100 },
      });
      rows.push(...(data.data || []));
      pageCount = data.meta?.pagination?.pageCount ?? 1;
      page += 1;
    } while (page <= pageCount);
    return rows;
  });
}

// A single type, or a collection's entry, as its object (not wrapped in data).
export function fetchSingle(endpoint, params = {}) {
  return memo(`single:${endpoint}:${JSON.stringify(params)}`, async () => {
    const { data } = await http.get(`/api/${endpoint}`, { params });
    return data.data;
  });
}
