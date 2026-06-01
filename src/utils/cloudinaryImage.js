/**
 * cloudinaryImage.js
 *
 * Utilities for building optimised Cloudinary URLs and srcset strings.
 *
 * Usage:
 *   import { cloudinarySrc, cloudinarySrcSet } from '../utils/cloudinaryImage';
 *
 *   // Single optimised URL (auto format + quality, capped at a given width)
 *   <img src={cloudinarySrc(rawUrl, { width: 800 })} alt="..." loading="lazy" decoding="async" />
 *
 *   // Responsive srcset + sizes for card grids
 *   <img
 *     src={cloudinarySrc(rawUrl, { width: 400 })}
 *     srcSet={cloudinarySrcSet(rawUrl, [320, 640, 960, 1280])}
 *     sizes="(max-width: 768px) 100vw, 33vw"
 *     loading="lazy"
 *     decoding="async"
 *   />
 */

const CLOUDINARY_ORIGIN = 'res.cloudinary.com';

/**
 * Returns true if the URL is served from Cloudinary.
 * @param {string} url
 * @returns {boolean}
 */
function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes(CLOUDINARY_ORIGIN);
}

/**
 * Inject Cloudinary transformation parameters into a URL.
 *
 * Cloudinary URL anatomy:
 *   https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<path>
 *
 * We insert our transforms right after "/upload/", before any existing
 * transform segments that the CMS may have already included.
 *
 * @param {string} url   - Raw Cloudinary URL from the CMS
 * @param {object} opts
 * @param {number}  [opts.width]   - Pixel width for resizing (c_fill, w_<n>)
 * @param {string}  [opts.crop]    - Cloudinary crop mode (default: 'fill')
 * @param {string}  [opts.quality] - Quality override (default: 'auto')
 * @param {string}  [opts.format]  - Format override (default: 'auto')
 * @returns {string} Transformed URL, or original URL if not a Cloudinary URL
 */
export function cloudinarySrc(url, opts = {}) {
  if (!isCloudinaryUrl(url)) return url;

  const { width, crop = 'fill', quality = 'auto' } = opts;

  const transforms = ['f_auto', `q_${quality}`];
  if (width) transforms.push(`w_${width}`, `c_${crop}`);

  const transformStr = transforms.join(',');

  // Insert transforms after "/upload/" (before any existing transform or path)
  // Handle both versioned (v123456/) and non-versioned paths
  return url.replace(
    /\/upload\//,
    `/upload/${transformStr}/`
  );
}

/**
 * Build a srcset string for responsive images.
 *
 * @param {string}   url    - Raw Cloudinary URL from the CMS
 * @param {number[]} widths - Array of pixel widths to generate descriptors for
 * @param {object}   opts   - Same options as cloudinarySrc (excluding width)
 * @returns {string} A comma-separated srcset string, e.g. "url 320w, url 640w"
 */
export function cloudinarySrcSet(url, widths = [320, 640, 960, 1280], opts = {}) {
  if (!isCloudinaryUrl(url)) return '';
  return widths
    .map(w => `${cloudinarySrc(url, { ...opts, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Standard sizes attribute for card grids.
 * Pass to <img sizes> on thumbnail images.
 */
export const CARD_SIZES = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw';

/**
 * Standard sizes attribute for full-width hero / banner images.
 */
export const HERO_SIZES = '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1280px';
