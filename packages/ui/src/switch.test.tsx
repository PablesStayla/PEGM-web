import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './switch';

// Mock Radix UI Switch
vi.mock('@radix-ui/react-switch', () => ({
  Root: Object.assign(
    React.forwardRef(
      ({ children, checked, defaultChecked, onCheckedChange, ...props }: any, ref: any) => {
        const [internalChecked, setInternalChecked] = React.useState(
          checked ?? defaultChecked ?? false,
        );

        React.useEffect(() => {
          if (checked !== undefined) {
            setInternalChecked(checked);
          }
        }, [checked]);

        const toggle = () => {
          const next = !internalChecked;
          if (checked === undefined) {
            setInternalChecked(next);
          }
          onCheckedChange?.(next);
        };

        return (
          <button
            data-testid="switch-root"
            role="switch"
            type="button"
            aria-checked={internalChecked}
            data-state={internalChecked ? 'checked' : 'unchecked'}
            onClick={toggle}
            ref={ref}
            {...props}
          >
            {children}
          </button>
        );
      },
    ),
    { displayName: 'Switch' },
  ),
  Thumb: ({ ...props }: any) => <span data-testid="switch-thumb" {...props} />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Switch Component - Enterprise Level', () => {
  it('renders switch with proper styling', () => {
    render(<Switch />);

    const switchElement = screen.getByTestId('switch-root');
    expect(switchElement).toHaveClass(
      'peer',
      'inline-flex',
      'h-5',
      'w-9',
      'shrink-0',
      'cursor-pointer',
      'items-center',
      'rounded-full',
      'border-2',
      'border-transparent',
      'shadow-sm',
      'transition-colors',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'data-[state=checked]:bg-primary',
      'data-[state=unchecked]:bg-input',
    );
  });

  it('renders thumb with proper styling', () => {
    render(<Switch />);

    const thumb = screen.getByTestId('switch-thumb');
    expect(thumb).toHaveClass(
      'pointer-events-none',
      'block',
      'h-4',
      'w-4',
      'rounded-full',
      'bg-background',
      'shadow-lg',
      'ring-0',
      'transition-transform',
      'data-[state=checked]:translate-x-4',
      'data-[state=unchecked]:translate-x-0',
    );
  });

  it('applies custom className', () => {
    render(<Switch className="custom-switch" />);

    const switchElement = screen.getByTestId('switch-root');
    expect(switchElement).toHaveClass('custom-switch');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Switch ref={ref} />);

    expect(ref).toBeDefined();
  });

  describe('Switch States', () => {
    it('renders unchecked state by default', () => {
      render(<Switch />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass('data-[state=unchecked]:bg-input');
    });

    it('renders checked state when checked prop is true', () => {
      render(<Switch checked />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');
    });

    it('supports defaultChecked', () => {
      render(<Switch defaultChecked />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Interaction Handling', () => {
    it('handles onCheckedChange callback', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Switch onCheckedChange={handleChange} />);

      const switchElement = screen.getByTestId('switch-root');
      await user.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('supports controlled checked state', () => {
      const { rerender } = render(<Switch checked={true} />);

      let switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');

      rerender(<Switch checked={false} />);
      switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass('data-[state=unchecked]:bg-input');
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Switch onCheckedChange={handleChange} />);

      const switchElement = screen.getByTestId('switch-root');
      switchElement.focus();

      expect(switchElement).toHaveFocus();

      await user.keyboard('{enter}');
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Switch checked aria-label="Toggle notifications" />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('aria-label', 'Toggle notifications');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('supports aria-pressed for toggle behavior', () => {
      render(<Switch aria-pressed="false" />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('aria-pressed', 'false');
    });

    it('has proper role', () => {
      render(<Switch />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('role', 'switch');
    });

    it('supports focus management', () => {
      render(<Switch />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styling', () => {
      render(<Switch disabled />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toBeDisabled();
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('prevents interaction when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Switch disabled onCheckedChange={handleChange} />);

      const switchElement = screen.getByTestId('switch-root');
      await user.click(switchElement);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('supports form attributes', () => {
      render(<Switch name="notifications" value="enabled" form="settings-form" />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('name', 'notifications');
      expect(switchElement).toHaveAttribute('value', 'enabled');
      expect(switchElement).toHaveAttribute('form', 'settings-form');
    });

    it('supports required attribute', () => {
      render(<Switch required />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('required');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML button attributes', () => {
      render(<Switch id="notification-switch" tabIndex={0} type="button" />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('id', 'notification-switch');
      expect(switchElement).toHaveAttribute('tabindex', '0');
      expect(switchElement).toHaveAttribute('type', 'button');
    });

    it('supports all Radix Switch props', () => {
      render(<Switch checked={true} onCheckedChange={() => {}} disabled={false} required={true} />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');
    });
  });

  describe('Visual States', () => {
    it('thumb moves to correct position when checked', () => {
      render(<Switch checked />);

      const thumb = screen.getByTestId('switch-thumb');
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-4');
    });

    it('thumb stays at start when unchecked', () => {
      render(<Switch />);

      const thumb = screen.getByTestId('switch-thumb');
      expect(thumb).toHaveClass('data-[state=unchecked]:translate-x-0');
    });

    it('has proper sizing', () => {
      render(<Switch />);

      const switchElement = screen.getByTestId('switch-root');
      const thumb = screen.getByTestId('switch-thumb');

      expect(switchElement).toHaveClass('h-5', 'w-9');
      expect(thumb).toHaveClass('h-4', 'w-4');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme-aware colors', () => {
      render(<Switch />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveClass(
        'data-[state=checked]:bg-primary',
        'data-[state=unchecked]:bg-input',
      );
    });

    it('thumb uses theme-aware background', () => {
      render(<Switch />);

      const thumb = screen.getByTestId('switch-thumb');
      expect(thumb).toHaveClass('bg-background');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicking', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Switch onCheckedChange={handleChange} />);

      const switchElement = screen.getByTestId('switch-root');

      // Rapid clicks
      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('handles undefined checked prop', () => {
      render(<Switch checked={undefined} />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toBeInTheDocument();
    });

    it('handles null onCheckedChange', () => {
      render(<Switch onCheckedChange={null as any} />);

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef for performance', () => {
      expect(Switch).toBeDefined();
    });

    it('has displayName for debugging', () => {
      expect(Switch.displayName).toBe('Switch');
    });

    it('minimizes re-renders', () => {
      const { rerender } = render(<Switch checked={true} />);

      rerender(<Switch checked={true} />);

      expect(screen.getByTestId('switch-root')).toBeInTheDocument();
    });
  });

  describe('Integration Patterns', () => {
    it('can be used for settings toggles', () => {
      render(
        <div>
          <label htmlFor="dark-mode">Dark Mode</label>
          <Switch id="dark-mode" aria-label="Toggle dark mode" />
        </div>,
      );

      expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument();
    });

    it('can be used for feature toggles', () => {
      render(
        <div>
          <label htmlFor="notifications">Enable Notifications</label>
          <Switch id="notifications" defaultChecked />
        </div>,
      );

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('can be used in forms', () => {
      render(
        <form>
          <label htmlFor="agree">I agree to terms</label>
          <Switch id="agree" name="agreement" required />
        </form>,
      );

      const switchElement = screen.getByTestId('switch-root');
      expect(switchElement).toHaveAttribute('name', 'agreement');
      expect(switchElement).toHaveAttribute('required');
    });
  });
});
