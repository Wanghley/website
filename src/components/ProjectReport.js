import React, { useEffect, useState } from 'react';

// A self-contained HTML report uploaded to the CMS. The page fetches the file
// and shows it in a sandboxed frame: its scripts run, but it cannot reach the
// site's cookies, storage or parent page.
export default function ProjectReport({ url, title }) {
  const [html, setHtml] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => { if (alive) setHtml(text); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [url]);

  return (
    <section className="article-section" id="report" aria-labelledby="article-report-title">
      <h2 id="article-report-title" className="article-section__title">Full report</h2>
      {html && (
        <iframe
          title={`${title} report`}
          srcDoc={html}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          style={{ width: '100%', height: '80vh', border: 0, display: 'block' }}
        />
      )}
      {!html && !failed && <p>Loading the report.</p>}
      {failed && <p>The report did not load. <a className="bp-link" href={url} target="_blank" rel="noopener noreferrer">Open it directly</a>.</p>}
      <p><a className="bp-link" href={url} target="_blank" rel="noopener noreferrer">Download the HTML</a></p>
    </section>
  );
}
