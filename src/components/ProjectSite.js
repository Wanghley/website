import React from 'react';
import { cmsUrl } from '../api/cms';

// Used when the CMS does not say. An iframe with no sandbox attribute has no
// sandbox at all, so the fallback is the strictest set that still runs scripts.
const STRICT_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';

// The address to put in the frame, or null if there is nothing safe to show.
//   - The CMS may give a path on its own host (/sites/<id>/): it is resolved
//     against the CMS address, the same as uploaded media.
//   - A page on https cannot frame http, so an http address is upgraded.
//   - Only web addresses are framed.
export function frameUrl(site, pageProtocol = window.location.protocol) {
  if (!site?.url) return null;
  const url = cmsUrl(site.url);
  if (!/^https?:\/\//i.test(url)) return null;
  return pageProtocol === 'https:' ? url.replace(/^http:\/\//i, 'https://') : url;
}

// A rendered Quarto page for a project, shown inside the page: a zip the CMS
// unpacks and serves (`site.type` "bundle"), or a page hosted elsewhere such as
// GitHub Pages ("embed"). The CMS decides the `sandbox` value, because it depends
// on where the page is served from: a page on the CMS host must not share its origin.
export default function ProjectSite({ site, title }) {
  const src = frameUrl(site);
  if (!src) return null;

  return (
    <iframe
      className="article-frame"
      title={`${title} report`}
      src={src}
      sandbox={site.sandbox || STRICT_SANDBOX}
      referrerPolicy="no-referrer"
    />
  );
}
