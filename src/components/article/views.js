// Which views a project page offers, and which one is showing.
//
//   overview  the written text, with the video and gallery
//   site      an interactive Quarto page (a zip served by the CMS, or a link)
//   report    an uploaded HTML report
//
// The overview comes first, so it is what a visitor sees unless they pick a
// report. A project with only a report shows just the report, and a project
// with neither keeps the page it always had.
//
// Each view has an `id` (internal) and a `slug`, the value in the address
// (?view=report). The slug matches the label a visitor sees, so a shared link
// reads the way the tab does.

export function projectViews({ hasOverview, hasSite, hasReport }) {
  // Two reports side by side need telling apart; one is just "Report".
  const siteLabel = hasReport ? 'Interactive report' : 'Report';
  const reportLabel = hasSite ? 'Static report' : 'Report';

  const views = [];
  if (hasOverview) views.push({ id: 'overview', label: 'Overview', slug: 'overview' });
  if (hasSite) views.push({ id: 'site', label: siteLabel, slug: hasReport ? 'interactive-report' : 'report' });
  if (hasReport) views.push({ id: 'report', label: reportLabel, slug: hasSite ? 'static-report' : 'report' });
  return views.length > 0 ? views : [{ id: 'overview', label: 'Overview', slug: 'overview' }];
}

// The id of the view named in the address (?view=report), if the project has it,
// else the first one.
export function pickView(views, requestedSlug) {
  return views.find((view) => view.slug === requestedSlug)?.id ?? views[0].id;
}
