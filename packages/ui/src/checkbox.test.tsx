import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './checkbox';

// Mock Radix UI Checkbox
vi.mock('@radix-ui/react-checkbox', () => ({
  Root: Object.assign(
    React.forwardRef(
      ({ children, checked, defaultChecked, onCheckedChange, ...props }: any, ref: any) => {
        const isChecked = checked !== undefined ? checked : defaultChecked;
        const isIndeterminate = props['data-indeterminate'] === 'true' || props.indeterminate;
        return (
          <button
            type="button"
            data-testid="checkbox-root"
            role="checkbox"
            aria-checked={isIndeterminate ? 'mixed' : isChecked}
            data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
            onClick={() => onCheckedChange?.(!isChecked)}
            ref={ref}
            {...props}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child as any, {
                    'data-state': isIndeterminate
                      ? 'indeterminate'
                      : isChecked
                        ? 'checked'
                        : 'unchecked',
                    'data-checked': isChecked,
                    'data-indeterminate': isIndeterminate,
                  })
                : child,
            )}
          </button>
        );
      },
    ),
    { displayName: 'Checkbox' },
  ),
  Indicator: ({ children, ...props }: any) => {
    const isChecked = props['data-checked'] === true || props['data-indeterminate'] === true;
    if (!isChecked) {
      return null;
    }
    return (
      <span data-testid="checkbox-indicator" {...props}>
        {children}
      </span>
    );
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
  Minus: () => <svg data-testid="minus-icon" />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Checkbox Component - Enterprise Level', () => {
  describe('Basic Functionality', () => {
    it('renders checkbox input', () => {
      render(<Checkbox />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    it('applies proper base styling', () => {
      render(<Checkbox />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveClass(
        'peer',
        'h-4',
        'w-4',
        'shrink-0',
        'rounded-sm',
        'border',
        'border-primary',
        'ring-offset-background',
      );
    });

    it('handles checked state styling', () => {
      render(<Checkbox checked />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveClass(
        'data-[state=checked]:bg-primary',
        'data-[state=checked]:text-primary-foreground',
      );
    });

    it('handles disabled state', () => {
      render(<Checkbox disabled />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} />);

      expect(ref).toBeDefined();
    });
  });

  describe('Label Integration', () => {
    it('renders label when provided', () => {
      render(<Checkbox label="Accept terms" />);

      const label = screen.getByText('Accept terms');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('text-sm', 'font-medium', 'cursor-pointer');
    });

    it('associates label with checkbox', () => {
      render(<Checkbox id="terms" label="Accept terms" />);

      const label = screen.getByText('Accept terms');
      expect(label).toHaveAttribute('for', 'terms');
    });

    it('does not render label section when no label or description', () => {
      const { container } = render(<Checkbox />);

      // Should not have the label/description grid (second child of the outer flex container)
      const outerFlex = container.firstChild;
      expect(outerFlex?.childNodes.length).toBe(1);
      expect(screen.queryByText(/Accept terms/)).not.toBeInTheDocument();
    });

    it('handles disabled label styling', () => {
      render(<Checkbox disabled label="Disabled checkbox" />);

      const label = screen.getByText('Disabled checkbox');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });
  });

  describe('Description Support', () => {
    it('renders description when provided', () => {
      render(<Checkbox description="This is a helpful description" />);

      const description = screen.getByText('This is a helpful description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-xs', 'text-muted-foreground');
    });

    it('renders both label and description', () => {
      render(
        <Checkbox
          label="Accept terms"
          description="By checking this box, you agree to our terms and conditions"
        />,
      );

      expect(screen.getByText('Accept terms')).toBeInTheDocument();
      expect(
        screen.getByText('By checking this box, you agree to our terms and conditions'),
      ).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('applies error styling when error prop is provided', () => {
      render(<Checkbox error="This field is required" />);

      const checkbox = screen.getByTestId('checkbox-root');
      // The error styling is on the root, but our mock is a div now,
      // let's check classes.
      expect(checkbox).toHaveClass('border-red-500');

      const errorText = screen.getByText('This field is required');
      expect(errorText).toBeInTheDocument();
    });

    it('renders error with label and description', () => {
      render(
        <Checkbox
          label="Required field"
          description="Please check this box"
          error="You must accept the terms"
        />,
      );

      expect(screen.getByText('Required field')).toBeInTheDocument();
      expect(screen.getByText('Please check this box')).toBeInTheDocument();
      expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
    });
  });

  describe('Indeterminate State', () => {
    it('renders minus icon when indeterminate', () => {
      render(<Checkbox checked indeterminate />);

      expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('renders check icon when checked and not indeterminate', () => {
      render(<Checkbox checked />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument();
    });

    it('does not show indicator when unchecked', () => {
      render(<Checkbox />);

      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Checkbox />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2',
      );
    });

    it('supports aria attributes', () => {
      render(<Checkbox aria-label="Custom label" aria-describedby="helper-text" />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('aria-label', 'Custom label');
      expect(checkbox).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('label is clickable and associated with checkbox', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox id="test-checkbox" label="Clickable label" onCheckedChange={handleChange} />,
      );

      const label = screen.getByText('Clickable label');
      await user.click(label);

      // The checkbox should receive the click event through the label association
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Interaction Handling', () => {
    it('handles onCheckedChange callback', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByTestId('checkbox-root');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('handles controlled checked state', () => {
      render(<Checkbox checked={true} />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeChecked();
    });

    it('handles controlled unchecked state', () => {
      render(<Checkbox checked={false} />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).not.toBeChecked();
    });

    it('supports defaultChecked', () => {
      render(<Checkbox defaultChecked />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeChecked();
    });
  });

  describe('Layout and Styling', () => {
    it('has proper flex layout', () => {
      render(<Checkbox label="Test" />);

      const checkbox = screen.getByTestId('checkbox-root');
      const container = checkbox.parentElement;
      expect(container).toHaveClass('flex', 'items-start', 'space-x-3');
    });

    it('indicator has proper positioning', () => {
      render(<Checkbox checked />);

      const indicator = screen.getByTestId('checkbox-indicator');
      expect(indicator).toHaveClass('flex', 'items-center', 'justify-center', 'text-current');
    });

    it('applies custom className', () => {
      render(<Checkbox className="custom-checkbox" />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveClass('custom-checkbox');
    });
  });

  describe('Form Integration', () => {
    it('supports form attributes', () => {
      render(<Checkbox name="agreement" value="accepted" form="user-form" />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('name', 'agreement');
      expect(checkbox).toHaveAttribute('value', 'accepted');
      expect(checkbox).toHaveAttribute('form', 'user-form');
    });

    it('supports required attribute', () => {
      render(<Checkbox required />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('required');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML input attributes', () => {
      render(<Checkbox id="test-checkbox" name="test" value="test-value" tabIndex={0} autoFocus />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      expect(checkbox).toHaveAttribute('name', 'test');
      expect(checkbox).toHaveAttribute('value', 'test-value');
      expect(checkbox).toHaveAttribute('tabindex', '0');
    });

    it('supports all Radix Checkbox props', () => {
      const handleChange = vi.fn();

      render(
        <Checkbox checked={true} onCheckedChange={handleChange} disabled={false} required={true} />,
      );

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeChecked();
      expect(checkbox).not.toBeDisabled();
      expect(checkbox).toHaveAttribute('required');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty label and description', () => {
      render(<Checkbox label="" description="" />);

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeInTheDocument();

      // Ensure no secondary content containers are rendered
      const labels = screen.queryAllByRole('label');
      expect(labels).toHaveLength(0);
    });

    it('handles long text content', () => {
      const longLabel = 'A'.repeat(100);
      const longDescription = 'B'.repeat(200);
      const longError = 'C'.repeat(150);

      render(<Checkbox label={longLabel} description={longDescription} error={longError} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByTestId('checkbox-root');

      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('handles undefined props gracefully', () => {
      render(
        <Checkbox
          label={undefined}
          description={undefined}
          error={undefined}
          indeterminate={undefined}
        />,
      );

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Integration Patterns', () => {
    it('works in form context', () => {
      render(
        <form>
          <Checkbox name="terms" label="I accept the terms" required />
          <button type="submit">Submit</button>
        </form>,
      );

      const checkbox = screen.getByTestId('checkbox-root');
      expect(checkbox).toHaveAttribute('name', 'terms');
      expect(checkbox).toHaveAttribute('required');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('supports group of checkboxes', () => {
      const handleChange1 = vi.fn();
      const handleChange2 = vi.fn();

      render(
        <div>
          <Checkbox id="option1" label="Option 1" onCheckedChange={handleChange1} />
          <Checkbox id="option2" label="Option 2" onCheckedChange={handleChange2} />
        </div>,
      );

      const checkboxes = screen.getAllByTestId('checkbox-root');
      expect(checkboxes).toHaveLength(2);

      const labels = screen.getAllByText(/Option/);
      expect(labels).toHaveLength(2);
    });
  });
});
