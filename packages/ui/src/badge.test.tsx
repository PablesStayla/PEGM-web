import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge } from './badge';

// Mock class-variance-authority
vi.mock('class-variance-authority', () => ({
  cva: vi.fn((base, config) => {
    return (props: any = {}) => {
      const classes = [base];
      const { variant = config?.defaultVariants?.variant } = props;

      // Apply variant classes
      if (config?.variants?.variant?.[variant]) {
        classes.push(config.variants.variant[variant]);
      }

      return classes.join(' ');
    };
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Badge Component - Enterprise Level', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders badge with default styling', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('DIV');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-md',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'transition-colors',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-ring',
      'focus:ring-offset-2',
      'border-transparent',
      'bg-primary',
      'text-primary-foreground',
      'shadow',
      'hover:bg-primary/80',
    );
  });

  it('renders badge with custom content', () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Badge</Badge>);

    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('custom-badge');
  });

  describe('Variants', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

    it.each(variants)('renders %s variant correctly', (variant) => {
      const { unmount } = render(<Badge variant={variant}>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toBeInTheDocument();

      if (variant === 'secondary') {
        expect(badge).toHaveClass(
          'bg-secondary',
          'text-secondary-foreground',
          'hover:bg-secondary/80',
        );
      } else if (variant === 'destructive') {
        expect(badge).toHaveClass(
          'bg-destructive',
          'text-destructive-foreground',
          'hover:bg-destructive/80',
        );
      } else if (variant === 'outline') {
        expect(badge).toHaveClass('text-foreground');
      }
      unmount();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Badge>Focusable Badge</Badge>);

      const badge = screen.getByText('Focusable Badge');
      expect(badge).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2',
      );
    });

    it('supports aria attributes', () => {
      render(<Badge aria-label="Status badge">Status</Badge>);

      const badge = screen.getByLabelText('Status badge');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('supports role attributes', () => {
      render(<Badge role="status">Loading</Badge>);

      const badge = screen.getByText('Loading');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });

  describe('Content and Layout', () => {
    it('displays text content correctly', () => {
      render(<Badge>Status: Active</Badge>);

      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    it('supports complex content', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Label</span>
        </Badge>,
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    it('has inline-flex layout', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });
  });

  describe('Styling Consistency', () => {
    it('has consistent padding and text size', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs');
    });

    it('has consistent border radius', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('rounded-md');
    });

    it('has consistent font weight', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('font-semibold');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme-aware colors', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('supports all theme variants', () => {
      render(<Badge variant="secondary">Secondary</Badge>);

      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });
  });

  describe('Use Cases', () => {
    it('can be used as status indicator', () => {
      render(<Badge variant="destructive">Error</Badge>);

      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('can be used as notification badge', () => {
      render(<Badge>New</Badge>);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('can be used as category tag', () => {
      render(<Badge variant="outline">Technology</Badge>);

      const badge = screen.getByText('Technology');
      expect(badge).toHaveClass('text-foreground');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML div attributes', () => {
      render(
        <Badge id="status-badge" data-testid="badge" title="Status indicator">
          Status
        </Badge>,
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'status-badge');
      expect(badge).toHaveAttribute('title', 'Status indicator');
    });

    it('supports all valid variant types', () => {
      const variants: Array<'default' | 'secondary' | 'destructive' | 'outline'> = [
        'default',
        'secondary',
        'destructive',
        'outline',
      ];

      variants.forEach((variant) => {
        const { unmount } = render(<Badge variant={variant}>Test</Badge>);
        expect(screen.getByText('Test')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const { container } = render(<Badge />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles long text content', () => {
      const longText = 'This is a very long badge text that should still display properly';
      render(<Badge>{longText}</Badge>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles special characters', () => {
      render(<Badge>Badge with émojis 🎉 and spëcial chärs</Badge>);

      expect(screen.getByText('Badge with émojis 🎉 and spëcial chärs')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('can be used in lists', () => {
      render(
        <div>
          <Badge>Tag 1</Badge>
          <Badge variant="secondary">Tag 2</Badge>
          <Badge variant="outline">Tag 3</Badge>
        </div>,
      );

      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
    });

    it('can be combined with other components', () => {
      render(
        <div>
          <span>Status:</span>
          <Badge variant="destructive">Error</Badge>
        </div>,
      );

      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Error')).toHaveClass('bg-destructive');
    });
  });
});
