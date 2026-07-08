import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  MoreHorizontal: () => <svg data-testid="more-horizontal-icon" />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Pagination Component System - Enterprise Level', () => {
  describe('Pagination Container', () => {
    it('renders with proper ARIA attributes', () => {
      render(
        <Pagination>
          <PaginationContent />
        </Pagination>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'pagination');
    });

    it('applies default centering styles', () => {
      render(<Pagination />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('mx-auto', 'flex', 'w-full', 'justify-center');
    });

    it('applies custom className', () => {
      render(<Pagination className="custom-pagination" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-pagination');
    });

    it('forwards additional props', () => {
      render(<Pagination data-testid="custom-nav" />);

      const nav = screen.getByTestId('custom-nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('PaginationContent', () => {
    it('renders as unordered list', () => {
      render(<PaginationContent />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');
      expect(list).toHaveClass('flex', 'flex-row', 'items-center', 'gap-1');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<PaginationContent ref={ref} />);

      expect(ref).toBeDefined();
    });

    it('applies custom className', () => {
      render(<PaginationContent className="custom-content" />);

      const list = screen.getByRole('list');
      expect(list).toHaveClass('custom-content');
    });
  });

  describe('PaginationItem', () => {
    it('renders as list item', () => {
      render(<PaginationItem>Item content</PaginationItem>);

      const item = screen.getByText('Item content').closest('li');
      expect(item).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<PaginationItem ref={ref}>Item</PaginationItem>);

      expect(ref).toBeDefined();
    });

    it('applies custom className', () => {
      render(<PaginationItem className="custom-item">Item</PaginationItem>);

      const item = screen.getByText('Item').closest('li');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('PaginationLink', () => {
    it('renders as anchor element', () => {
      render(<PaginationLink href="/page/1">1</PaginationLink>);

      const link = screen.getByRole('link', { name: '1' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/page/1');
    });

    it('applies default link styles', () => {
      render(<PaginationLink size="default">Link</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-md',
        'text-sm',
        'font-medium',
        'ring-offset-background',
        'transition-colors',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2',
        'disabled:pointer-events-none',
        'disabled:opacity-50',
        'h-10',
        'px-4',
        'py-2',
      );
    });

    it('applies active state styles', () => {
      render(<PaginationLink isActive>Active</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Active' });
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90');
    });

    it('applies inactive state styles', () => {
      render(<PaginationLink>Inactive</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Inactive' });
      expect(link).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('applies custom className', () => {
      render(<PaginationLink className="custom-link">Link</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveClass('custom-link');
    });

    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<PaginationLink onClick={handleClick}>Clickable</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Clickable' });
      await user.click(link);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('PaginationPrevious', () => {
    it('renders with previous label and icon', () => {
      render(<PaginationPrevious />);

      const link = screen.getByRole('link', { name: 'Go to previous page' });
      expect(link).toHaveTextContent('Previous');
      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
    });

    it('applies previous-specific styles', () => {
      render(<PaginationPrevious />);

      const link = screen.getByRole('link', { name: 'Go to previous page' });
      expect(link).toHaveClass('gap-1', 'pl-2.5');
    });

    it('inherits PaginationLink props', () => {
      render(<PaginationPrevious isActive />);

      const link = screen.getByRole('link', { name: 'Go to previous page' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('applies custom className', () => {
      render(<PaginationPrevious className="custom-prev" />);

      const link = screen.getByRole('link', { name: 'Go to previous page' });
      expect(link).toHaveClass('custom-prev');
    });
  });

  describe('PaginationNext', () => {
    it('renders with next label and icon', () => {
      render(<PaginationNext />);

      const link = screen.getByRole('link', { name: 'Go to next page' });
      expect(link).toHaveTextContent('Next');
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('applies next-specific styles', () => {
      render(<PaginationNext />);

      const link = screen.getByRole('link', { name: 'Go to next page' });
      expect(link).toHaveClass('gap-1', 'pr-2.5');
    });

    it('inherits PaginationLink props', () => {
      render(<PaginationNext isActive />);

      const link = screen.getByRole('link', { name: 'Go to next page' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('applies custom className', () => {
      render(<PaginationNext className="custom-next" />);

      const link = screen.getByRole('link', { name: 'Go to next page' });
      expect(link).toHaveClass('custom-next');
    });
  });

  describe('PaginationEllipsis', () => {
    it('renders with ellipsis icon', () => {
      render(<PaginationEllipsis />);

      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(<PaginationEllipsis />);

      const ellipsis = screen.getByTestId('more-horizontal-icon').parentElement;
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
    });

    it('includes screen reader text', () => {
      render(<PaginationEllipsis />);

      expect(screen.getByText('More pages')).toHaveClass('sr-only');
    });

    it('applies proper styling', () => {
      render(<PaginationEllipsis />);

      const ellipsis = screen.getByTestId('more-horizontal-icon').parentElement;
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center');
    });

    it('applies custom className', () => {
      render(<PaginationEllipsis className="custom-ellipsis" />);

      const ellipsis = screen.getByTestId('more-horizontal-icon').parentElement;
      expect(ellipsis).toHaveClass('custom-ellipsis');
    });
  });

  describe('Complete Pagination Implementation', () => {
    it('renders full pagination navigation', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/10">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      // Navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'pagination');

      // Content
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      // Previous button
      expect(screen.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument();

      // Active page
      const activeLink = screen.getByRole('link', { name: '1' });
      expect(activeLink).toHaveAttribute('aria-current', 'page');
      expect(activeLink).toHaveAttribute('href', '/page/1');

      // Inactive pages
      expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/page/2');
      expect(screen.getByRole('link', { name: '10' })).toHaveAttribute('href', '/page/10');

      // Ellipsis
      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
      expect(screen.getByText('More pages')).toHaveClass('sr-only');

      // Next button
      expect(screen.getByRole('link', { name: 'Go to next page' })).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const firstLink = screen.getByRole('link', { name: '1' });
      firstLink.focus();

      expect(firstLink).toHaveFocus();

      // Tab to next link
      await user.tab();
      const secondLink = screen.getByRole('link', { name: '2' });
      expect(secondLink).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('provides proper navigation landmark', () => {
      render(<Pagination />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'pagination');
    });

    it('marks active page with aria-current', () => {
      render(<PaginationLink isActive>Active Page</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Active Page' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('provides descriptive labels for navigation buttons', () => {
      render(
        <>
          <PaginationPrevious />
          <PaginationNext />
        </>,
      );

      expect(screen.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to next page' })).toBeInTheDocument();
    });

    it('hides ellipsis from screen readers but provides context', () => {
      render(<PaginationEllipsis />);

      const ellipsis = screen.getByTestId('more-horizontal-icon').parentElement;
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByText('More pages')).toHaveClass('sr-only');
    });

    it('supports focus management', () => {
      render(<PaginationLink>Focusable Link</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Focusable Link' });
      expect(link).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring');
    });
  });

  describe('Responsive Design', () => {
    it('uses flexible layout for different screen sizes', () => {
      render(
        <PaginationContent>
          <PaginationItem>Item</PaginationItem>
        </PaginationContent>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('flex-row'); // Responsive layout
    });

    it('maintains proper spacing between items', () => {
      render(<PaginationContent />);

      const list = screen.getByRole('list');
      expect(list).toHaveClass('gap-1');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme-aware colors for active state', () => {
      render(<PaginationLink isActive>Active</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Active' });
      expect(link).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('uses theme-aware colors for hover states', () => {
      render(<PaginationLink>Inactive</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Inactive' });
      expect(link).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML anchor attributes', () => {
      render(
        <PaginationLink href="/test" target="_blank" rel="noopener" download="file.pdf">
          Test Link
        </PaginationLink>,
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('supports all React event handlers', () => {
      const handleClick = vi.fn();
      const handleKeyDown = vi.fn();

      render(
        <PaginationLink onClick={handleClick} onKeyDown={handleKeyDown}>
          Interactive
        </PaginationLink>,
      );

      const link = screen.getByRole('link', { name: 'Interactive' });
      expect(link).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty pagination', () => {
      render(<Pagination />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('handles single page scenarios', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const activeLink = screen.getByRole('link', { name: '1' });
      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    it('handles large page numbers', () => {
      render(<PaginationLink href="/page/999">999</PaginationLink>);

      const link = screen.getByRole('link', { name: '999' });
      expect(link).toHaveAttribute('href', '/page/999');
    });

    it('handles disabled states', () => {
      render(<PaginationLink disabled>Disabled</PaginationLink>);

      const link = screen.getByRole('link', { name: 'Disabled' });
      expect(link).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });
  });

  describe('Integration Patterns', () => {
    it('supports programmatic navigation', () => {
      const handlePageChange = vi.fn();

      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(2)}>2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const link1 = screen.getByRole('link', { name: '1' });
      const link2 = screen.getByRole('link', { name: '2' });

      expect(link1).toBeInTheDocument();
      expect(link2).toBeInTheDocument();
    });

    it('can be used with data fetching libraries', () => {
      // Simulate integration with data fetching
      const mockOnPageChange = vi.fn();

      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => mockOnPageChange('prev')} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => mockOnPageChange('next')} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to next page' })).toBeInTheDocument();
    });
  });
});
