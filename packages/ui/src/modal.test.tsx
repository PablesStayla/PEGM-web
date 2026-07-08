import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  ModalTrigger,
} from './modal';

// Mock Radix UI Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({
    children,
    open: _open,
    onOpenChange: _onOpenChange,
    modal: _modal,
    defaultOpen: _defaultOpen,
    ...props
  }: any) => (
    <div data-testid="modal-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, asChild: _asChild, ...props }: any) => (
    <button data-testid="modal-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children, container: _container }: any) => (
    <div data-testid="modal-portal">{children}</div>
  ),
  Overlay: ({ children, asChild: _asChild, ...props }: any) => (
    <div data-testid="modal-overlay" {...props}>
      {children}
    </div>
  ),
  Content: ({
    children,
    asChild: _asChild,
    onOpenAutoFocus: _onOpenAutoFocus,
    onCloseAutoFocus: _onCloseAutoFocus,
    onEscapeKeyDown: _onEscapeKeyDown,
    onPointerDownOutside: _onPointerDownOutside,
    onInteractOutside: _onInteractOutside,
    onOpenChange: _onOpenChange,
    modal: _modal,
    ...props
  }: any) => (
    <div data-testid="modal-content" {...props} role="dialog">
      {children}
    </div>
  ),
  Title: ({ children, asChild: _asChild, ...props }: any) => (
    <h2 data-testid="modal-title" {...props}>
      {children}
    </h2>
  ),
  Description: ({ children, asChild: _asChild, ...props }: any) => (
    <p data-testid="modal-description" {...props}>
      {children}
    </p>
  ),
  Close: ({ children, asChild: _asChild, ...props }: any) => (
    <button data-testid="modal-close" {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <svg data-testid="close-icon">X</svg>,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Modal System', () => {
  describe('Modal Root Component', () => {
    it('renders modal root correctly', () => {
      render(
        <Modal>
          <ModalTrigger>Open Modal</ModalTrigger>
          <ModalContent>
            <p>Modal content</p>
          </ModalContent>
        </Modal>,
      );

      expect(screen.getByTestId('modal-root')).toBeInTheDocument();
      expect(screen.getByTestId('modal-trigger')).toHaveTextContent('Open Modal');
      expect(screen.getByTestId('modal-content')).toHaveTextContent('Modal content');
    });
  });

  describe('Modal Trigger', () => {
    it('renders trigger button', () => {
      render(<ModalTrigger>Open Modal</ModalTrigger>);

      const trigger = screen.getByTestId('modal-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open Modal');
    });

    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ModalTrigger onClick={handleClick}>Open Modal</ModalTrigger>);

      const trigger = screen.getByTestId('modal-trigger');
      await user.click(trigger);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Modal Content', () => {
    it('renders modal content with proper structure', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      expect(screen.getByTestId('modal-portal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toHaveAttribute('role', 'dialog');
    });

    it('includes close button by default', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      expect(screen.getByTestId('modal-close')).toBeInTheDocument();
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ModalContent className="custom-modal">
          <p>Modal content</p>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveClass('custom-modal');
    });

    it('has proper accessibility attributes', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveAttribute('role', 'dialog');
    });
  });

  describe('Modal Header Components', () => {
    it('renders modal header', () => {
      render(
        <ModalHeader>
          <h2>Header Content</h2>
        </ModalHeader>,
      );

      const header = screen.getByText('Header Content').closest('div');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'text-center', 'sm:text-left');
    });

    it('renders modal title', () => {
      render(<ModalTitle>Modal Title</ModalTitle>);

      const title = screen.getByTestId('modal-title');
      expect(title).toHaveTextContent('Modal Title');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('renders modal description', () => {
      render(<ModalDescription>Modal description text</ModalDescription>);

      const description = screen.getByTestId('modal-description');
      expect(description).toHaveTextContent('Modal description text');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('Modal Footer', () => {
    it('renders modal footer with responsive layout', () => {
      render(
        <ModalFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </ModalFooter>,
      );

      const footer = screen.getByText('Cancel').closest('div');
      expect(footer).toHaveClass(
        'flex',
        'flex-col-reverse',
        'sm:flex-row',
        'sm:justify-end',
        'sm:space-x-2',
      );
    });
  });

  describe('Modal Overlay', () => {
    it('renders overlay with backdrop blur', () => {
      render(<ModalOverlay />);

      const overlay = screen.getByTestId('modal-overlay');
      expect(overlay).toHaveClass(
        'fixed',
        'inset-0',
        'z-50',
        'bg-background/80',
        'backdrop-blur-sm',
      );
    });

    it('includes animation classes', () => {
      render(<ModalOverlay />);

      const overlay = screen.getByTestId('modal-overlay');
      expect(overlay).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0',
      );
    });
  });

  describe('Modal Close', () => {
    it('renders close button', () => {
      render(<ModalClose>Close</ModalClose>);

      const closeButton = screen.getByTestId('modal-close');
      expect(closeButton).toHaveTextContent('Close');
    });

    it('handles close events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ModalClose onClick={handleClick}>Close</ModalClose>);

      const closeButton = screen.getByTestId('modal-close');
      await user.click(closeButton);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('modal content has dialog role', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveAttribute('role', 'dialog');
    });

    it('close button has screen reader text', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      // The close button includes sr-only text
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('title has proper heading semantics', () => {
      render(<ModalTitle>Modal Title</ModalTitle>);

      const title = screen.getByTestId('modal-title');
      expect(title.tagName).toBe('H2');
    });

    it('supports aria-labelledby and aria-describedby', () => {
      render(
        <ModalContent aria-labelledby="modal-title" aria-describedby="modal-description">
          <ModalTitle id="modal-title">Title</ModalTitle>
          <ModalDescription id="modal-description">Description</ModalDescription>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(content).toHaveAttribute('aria-describedby', 'modal-description');
    });
  });

  describe('Animations and Styling', () => {
    it('modal content has animation classes', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:zoom-out-95',
        'data-[state=open]:zoom-in-95',
      );
    });

    it('modal content has proper positioning and sizing', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveClass(
        'fixed',
        'left-[50%]',
        'top-[50%]',
        'z-50',
        'grid',
        'w-full',
        'max-w-lg',
        'translate-x-[-50%]',
        'translate-y-[-50%]',
        'gap-4',
        'border',
        'bg-background',
        'p-6',
        'shadow-lg',
        'duration-200',
      );
    });

    it('modal content has responsive rounded corners', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveClass('sm:rounded-lg');
    });
  });

  describe('Focus Management', () => {
    it('close button has proper focus styles', () => {
      render(
        <ModalContent>
          <p>Modal content</p>
        </ModalContent>,
      );

      const closeButton = screen.getByTestId('modal-close');
      expect(closeButton).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2',
      );
    });
  });

  describe('Integration Test', () => {
    it('renders complete modal structure', () => {
      render(
        <Modal>
          <ModalTrigger>Open Modal</ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Modal Title</ModalTitle>
              <ModalDescription>Modal description</ModalDescription>
            </ModalHeader>
            <p>Modal body content</p>
            <ModalFooter>
              <ModalClose>Cancel</ModalClose>
              <button>Confirm</button>
            </ModalFooter>
          </ModalContent>
        </Modal>,
      );

      // All components should be rendered
      expect(screen.getByTestId('modal-root')).toBeInTheDocument();
      expect(screen.getByTestId('modal-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('modal-portal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toBeInTheDocument();
      expect(screen.getByTestId('modal-description')).toBeInTheDocument();
      expect(screen.getAllByTestId('modal-close')).toHaveLength(2); // Header close + footer close

      // Content should be present
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByText('Modal description')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('accepts all DialogPrimitive props', () => {
      render(
        <ModalContent
          onOpenChange={() => {}}
          modal={true}
          onOpenAutoFocus={() => {}}
          onCloseAutoFocus={() => {}}
          onEscapeKeyDown={() => {}}
          onPointerDownOutside={() => {}}
          onInteractOutside={() => {}}
        >
          <p>Modal content</p>
        </ModalContent>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('supports all HTML div attributes', () => {
      render(
        <ModalHeader id="modal-header" data-testid="custom-header" style={{ marginTop: '10px' }}>
          Header content
        </ModalHeader>,
      );

      const header = screen.getByText('Header content').closest('div');
      expect(header).toHaveAttribute('id', 'modal-header');
      expect(header).toHaveAttribute('data-testid', 'custom-header');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty modal content', () => {
      render(<ModalContent />);

      const content = screen.getByTestId('modal-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByTestId('modal-close')).toBeInTheDocument();
    });

    it('handles modal without trigger', () => {
      render(
        <Modal>
          <ModalContent>
            <p>Modal content</p>
          </ModalContent>
        </Modal>,
      );

      expect(screen.queryByTestId('modal-trigger')).not.toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('handles multiple modals', () => {
      render(
        <>
          <Modal>
            <ModalTrigger>Modal 1</ModalTrigger>
            <ModalContent>
              <p>Content 1</p>
            </ModalContent>
          </Modal>
          <Modal>
            <ModalTrigger>Modal 2</ModalTrigger>
            <ModalContent>
              <p>Content 2</p>
            </ModalContent>
          </Modal>
        </>,
      );

      expect(screen.getByText('Modal 1')).toBeInTheDocument();
      expect(screen.getByText('Modal 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });
});
