import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewSwitch from './ViewSwitch';

const views = [
  { id: 'overview', label: 'Overview' },
  { id: 'site', label: 'Interactive report' },
  { id: 'report', label: 'Static report' },
];

const setup = (active = 'overview') => {
  const onChange = jest.fn();
  render(<ViewSwitch views={views} active={active} onChange={onChange} />);
  return onChange;
};

test('is a tablist with one tab per view and the active one selected', () => {
  setup('site');
  expect(screen.getByRole('tablist', { name: /what to show/i })).toBeInTheDocument();
  const tabs = screen.getAllByRole('tab');
  expect(tabs.map((tab) => tab.textContent)).toEqual(['Overview', 'Interactive report', 'Static report']);
  expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
});

test('only the active tab is in the tab order, and each points at its panel', () => {
  setup('overview');
  const tabs = screen.getAllByRole('tab');
  expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
  expect(tabs[1]).toHaveAttribute('aria-controls', 'project-view-panel-site');
});

test('clicking a tab chooses that view', async () => {
  const onChange = setup('overview');
  await userEvent.click(screen.getByRole('tab', { name: 'Static report' }));
  expect(onChange).toHaveBeenCalledWith('report');
});

test('arrow keys, Home and End move between tabs, wrapping at the ends', async () => {
  const onChange = setup('overview');
  screen.getByRole('tab', { name: 'Overview' }).focus();

  await userEvent.keyboard('{ArrowRight}');
  expect(onChange).toHaveBeenLastCalledWith('site');
  expect(screen.getByRole('tab', { name: 'Interactive report' })).toHaveFocus();

  await userEvent.keyboard('{End}');
  expect(onChange).toHaveBeenLastCalledWith('report');

  await userEvent.keyboard('{ArrowRight}');
  expect(onChange).toHaveBeenLastCalledWith('overview');

  await userEvent.keyboard('{ArrowLeft}');
  expect(onChange).toHaveBeenLastCalledWith('report');

  await userEvent.keyboard('{Home}');
  expect(onChange).toHaveBeenLastCalledWith('overview');
});

test('other keys do nothing', async () => {
  const onChange = setup('overview');
  screen.getByRole('tab', { name: 'Overview' }).focus();
  await userEvent.keyboard('a');
  expect(onChange).not.toHaveBeenCalled();
});
