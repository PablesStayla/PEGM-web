import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BulkActionsBar } from './shared/BulkActionsBar';

describe('BulkActionsBar', () => {
  it('should not render when no items selected', () => {
    const { container } = render(<BulkActionsBar selectedCount={0} onClearSelection={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when items are selected', () => {
    render(<BulkActionsBar selectedCount={5} onDelete={vi.fn()} onClearSelection={vi.fn()} />);
    expect(screen.getByText(/items selected/i)).toBeTruthy();
  });

  it('should show delete button when onDelete provided', () => {
    render(<BulkActionsBar selectedCount={3} onDelete={vi.fn()} onClearSelection={vi.fn()} />);
    expect(screen.getByText(/delete/i)).toBeTruthy();
  });
});
