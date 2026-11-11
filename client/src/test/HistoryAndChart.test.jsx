import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import { HistoryGroups } from '../components/HistoryGroups.jsx';
import { TrendChart } from '../components/TrendChart.jsx';
const readings = [{id:1,date:'2024-10-15',slot:'morning',value:100},{id:2,date:'2024-10-15',slot:'after_lunch',value:130},{id:3,date:'2024-10-14',slot:'morning',value:110}];
it('groups history into separate date sections', () => {
  render(<HistoryGroups readings={readings} onEdit={vi.fn()} onDelete={vi.fn()} />);
  expect(screen.getAllByRole('region', {name:/Readings for/})).toHaveLength(2);
  expect(screen.getByText('2 of 4 slots recorded')).toBeInTheDocument();
});
it('reveals exact chart readings on click and keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<TrendChart readings={readings} />);
  const point = screen.getByRole('button',{name:/15 Oct 2024, After lunch, 130 mg/});
  await user.click(point);
  expect(screen.getByText('15 Oct 2024 · After lunch')).toBeInTheDocument();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('button',{name:/14 Oct 2024, Morning, 110 mg/})).toHaveFocus();
  expect(screen.getByText('14 Oct 2024 · Morning')).toBeInTheDocument();
});
