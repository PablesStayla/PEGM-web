import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExportDialog } from './shared/ExportDialog';

describe('ExportDialog', () => {
  const mockData = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
  ];

  it('should render dialog trigger', () => {
    render(<ExportDialog data={mockData} onExport={vi.fn()} />);
    expect(screen.getByText(/export/i)).toBeTruthy();
  });

  it('should open dialog on trigger click', async () => {
    render(<ExportDialog data={mockData} onExport={vi.fn()} />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Dialog should be open
    expect(screen.getByText(/choose a format/i)).toBeTruthy();
  });

  it('should show format options', async () => {
    render(<ExportDialog data={mockData} onExport={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));

    // Using getAllByText for multiple matches
    const csvElements = screen.getAllByText(/csv/i);
    expect(csvElements.length).toBeGreaterThan(0);
  });
});
