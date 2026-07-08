import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';

// Mock Radix Toast components
vi.mock('@radix-ui/react-toast', () => ({
  __esModule: true,
  Provider: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="toast-provider" {...props}>
      {children}
    </div>
  )),
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="toast-root" {...props}>
      {children}
    </div>
  )),
  Viewport: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="toast-viewport" {...props}>
      {children}
    </div>
  )),
  Title: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="toast-title" {...props}>
      {children}
    </div>
  )),
  Description: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="toast-description" {...props}>
      {children}
    </div>
  )),
  Close: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <button ref={ref} data-testid="toast-close" {...props}>
      {children}
    </button>
  )),
  Action: React.forwardRef(({ children, altText, ...props }: any, ref: any) => (
    <button ref={ref} data-testid="toast-action" alttext={altText} {...props}>
      {children}
    </button>
  )),
  ItemIndicator: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <span ref={ref} data-testid="toast-item-indicator" {...props}>
      {children}
    </span>
  )),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <svg data-testid="close-icon" />,
}));

// Mock class-variance-authority (cva)
vi.mock('class-variance-authority', () => ({
  cva: vi.fn((base: string, config: any) => {
    return (props: any = {}) => {
      const variant = props?.variant ?? config?.defaultVariants?.variant ?? 'default';
      return [base, config?.variants?.variant?.[variant]].filter(Boolean).join(' ');
    };
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Toast Component System - Enterprise Level', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('ToastProvider', () => {
    it('renders provider with children', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>,
      );

      expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    });

    it('forwards props to provider', () => {
      render(
        <ToastProvider duration={5000}>
          <div>Timed toast</div>
        </ToastProvider>,
      );

      const provider = screen.getByTestId('toast-provider');
      expect(provider).toHaveAttribute('duration', '5000');
    });
  });

  describe('ToastViewport', () => {
    it('renders viewport with proper styling', () => {
      render(<ToastViewport />);

      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toHaveClass(
        'fixed',
        'top-0',
        'z-[100]',
        'flex',
        'max-h-screen',
        'w-full',
        'flex-col-reverse',
        'p-4',
      );
    });

    it('supports custom className', () => {
      render(<ToastViewport className="custom-viewport" />);

      const viewport = screen.getByTestId('toast-viewport');
      expect(viewport).toHaveClass('custom-viewport');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<ToastViewport ref={ref} />);

      expect(ref).toBeDefined();
    });
  });

  describe('Toast Root', () => {
    it('renders toast with default styling', () => {
      render(<Toast />);

      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass(
        'group',
        'pointer-events-auto',
        'relative',
        'flex',
        'w-full',
        'items-center',
        'justify-between',
        'space-x-2',
        'overflow-hidden',
        'rounded-md',
        'border',
        'p-4',
        'pr-6',
        'shadow-lg',
        'transition-all',
      );
    });

    it('applies variant classes for destructive toasts', () => {
      render(<Toast variant="destructive" />);

      const toast = screen.getByTestId('toast-root');
      expect(toast.className).toMatch(/destructive/);
      expect(toast.className).toMatch(/border-destructive/);
      expect(toast.className).toMatch(/bg-destructive/);
    });

    it('supports custom className', () => {
      render(<Toast className="custom-toast" />);

      const toast = screen.getByTestId('toast-root');
      expect(toast).toHaveClass('custom-toast');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Toast ref={ref} />);

      expect(ref).toBeDefined();
    });
  });

  describe('ToastTitle', () => {
    it('renders title with default styling', () => {
      render(<ToastTitle>Toast Title</ToastTitle>);

      const title = screen.getByTestId('toast-title');
      expect(title).toHaveClass('text-sm', 'font-semibold');
      expect(title).toHaveTextContent('Toast Title');
    });

    it('supports custom className', () => {
      render(<ToastTitle className="custom-title">Custom Title</ToastTitle>);

      const title = screen.getByTestId('toast-title');
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<ToastTitle ref={ref}>Title with ref</ToastTitle>);

      expect(ref).toBeDefined();
    });
  });

  describe('ToastDescription', () => {
    it('renders description with default styling', () => {
      render(<ToastDescription>Description text</ToastDescription>);

      const description = screen.getByTestId('toast-description');
      expect(description).toHaveClass('text-sm', 'opacity-90');
      expect(description).toHaveTextContent('Description text');
    });

    it('supports custom className', () => {
      render(<ToastDescription className="custom-desc">Detailed description</ToastDescription>);

      const description = screen.getByTestId('toast-description');
      expect(description).toHaveClass('custom-desc');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<ToastDescription ref={ref}>Description with ref</ToastDescription>);

      expect(ref).toBeDefined();
    });
  });

  describe('ToastAction', () => {
    it('renders action button with styling', () => {
      render(<ToastAction altText="Action">Take action</ToastAction>);

      const action = screen.getByTestId('toast-action');
      expect(action.className).toMatch(/inline-flex/);
      expect(action.className).toMatch(/rounded-md/);
      expect(action).toHaveAttribute('alttext', 'Action');
    });

    it('supports destructive variant styling via group', () => {
      render(
        <Toast variant="destructive">
          <ToastAction altText="Delete toast">Delete</ToastAction>
        </Toast>,
      );

      const action = screen.getByTestId('toast-action');
      expect(action.className).toMatch(/group-\[\.destructive]/);
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <ToastAction ref={ref} altText="Ref action">
          Action with ref
        </ToastAction>,
      );

      expect(ref).toBeDefined();
    });
  });

  describe('ToastClose', () => {
    it('renders close button with icon and styling', () => {
      render(<ToastClose />);

      const close = screen.getByTestId('toast-close');
      expect(close.className).toMatch(/absolute/);
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('supports custom className', () => {
      render(<ToastClose className="custom-close" />);

      const close = screen.getByTestId('toast-close');
      expect(close).toHaveClass('custom-close');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<ToastClose ref={ref} />);

      expect(ref).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    const sampleToast: ToastProps = {
      id: '1',
      open: true,
    };

    it('renders complete toast composition', () => {
      render(
        <ToastProvider>
          <Toast {...sampleToast}>
            <div className="grid gap-1">
              <ToastTitle>Upload Successful</ToastTitle>
              <ToastDescription>All files have been uploaded.</ToastDescription>
            </div>
            <ToastAction altText="Undo">Undo</ToastAction>
            <ToastClose aria-label="Close" />
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
      expect(screen.getByTestId('toast-root')).toBeInTheDocument();
      expect(screen.getByTestId('toast-title')).toHaveTextContent('Upload Successful');
      expect(screen.getByTestId('toast-description')).toHaveTextContent(
        'All files have been uploaded.',
      );
      expect(screen.getByTestId('toast-action')).toHaveTextContent('Undo');
      expect(screen.getByTestId('toast-close')).toBeInTheDocument();
      expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
    });

    it('supports multiple toasts within provider', () => {
      render(
        <ToastProvider>
          <Toast id="toast-1" open>
            <ToastTitle>First Toast</ToastTitle>
          </Toast>
          <Toast id="toast-2" open>
            <ToastTitle>Second Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      const titles = screen.getAllByTestId('toast-title');
      expect(titles).toHaveLength(2);
      expect(titles[0]).toHaveTextContent('First Toast');
      expect(titles[1]).toHaveTextContent('Second Toast');
    });
  });

  describe('Edge Cases', () => {
    it('handles toast without title or description', () => {
      render(
        <ToastProvider>
          <Toast id="toast-no-content" open>
            <ToastClose aria-label="Close" />
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      expect(screen.getByTestId('toast-root')).toBeInTheDocument();
      expect(screen.queryByTestId('toast-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument();
    });

    it('supports custom class names on toast root and viewport', () => {
      render(
        <ToastProvider>
          <Toast id="custom-toast" className="custom-toast-class" open>
            <ToastTitle>Custom Toast</ToastTitle>
          </Toast>
          <ToastViewport className="custom-viewport-class" />
        </ToastProvider>,
      );

      expect(screen.getByTestId('toast-root')).toHaveClass('custom-toast-class');
      expect(screen.getByTestId('toast-viewport')).toHaveClass('custom-viewport-class');
    });
  });
});
