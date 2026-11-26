import React from 'react';

// Used when the CMS does not say. An iframe with no sandbox attribute has no
// sandbox at all, so the fallback is the strictest set that still runs scripts.
const STRICT_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';

// A rendered Quarto page for a project: the zip the CMS unpacks and serves
// (`site.type` "bundle"), or a page hosted elsewhere such as GitHub Pages
// ("embed"). The CMS decides the `sandbox` value, because it depends on where
// the page is served from: a page on the CMS host must not share its origin.
export default function ProjectSite({ site, title }) {
  // Only web addresses go into the frame. The CMS already checks this on save.
  if (!site?.url || !/^https?:\/\//i.test(site.url)) return null;

  return (
    <section className="article-section" id="site" aria-labelledby="article-site-title">
      <h2 id="article-site-title" className="article-section__title">Full write-up</h2>
      <iframe
        title={`${title} write-up`}
        src={site.url}
        sandbox={site.sandbox || STRICT_SANDBOX}
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{ width: '100%', height: '80vh', border: 0, display: 'block' }}
      />
      <p>
        <a className="bp-link" href={site.url} target="_blank" rel="noopener noreferrer">
          Open it in its own tab
        </a>
      </p>
    </section>
  );
}
