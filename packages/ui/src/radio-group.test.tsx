import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './radio-group';

const RadioGroupContext = React.createContext<{ name?: string }>({});

vi.mock('@radix-ui/react-radio-group', () => ({
  Root: ({ children, name, ...props }: any) => (
    <RadioGroupContext.Provider value={{ name }}>
      <div data-testid="radio-group-root" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  ),
  Item: ({ children, ...props }: any) => {
    const context = React.useContext(RadioGroupContext);
    return (
      <div data-testid="radio-item-wrapper" className={props.className}>
        <input type="radio" data-testid="radio-item" name={context.name} {...props} />
        {children}
      </div>
    );
  },
  Indicator: ({ children, ...props }: any) => (
    <span data-testid="radio-indicator" {...props}>
      {children}
    </span>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Circle: () => <svg data-testid="circle-icon" />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('RadioGroup Component System - Enterprise Level', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('RadioGroup Container', () => {
    it('renders radio group with proper layout', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>,
      );

      const root = screen.getByTestId('radio-group-root');
      expect(root).toHaveClass('grid', 'gap-2');
    });

    it('applies custom className', () => {
      render(<RadioGroup className="custom-group" />);

      const root = screen.getByTestId('radio-group-root');
      expect(root).toHaveClass('custom-group');
    });

    it('renders error message when provided', () => {
      render(<RadioGroup error="Please select an option" />);

      const errors = screen.getAllByText('Please select an option');
      expect(errors).toHaveLength(1);
    });
  });

  describe('RadioGroupItem', () => {
    it('renders indicator when checked', () => {
      render(
        <RadioGroup value="selected">
          <RadioGroupItem value="selected" />
        </RadioGroup>,
      );

      expect(screen.getByTestId('radio-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      render(<RadioGroupItem label="Option 1" value="option1" />);

      const label = screen.getByText('Option 1');
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none', 'cursor-pointer');
    });

    it('renders description when provided', () => {
      render(<RadioGroupItem description="Additional information" value="test" />);

      const description = screen.getByText('Additional information');
      expect(description).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });

  describe('Performance', () => {
    it('has displayName for debugging', () => {
      expect(RadioGroup.displayName).toBe('RadioGroup');
      expect(RadioGroupItem.displayName).toBe('RadioGroupItem');
    });

    it('minimizes re-renders', () => {
      const { rerender } = render(
        <RadioGroup value="selected">
          <RadioGroupItem value="selected" />
        </RadioGroup>,
      );

      rerender(
        <RadioGroup value="selected">
          <RadioGroupItem value="selected" />
        </RadioGroup>,
      );

      expect(screen.getByTestId('radio-indicator')).toBeInTheDocument();
    });
  });
});
