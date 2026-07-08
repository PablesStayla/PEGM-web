import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadingSpinner } from './loading';

describe('LoadingSpinner Component - Enterprise Level', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders spinner with default size', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('renders spinner with small size', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders spinner with large size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('has proper base styling and animations', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-green-600',
    );
  });

  it('supports inline rendering with other elements', () => {
    render(
      <div className="flex items-center space-x-2">
        <LoadingSpinner data-testid="spinner-inline" />
        <span>Loading data...</span>
      </div>,
    );

    expect(screen.getByTestId('spinner-inline')).toBeInTheDocument();
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });
});
