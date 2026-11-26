import { render, screen } from '@testing-library/react';
import ProjectSite, { frameUrl } from './ProjectSite';

// In the app the CMS address comes from the environment. Here it is fixed.
jest.mock('../api/cms', () => ({
  cmsUrl: (url) => (url.startsWith('/') ? `https://cms.test${url}` : url),
}));

const bundle = {
  type: 'bundle',
  url: 'https://sites.example.com/sites/abc123/',
  sandbox: 'allow-same-origin allow-scripts allow-popups',
};

test('shows the page inside the site with the sandbox the CMS chose, and no link out', () => {
  render(<ProjectSite site={bundle} title="Vit by Bit" />);
  const frame = screen.getByTitle('Vit by Bit report');
  expect(frame).toHaveAttribute('src', bundle.url);
  expect(frame).toHaveAttribute('sandbox', bundle.sandbox);
  expect(screen.queryByRole('link')).toBeNull();
});

test('a path on the CMS host is resolved against the CMS address', () => {
  expect(frameUrl({ url: '/sites/abc123/' }, 'https:')).toBe('https://cms.test/sites/abc123/');
});

test('an http address is upgraded on an https page, and left alone on an http one', () => {
  const site = { url: 'http://cms.wanghley.com/sites/abc123/' };
  expect(frameUrl(site, 'https:')).toBe('https://cms.wanghley.com/sites/abc123/');
  expect(frameUrl(site, 'http:')).toBe('http://cms.wanghley.com/sites/abc123/');
});

test('falls back to a strict sandbox, never to none', () => {
  render(<ProjectSite site={{ type: 'embed', url: 'https://wanghley.github.io/x/' }} title="X" />);
  const sandbox = screen.getByTitle('X report').getAttribute('sandbox');
  expect(sandbox).toContain('allow-scripts');
  expect(sandbox).not.toContain('allow-same-origin');
});

test.each([
  ['no site', null],
  ['an empty site', {}],
  ['a javascript: address', { url: 'javascript:alert(1)', sandbox: 'allow-scripts' }],
  ['a data: address', { url: 'data:text/html,<p>x</p>' }],
])('renders nothing for %s', (_name, site) => {
  const { container } = render(<ProjectSite site={site} title="X" />);
  expect(container).toBeEmptyDOMElement();
});
