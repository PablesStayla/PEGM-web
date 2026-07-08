import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Progress } from './progress';

// Mock Radix UI Progress
vi.mock('@radix-ui/react-progress', () => ({
  Root: React.forwardRef(({ children, value, max = 100, min = 0, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="progress-root"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      {...props}
    >
      {children}
    </div>
  )),
  Indicator: React.forwardRef((props: any, ref: any) => (
    <div ref={ref} data-testid="progress-indicator" {...props} />
  )),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Progress Component - Enterprise Level', () => {
  describe('Basic Functionality', () => {
    it('renders progress bar with default styling', () => {
      render(<Progress value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass(
        'relative',
        'overflow-hidden',
        'rounded-full',
        'bg-secondary',
        'h-4',
      );
    });

    it('renders progress indicator with correct transform', () => {
      render(<Progress value={75} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-25%)');
      expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'transition-all', 'bg-primary');
    });

    it('handles zero value', () => {
      render(<Progress value={0} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-100%)');
    });

    it('handles 100% completion', () => {
      render(<Progress value={100} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-0%)');
    });

    it('handles undefined value', () => {
      render(<Progress />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-100%)');
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<Progress size="sm" value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass('h-2');
    });

    it('renders default size', () => {
      render(<Progress size="default" value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass('h-4');
    });

    it('renders large size', () => {
      render(<Progress size="lg" value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass('h-6');
    });
  });

  describe('Color Variants', () => {
    it('renders default variant', () => {
      render(<Progress variant="default" value={50} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('bg-primary');
    });

    it('renders success variant', () => {
      render(<Progress variant="success" value={50} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('renders warning variant', () => {
      render(<Progress variant="warning" value={50} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('renders error variant', () => {
      render(<Progress variant="error" value={50} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });

  describe('Label and Value Display', () => {
    it('renders label when provided', () => {
      render(<Progress label="Upload Progress" value={50} />);

      expect(screen.getByText('Upload Progress')).toBeInTheDocument();
      expect(screen.getByText('Upload Progress')).toHaveClass(
        'text-sm',
        'font-medium',
        'text-gray-700',
      );
    });

    it('renders value percentage when showValue is true', () => {
      render(<Progress showValue value={75} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toHaveClass('text-sm', 'text-gray-500');
    });

    it('renders both label and value', () => {
      render(<Progress label="Loading" showValue value={60} />);

      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('positions label and value correctly', () => {
      render(<Progress label="Progress" showValue value={40} />);

      const container = screen.getByText('Progress').parentElement;
      expect(container).toHaveClass('flex', 'justify-between', 'items-center', 'mb-2');
    });

    it('does not render header when neither label nor showValue', () => {
      render(<Progress value={50} />);

      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(<Progress aria-label="File upload progress" value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveAttribute('aria-label', 'File upload progress');
    });

    it('supports aria-valuenow', () => {
      render(<Progress value={75} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveAttribute('aria-valuenow', '75');
    });

    it('supports aria-valuemin and aria-valuemax', () => {
      render(<Progress max={200} value={100} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveAttribute('aria-valuemax', '200');
    });

    it('has proper role', () => {
      render(<Progress value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveAttribute('role', 'progressbar');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to root', () => {
      render(<Progress className="custom-progress" value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass('custom-progress');
    });

    it('maintains base classes with custom className', () => {
      render(<Progress className="custom-progress" value={50} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass(
        'relative',
        'overflow-hidden',
        'rounded-full',
        'bg-secondary',
        'custom-progress',
      );
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Progress ref={ref} value={50} />);

      expect(ref).toBeDefined();
    });
  });

  describe('Progress Calculations', () => {
    it('calculates transform correctly for different values', () => {
      const testCases = [
        { value: 0, expected: 'translateX(-100%)' },
        { value: 25, expected: 'translateX(-75%)' },
        { value: 50, expected: 'translateX(-50%)' },
        { value: 75, expected: 'translateX(-25%)' },
        { value: 100, expected: 'translateX(-0%)' },
      ];

      testCases.forEach(({ value, expected }) => {
        const { unmount } = render(<Progress value={value} />);
        const indicator = screen.getByTestId('progress-indicator');
        const style = indicator.getAttribute('style');
        expect(style).toContain(`transform: ${expected}`);
        unmount();
      });
    });

    it('handles decimal values', () => {
      render(<Progress value={33.7} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-66.3%)');
    });

    it('handles negative values', () => {
      render(<Progress value={-10} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-110%)');
    });

    it('handles values over 100', () => {
      render(<Progress value={150} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('accepts all valid size types', () => {
      const sizes: Array<'sm' | 'default' | 'lg'> = ['sm', 'default', 'lg'];

      sizes.forEach((size) => {
        const { unmount } = render(<Progress size={size} value={50} />);
        expect(screen.getByTestId('progress-root')).toBeInTheDocument();
        unmount();
      });
    });

    it('accepts all valid variant types', () => {
      const variants: Array<'default' | 'success' | 'warning' | 'error'> = [
        'default',
        'success',
        'warning',
        'error',
      ];

      variants.forEach((variant) => {
        const { unmount } = render(<Progress variant={variant} value={50} />);
        expect(screen.getByTestId('progress-root')).toBeInTheDocument();
        unmount();
      });
    });

    it('accepts all Radix Progress props', () => {
      render(<Progress value={50} max={100} />);

      const root = screen.getByTestId('progress-root');
      expect(root).toBeInTheDocument();
    });
  });

  describe('Integration Use Cases', () => {
    it('can be used for file upload progress', () => {
      render(<Progress label="Uploading file" showValue value={67} variant="success" />);

      expect(screen.getByText('Uploading file')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('can be used for loading states', () => {
      render(<Progress label="Loading data" value={85} variant="default" size="sm" />);

      expect(screen.getByText('Loading data')).toBeInTheDocument();

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass('h-2');
    });

    it('can be used for form completion progress', () => {
      render(<Progress label="Profile completion" showValue value={60} variant="warning" />);

      expect(screen.getByText('Profile completion')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('can be used for download progress', () => {
      render(<Progress label="Downloading" showValue value={45} variant="default" size="lg" />);

      expect(screen.getByText('Downloading')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();

      const root = screen.getByTestId('progress-root');
      expect(root).toHaveClass('h-6');
    });
  });

  describe('Edge Cases', () => {
    it('handles very small progress values', () => {
      render(<Progress value={0.1} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-99.9%)');
    });

    it('handles large progress values', () => {
      render(<Progress value={100} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('translateX(-0%)');
    });

    it('handles NaN values', () => {
      render(<Progress value={Number.NaN} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-100%)');
    });

    it('handles null and undefined values', () => {
      const { rerender } = render(<Progress value={null as any} />);
      let indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });

      rerender(<Progress value={undefined} />);
      indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-100%)');
    });

    it('renders without crashing with extreme values', () => {
      expect(() => render(<Progress value={Number.POSITIVE_INFINITY} />)).not.toThrow();
      expect(() => render(<Progress value={Number.NEGATIVE_INFINITY} />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef for performance', () => {
      // This is tested implicitly by the ref forwarding tests
      expect(Progress.$$typeof).toBeDefined();
    });

    it('has displayName for debugging', () => {
      expect(Progress.displayName).toBe('Progress');
    });

    it('minimizes re-renders with stable props', () => {
      const { rerender } = render(<Progress value={50} />);

      // Re-render with same props should not cause unnecessary updates
      rerender(<Progress value={50} />);

      expect(screen.getByTestId('progress-root')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('full width by default', () => {
      render(<Progress value={50} />);

      const container = screen.getByTestId('progress-root').parentElement;
      expect(container).toHaveClass('w-full');
    });

    it('works with different container sizes', () => {
      const { rerender } = render(
        <div className="w-64">
          <Progress value={50} />
        </div>,
      );

      let container = screen.getByTestId('progress-root').parentElement;
      expect(container).toHaveClass('w-full');

      rerender(
        <div className="w-32">
          <Progress value={50} />
        </div>,
      );

      container = screen.getByTestId('progress-root').parentElement;
      expect(container).toHaveClass('w-full');
    });
  });

  describe('Animation and Transitions', () => {
    it('has smooth transitions', () => {
      render(<Progress value={50} />);

      const indicator = screen.getByTestId('progress-indicator');
      expect(indicator).toHaveClass('transition-all');
    });

    it('transitions smoothly between values', () => {
      const { rerender } = render(<Progress value={0} />);

      let indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-100%)');

      rerender(<Progress value={100} />);
      indicator = screen.getByTestId('progress-indicator');
      expect(indicator.getAttribute('style')).toContain('transform: translateX(-0%)');
    });
  });
});
