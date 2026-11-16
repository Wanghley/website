import React from 'react';
import { cmsUrl } from '../../api/cms';

export const slugify = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Plain text of rendered markdown children, so a heading with emphasis or inline
// code still gets the same anchor the table of contents links to.
export const textOf = (node) => React.Children.toArray(node)
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : textOf(c?.props?.children)))
    .join('');

// The # to ### headings of a markdown document, with the anchor each one gets and
// `depth`, the h-level it is rendered at. The page's own title is the h1, so the
// shallowest heading is an h2, and no heading sits more than one level below the
// one before it (which would skip a level for screen readers). Lines inside
// fenced code are skipped: a `# comment` there is not a heading.
export const extractHeadings = (markdown) => {
    const headings = [];
    let inFence = false;
    (markdown || '').split('\n').forEach((line) => {
        if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return; }
        if (inFence) return;
        const match = line.match(/^(#{1,3})\s+(.*)/);
        if (match) {
            const text = match[2].trim();
            headings.push({ level: match[1].length, text, id: slugify(text) });
        }
    });
    const base = headings.length ? Math.min(...headings.map((h) => h.level)) : 2;
    let previous = 1;
    headings.forEach((h) => {
        h.depth = Math.max(2, Math.min(h.level + 2 - base, previous + 1));
        previous = h.depth;
    });
    return headings;
};

export const calculateReadingTime = (text) => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

// The best CMS rendition of an image, with its size so the page does not jump
// when it loads.
export const pickImage = (media, order = ['large', 'medium', 'small']) => {
    for (const key of order) {
        const f = media?.formats?.[key];
        if (f?.url) return { url: cmsUrl(f.url), width: f.width, height: f.height };
    }
    return media?.url ? { url: cmsUrl(media.url), width: media.width, height: media.height } : null;
};
