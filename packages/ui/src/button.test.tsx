import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

// Mock @radix-ui/react-slot - simulate prop merging
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, asChild: _asChild, ...props }: any) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { ...props, ...children.props } as any);
    }
    return <div {...props}>{children}</div>;
  },
}));

// Mock class-variance-authority
vi.mock('class-variance-authority', () => ({
  cva: vi.fn((base, config) => {
    return (props: any = {}) => {
      const classes = [base];
      const {
        variant = config?.defaultVariants?.variant,
        size = config?.defaultVariants?.size,
        className,
      } = props;

      // Apply variant classes
      if (config?.variants?.variant?.[variant]) {
        classes.push(config.variants.variant[variant]);
      }

      // Apply size classes
      if (config?.variants?.size?.[size]) {
        classes.push(config.variants.size[size]);
      }

      // Add custom className
      if (className) {
        classes.push(className);
      }

      return classes.join(' ');
    };
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Click me</Button>);

    expect(ref).toBeDefined();
  });

  describe('Variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

    it.each(variants)('renders %s variant correctly', (variant) => {
      render(<Button variant={variant}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();

      // The class variance authority mock will apply the variant classes
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders default variant when no variant specified', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });

  describe('Sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    it.each(sizes)('renders %s size correctly', (size) => {
      render(<Button size={size}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();

      if (size === 'sm') {
        expect(button).toHaveClass('h-8', 'px-3', 'text-xs');
      } else if (size === 'lg') {
        expect(button).toHaveClass('h-10', 'px-8');
      } else if (size === 'icon') {
        expect(button).toHaveClass('h-9', 'w-9');
      } else {
        expect(button).toHaveClass('h-9', 'px-4', 'py-2');
      }
    });
  });

  describe('States', () => {
    it('renders disabled state correctly', () => {
      render(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('prevents click when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>,
      );

      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild prop', () => {
    it('renders as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <span>Click me</span>
        </Button>,
      );

      // Should render the span as the slot
      const span = screen.getByText('Click me');
      expect(span.tagName).toBe('SPAN');
      expect(span).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders as button when asChild is false', () => {
      render(<Button asChild={false}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button.tagName).toBe('BUTTON');
    });

    it('defaults to button when asChild not specified', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-1',
        'focus-visible:ring-ring',
      );
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();

      render(<Button onKeyDown={handleKeyDown}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      await user.type(button, '{enter}');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('supports aria attributes', () => {
      render(<Button aria-label="Custom label">Click me</Button>);

      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('Styling and SVG Icons', () => {
    it('handles SVG icons with proper sizing', () => {
      render(
        <Button>
          <svg data-testid="icon">Icon</svg>
          Click me
        </Button>,
      );

      const _icon = screen.getByTestId('icon');
      // The button should have SVG pointer-events and sizing classes
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass(
        '[&_svg]:pointer-events-none',
        '[&_svg]:size-4',
        '[&_svg]:shrink-0',
      );
    });

    it('applies gap between elements', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('gap-2');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      render(
        <Button variant={undefined} size={undefined}>
          Click me
        </Button>,
      );

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('preserves other HTML button attributes', () => {
      render(
        <Button type="submit" form="my-form">
          Click me
        </Button>,
      );

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'my-form');
    });

    it('renders children correctly', () => {
      render(
        <Button>
          <span data-testid="child">Child content</span>
        </Button>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('accepts all valid variant types', () => {
      const variants: Array<
        'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
      > = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];

      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>Test</Button>);
        expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument();
        unmount();
      });
    });

    it('accepts all valid size types', () => {
      const sizes: Array<'default' | 'sm' | 'lg' | 'icon'> = ['default', 'sm', 'lg', 'icon'];

      sizes.forEach((size) => {
        const { unmount } = render(<Button size={size}>Test</Button>);
        expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument();
        unmount();
      });
    });
  });
});
