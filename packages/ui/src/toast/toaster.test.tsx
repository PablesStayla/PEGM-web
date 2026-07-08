import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from './toaster';

type MockToast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  open?: boolean;
  duration?: number;
};

const mockUseToast = vi.fn<() => { toasts: MockToast[] }>();
vi.mock('../use-toast', () => ({
  useToast: () => mockUseToast(),
}));

const mockToastRoot = vi.fn(
  ({ children, open: _open, duration: _duration, sideOffset: _sideOffset, ...props }: any) => (
    <div data-testid="toast-root" {...props}>
      {children}
    </div>
  ),
);

const mockToastProvider = vi.fn(({ children, ...props }: any) => (
  <div data-testid="toast-provider" {...props}>
    {children}
  </div>
));

const mockToastViewport = vi.fn((props: any) => <div data-testid="toast-viewport" {...props} />);
const mockToastTitle = vi.fn(({ children }: any) => (
  <div data-testid="toast-title">{children}</div>
));
const mockToastDescription = vi.fn(({ children }: any) => (
  <div data-testid="toast-description">{children}</div>
));
const mockToastClose = vi.fn((props?: any) => <button data-testid="toast-close" {...props} />);

vi.mock('../toast', () => ({
  Toast: ({ children, ...props }: any) => mockToastRoot({ children, ...props }),
  ToastProvider: ({ children, ...props }: any) => mockToastProvider({ children, ...props }),
  ToastViewport: (props: any) => mockToastViewport(props),
  ToastTitle: ({ children }: any) => mockToastTitle({ children }),
  ToastDescription: ({ children }: any) => mockToastDescription({ children }),
  ToastClose: (props: any) => mockToastClose(props),
}));

describe('Toaster Component - Enterprise Level', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ toasts: [] });
  });

  it('renders provider and viewport even when there are no toasts', () => {
    render(<Toaster />);

    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
    expect(screen.queryByTestId('toast-root')).not.toBeInTheDocument();
  });

  it('renders each toast with title, description, action, and props', () => {
    const dismissButton = <button>Dismiss</button>;
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Success',
          description: 'Action completed',
          action: dismissButton,
          open: true,
          duration: 2000,
        },
      ],
    });

    render(<Toaster />);

    const toastRoot = screen.getByTestId('toast-root');
    expect(toastRoot).toBeInTheDocument();
    expect(mockToastRoot).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, duration: 2000 }),
    );

    expect(screen.getByTestId('toast-title')).toHaveTextContent('Success');
    expect(screen.getByTestId('toast-description')).toHaveTextContent('Action completed');
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
    expect(screen.getByTestId('toast-close')).toBeInTheDocument();
  });
});
