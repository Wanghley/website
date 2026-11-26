import { render, screen } from '@testing-library/react';
import ProjectReport from './ProjectReport';

const realFetch = global.fetch;
afterEach(() => { global.fetch = realFetch; });

test('shows the uploaded report inside the page, in a sandbox, with no link to where it is stored', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => '<h1>Results</h1>' });
  render(<ProjectReport url="https://cms.example.com/uploads/report.html" title="StepDrop" />);

  expect(screen.getByRole('status')).toHaveTextContent(/loading the report/i);
  const frame = await screen.findByTitle('StepDrop report');
  expect(frame).toHaveAttribute('srcdoc', '<h1>Results</h1>');
  expect(frame.getAttribute('sandbox')).not.toContain('allow-same-origin');
  expect(screen.queryByRole('link')).toBeNull();
});

test('when the report cannot be fetched it says so, without a link out', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
  render(<ProjectReport url="https://cms.example.com/uploads/gone.html" title="StepDrop" />);

  expect(await screen.findByText(/did not load/i)).toBeInTheDocument();
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.queryByTitle('StepDrop report')).toBeNull();
});
