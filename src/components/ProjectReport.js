import React, { useEffect, useState } from 'react';

// A self-contained HTML report uploaded to the CMS. The page fetches the file
// and shows it in a sandboxed frame inside the page: its scripts run, but it
// cannot reach the site's cookies, storage or parent page. There is no link out
// to where the file is stored.
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

  if (failed) return <p className="article-frame-note" role="status">The report did not load. Try again in a moment.</p>;
  if (html === null) return <p className="article-frame-note" role="status">Loading the report.</p>;

  return (
    <iframe
      className="article-frame"
      title={`${title} report`}
      srcDoc={html}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
    />
  );
}
