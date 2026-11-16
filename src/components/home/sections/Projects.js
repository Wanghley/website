import React from 'react';
import { fetchFeaturedProjects, fetchHomePage } from '../../../api/site';
import { mediaUrl } from '../../../api/cms';
import useCmsData from '../../../hooks/useCmsData';
import { BenchCard, BenchCards } from '../../bench';

// Featured projects, in the order the CMS sets (`sortOrder`), capped at the
// count the home page sets. Featuring a project is a CMS choice, not a code list.
const load = () => fetchHomePage().then(async (home) => {
  const count = home.projectsCount || 6;
  const { data } = await fetchFeaturedProjects(count);
  return { home, projects: data };
});

export default function Projects() {
  const { status, data } = useCmsData(load);
  if (status !== 'ready' || !data || !data.projects.length) return null;

  return (
    <section id="work" tabIndex={-1} className="bp-sec" aria-labelledby="work-heading">
      <div className="bench-col">
        <h2 id="work-heading" className="bp-sec__title">{data.home.projectsHeading}</h2>
        <BenchCards>
          {data.projects.map((p) => (
            <BenchCard
              key={p.documentId}
              href={`/projects/${p.slug}`}
              title={p.title}
              text={p.summary || ''}
              image={mediaUrl(p.cover)}
            />
          ))}
        </BenchCards>
        <p className="bp-sec__more"><a className="bp-link" href="/projects">All projects <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
