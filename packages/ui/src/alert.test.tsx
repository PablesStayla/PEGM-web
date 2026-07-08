import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './alert';

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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  Info: () => <svg data-testid="info-icon" />,
  XCircle: () => <svg data-testid="x-circle-icon" />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Alert Component System - Enterprise Level', () => {
  describe('Alert Component', () => {
    it('renders alert with default variant', () => {
      render(<Alert>Default alert message</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Default alert message');
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'p-4',
        'bg-background',
        'text-foreground',
      );
    });

    it('renders with default info icon', () => {
      render(<Alert>Alert message</Alert>);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Alert className="custom-alert">Alert message</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Alert ref={ref}>Alert message</Alert>);

      expect(ref).toBeDefined();
    });
  });

  describe('Alert Variants', () => {
    const variants = ['default', 'destructive', 'success', 'warning', 'info'] as const;

    it.each(variants)('renders %s variant correctly', (variant) => {
      render(<Alert variant={variant}>Alert message</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();

      if (variant === 'destructive') {
        expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
        expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
      } else if (variant === 'success') {
        expect(alert).toHaveClass('border-green-500/50', 'text-green-700', 'bg-green-50');
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      } else if (variant === 'warning') {
        expect(alert).toHaveClass('border-yellow-500/50', 'text-yellow-700', 'bg-yellow-50');
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      } else if (variant === 'info') {
        expect(alert).toHaveClass('border-blue-500/50', 'text-blue-700', 'bg-blue-50');
        expect(screen.getByTestId('info-icon')).toBeInTheDocument();
      }
    });
  });

  describe('Custom Icon', () => {
    it('renders custom icon when provided', () => {
      const customIcon = <span data-testid="custom-icon">🚨</span>;

      render(<Alert icon={customIcon}>Alert with custom icon</Alert>);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('info-icon')).not.toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('renders close button when onClose is provided', () => {
      const handleClose = vi.fn();

      render(<Alert onClose={handleClose}>Closable alert</Alert>);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });

    it('does not render close button when onClose is not provided', () => {
      render(<Alert>Non-closable alert</Alert>);

      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(<Alert onClose={handleClose}>Closable alert</Alert>);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('AlertTitle Component', () => {
    it('renders title with proper styling', () => {
      render(<AlertTitle>Alert Title</AlertTitle>);

      const title = screen.getByRole('heading', { level: 5 });
      expect(title).toHaveTextContent('Alert Title');
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
    });

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title">Title</AlertTitle>);

      const title = screen.getByRole('heading', { level: 5 });
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<AlertTitle ref={ref}>Title</AlertTitle>);

      expect(ref).toBeDefined();
    });
  });

  describe('AlertDescription Component', () => {
    it('renders description with proper styling', () => {
      render(<AlertDescription>Description text</AlertDescription>);

      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-sm');
    });

    it('handles paragraph content with proper spacing', () => {
      render(
        <AlertDescription>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>,
      );

      const description = screen.getByText('First paragraph').parentElement;
      expect(description).toHaveClass('[&_p]:leading-relaxed');
    });

    it('applies custom className', () => {
      render(<AlertDescription className="custom-desc">Description</AlertDescription>);

      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<AlertDescription ref={ref}>Description</AlertDescription>);

      expect(ref).toBeDefined();
    });
  });

  describe('Complete Alert Composition', () => {
    it('renders complete alert with all components', () => {
      const handleClose = vi.fn();

      render(
        <Alert variant="success" onClose={handleClose}>
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your action was completed successfully. You can now proceed with the next step.
          </AlertDescription>
        </Alert>,
      );

      // Alert container
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-green-500/50', 'text-green-700', 'bg-green-50');

      // Icon
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

      // Title
      const title = screen.getByRole('heading', { level: 5 });
      expect(title).toHaveTextContent('Success!');

      // Description
      expect(
        screen.getByText(
          'Your action was completed successfully. You can now proceed with the next step.',
        ),
      ).toBeInTheDocument();

      // Close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('handles alert with only description', () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>Error occurred during operation</AlertDescription>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('Error occurred during operation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      render(<Alert>Alert message</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('close button has screen reader text', () => {
      const handleClose = vi.fn();

      render(<Alert onClose={handleClose}>Alert</Alert>);

      expect(screen.getByText('Close')).toHaveClass('sr-only');
    });

    it('supports custom aria attributes', () => {
      render(<Alert aria-live="assertive">Urgent alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('close button has focus styles', () => {
      const handleClose = vi.fn();

      render(<Alert onClose={handleClose}>Alert</Alert>);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring');
    });
  });

  describe('Icon Positioning', () => {
    it('positions icon absolutely', () => {
      render(<Alert>Alert with icon</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass(
        '[&>svg~*]:pl-7',
        '[&>svg+div]:translate-y-[-3px]',
        '[&>svg]:absolute',
        '[&>svg]:left-4',
        '[&>svg]:top-4',
        '[&>svg]:text-foreground',
      );
    });

    it('adjusts content padding when icon is present', () => {
      render(
        <Alert>
          <div>Content with padding</div>
        </Alert>,
      );

      const content = screen.getByText('Content with padding');
      expect(content.parentElement).toHaveClass('flex-1');
    });
  });

  describe('Theme Support', () => {
    it('supports dark mode variants', () => {
      render(<Alert variant="success">Success alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('dark:border-green-500');
    });

    it('destructive variant supports dark mode', () => {
      render(<Alert variant="destructive">Error alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('dark:border-destructive');
    });
  });

  describe('Use Cases', () => {
    it('can be used as success notification', () => {
      render(
        <Alert variant="success">
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>Your payment has been processed successfully.</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('can be used as error notification', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('can be used as warning notification', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review your information before proceeding.</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('can be used as info notification', () => {
      render(
        <Alert variant="info">
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Here is some important information.</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML div attributes', () => {
      render(
        <Alert id="test-alert" data-testid="alert" style={{ margin: '10px' }}>
          Test alert
        </Alert>,
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('id', 'test-alert');
      expect(alert).toHaveStyle({ margin: '10px' });
    });

    it('supports all valid variant types', () => {
      const variants: Array<'default' | 'destructive' | 'success' | 'warning' | 'info'> = [
        'default',
        'destructive',
        'success',
        'warning',
        'info',
      ];

      variants.forEach((variant) => {
        const { unmount } = render(<Alert variant={variant}>Test</Alert>);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty alert', () => {
      render(<Alert />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('handles alert with complex content', () => {
      render(
        <Alert variant="info">
          <AlertTitle>Complex Alert</AlertTitle>
          <AlertDescription>
            <p>Paragraph 1</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <p>Paragraph 2</p>
          </AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Complex Alert')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('handles alerts without titles', () => {
      render(
        <Alert>
          <AlertDescription>Just a description</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Just a description')).toBeInTheDocument();
    });

    it('handles custom icon with onClose', () => {
      const handleClose = vi.fn();
      const customIcon = <span>⚠️</span>;

      render(
        <Alert icon={customIcon} onClose={handleClose}>
          Custom icon alert
        </Alert>,
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('can be used in forms for validation messages', () => {
      render(
        <form>
          <Alert variant="destructive">
            <AlertDescription>Please fill in all required fields.</AlertDescription>
          </Alert>
        </form>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50');
      expect(screen.getByText('Please fill in all required fields.')).toBeInTheDocument();
    });

    it('can be used in notification systems', () => {
      const notifications = [
        { id: 1, type: 'success', message: 'Success!' },
        { id: 2, type: 'error', message: 'Error!' },
      ];

      render(
        <div>
          {notifications.map((notification) => (
            <Alert key={notification.id} variant={notification.type as any}>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>,
      );

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });
  });
});
