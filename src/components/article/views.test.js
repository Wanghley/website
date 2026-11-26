import { projectViews, pickView } from './views';

const ids = (views) => views.map((view) => view.id);

describe('projectViews', () => {
  test('text only: just the overview, no choice to make', () => {
    expect(ids(projectViews({ hasOverview: true, hasSite: false, hasReport: false }))).toEqual(['overview']);
  });

  test('text and a Quarto page: overview first, then a plain "Report"', () => {
    const views = projectViews({ hasOverview: true, hasSite: true, hasReport: false });
    expect(views).toEqual([
      { id: 'overview', label: 'Overview', slug: 'overview' },
      { id: 'site', label: 'Report', slug: 'report' },
    ]);
  });

  test('text and an uploaded HTML report', () => {
    const views = projectViews({ hasOverview: true, hasSite: false, hasReport: true });
    expect(views.map((view) => view.label)).toEqual(['Overview', 'Report']);
  });

  test('both kinds of report get told apart', () => {
    const views = projectViews({ hasOverview: true, hasSite: true, hasReport: true });
    expect(views.map((view) => view.label)).toEqual(['Overview', 'Interactive report', 'Static report']);
    expect(views.map((view) => view.slug)).toEqual(['overview', 'interactive-report', 'static-report']);
  });

  test('a report and no text: only the report', () => {
    expect(ids(projectViews({ hasOverview: false, hasSite: true, hasReport: false }))).toEqual(['site']);
  });

  test('nothing at all keeps the page it always had', () => {
    expect(ids(projectViews({ hasOverview: false, hasSite: false, hasReport: false }))).toEqual(['overview']);
  });
});

describe('pickView', () => {
  const views = projectViews({ hasOverview: true, hasSite: true, hasReport: false });

  test('shows the text unless a report is asked for', () => {
    expect(pickView(views, null)).toBe('overview');
    expect(pickView(views, undefined)).toBe('overview');
  });

  test('honours a view the project has, by the name in the address', () => {
    expect(pickView(views, 'report')).toBe('site');
  });

  test('ignores a view the project does not have, an internal id, or nonsense', () => {
    expect(pickView(views, 'static-report')).toBe('overview');
    expect(pickView(views, 'site')).toBe('overview');
    expect(pickView(views, '__proto__')).toBe('overview');
    expect(pickView(views, '')).toBe('overview');
  });

  test('with both reports, each has its own address', () => {
    const both = projectViews({ hasOverview: true, hasSite: true, hasReport: true });
    expect(pickView(both, 'interactive-report')).toBe('site');
    expect(pickView(both, 'static-report')).toBe('report');
    expect(pickView(both, 'report')).toBe('overview');
  });

  test('with no text, the report is what shows', () => {
    const reportOnly = projectViews({ hasOverview: false, hasSite: true, hasReport: false });
    expect(pickView(reportOnly, null)).toBe('site');
  });
});
