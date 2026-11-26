import { render, screen } from '@testing-library/react';
import ProjectSite from './ProjectSite';

const bundle = {
  type: 'bundle',
  url: 'https://sites.example.com/sites/abc123/',
  sandbox: 'allow-same-origin allow-scripts allow-popups',
};

test('shows the page in a frame with the sandbox the CMS chose', () => {
  render(<ProjectSite site={bundle} title="Vit by Bit" />);
  const frame = screen.getByTitle('Vit by Bit write-up');
  expect(frame).toHaveAttribute('src', bundle.url);
  expect(frame).toHaveAttribute('sandbox', bundle.sandbox);
  expect(screen.getByRole('link', { name: /own tab/i })).toHaveAttribute('href', bundle.url);
});

test('falls back to a strict sandbox, never to none', () => {
  render(<ProjectSite site={{ type: 'embed', url: 'https://wanghley.github.io/x/' }} title="X" />);
  const sandbox = screen.getByTitle('X write-up').getAttribute('sandbox');
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
