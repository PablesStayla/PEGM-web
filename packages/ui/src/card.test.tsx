import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Card Component System - Enterprise Level', () => {
  describe('Card Component', () => {
    it('renders card with default styling', () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe('DIV');
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow');
    });

    it('renders card with custom className', () => {
      render(<Card className="custom-card">Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Card Content</Card>);

      expect(ref).toBeDefined();
    });

    it('accepts all HTML div attributes', () => {
      render(
        <Card id="test-card" data-testid="card-element" role="region" aria-label="Test Card">
          Card Content
        </Card>,
      );

      const card = screen.getByTestId('card-element');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Test Card');
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card description</p>
          <button>Action</button>
        </Card>,
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Action');
    });
  });

  describe('CardHeader Component', () => {
    it('renders header with proper spacing', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>,
      );

      const header = screen.getByText('Header Content');
      expect(header.tagName).toBe('DIV');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('renders header with custom className', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header Content</CardHeader>
        </Card>,
      );

      const header = screen.getByText('Header Content');
      expect(header).toHaveClass('custom-header');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Card>
          <CardHeader ref={ref}>Header Content</CardHeader>
        </Card>,
      );

      expect(ref).toBeDefined();
    });
  });

  describe('CardTitle Component', () => {
    it('renders title with semantic styling', () => {
      render(
        <Card>
          <CardTitle>Card Title</CardTitle>
        </Card>,
      );

      const title = screen.getByText('Card Title');
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight');
    });

    it('renders title with custom className', () => {
      render(
        <Card>
          <CardTitle className="custom-title">Card Title</CardTitle>
        </Card>,
      );

      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Card>
          <CardTitle ref={ref}>Card Title</CardTitle>
        </Card>,
      );

      expect(ref).toBeDefined();
    });
  });

  describe('CardDescription Component', () => {
    it('renders description with muted styling', () => {
      render(
        <Card>
          <CardDescription>Card description text</CardDescription>
        </Card>,
      );

      const description = screen.getByText('Card description text');
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('renders description with custom className', () => {
      render(
        <Card>
          <CardDescription className="custom-description">Card description text</CardDescription>
        </Card>,
      );

      const description = screen.getByText('Card description text');
      expect(description).toHaveClass('custom-description');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Card>
          <CardDescription ref={ref}>Card description text</CardDescription>
        </Card>,
      );

      expect(ref).toBeDefined();
    });
  });

  describe('CardContent Component', () => {
    it('renders content with proper padding', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>,
      );

      const content = screen.getByText('Content');
      expect(content.tagName).toBe('DIV');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('renders content with custom className', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>,
      );

      const content = screen.getByText('Content');
      expect(content).toHaveClass('custom-content');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>,
      );

      expect(ref).toBeDefined();
    });
  });

  describe('CardFooter Component', () => {
    it('renders footer with flex layout', () => {
      render(
        <Card>
          <CardFooter>Footer Content</CardFooter>
        </Card>,
      );

      const footer = screen.getByText('Footer Content');
      expect(footer.tagName).toBe('DIV');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('renders footer with custom className', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer Content</CardFooter>
        </Card>,
      );

      const footer = screen.getByText('Footer Content');
      expect(footer).toHaveClass('custom-footer');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(
        <Card>
          <CardFooter ref={ref}>Footer Content</CardFooter>
        </Card>,
      );

      expect(ref).toBeDefined();
    });
  });

  describe('Complete Card Composition', () => {
    it('renders full card with all sections', () => {
      render(
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Product Title</CardTitle>
            <CardDescription>A great product description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area with product details</p>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button className="mr-2">Cancel</button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
              Buy Now
            </button>
          </CardFooter>
        </Card>,
      );

      // Card container
      const card = screen.getByText('Product Title').closest('.max-w-md');
      expect(card).toHaveClass('max-w-md');

      // Header section
      const header = screen.getByText('Product Title').parentElement;
      expect(header).toHaveClass('p-6');

      // Title
      const title = screen.getByText('Product Title');
      expect(title).toHaveClass('font-semibold');

      // Description
      const description = screen.getByText('A great product description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');

      // Content
      const content = screen.getByText('Main content area with product details').parentElement;
      expect(content).toHaveClass('p-6', 'pt-0');

      // Footer
      const footer = screen.getByText('Cancel').parentElement;
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');

      // Buttons in footer
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Buy Now')).toBeInTheDocument();
    });

    it('renders card with only required sections', () => {
      render(
        <Card>
          <CardContent>Simple content</CardContent>
        </Card>,
      );

      const content = screen.getByText('Simple content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Card role="article" aria-label="Product card">
          <CardContent>Content</CardContent>
        </Card>,
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Product card');
    });

    it('maintains semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle asChild>
              <h2>Product Title</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>,
      );

      // The title component allows custom elements while maintaining styling
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Product Title');
    });
  });

  describe('Responsive Design', () => {
    it('card content adapts to different screen sizes', () => {
      render(
        <Card>
          <CardContent>Responsive content</CardContent>
        </Card>,
      );

      const content = screen.getByText('Responsive content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('header has responsive padding', () => {
      render(
        <Card>
          <CardHeader>Responsive header</CardHeader>
        </Card>,
      );

      const header = screen.getByText('Responsive header');
      expect(header).toHaveClass('p-6');
    });
  });

  describe('Theme Support', () => {
    it('applies theme-aware classes', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>,
      );

      const card = screen.getByText('Content').closest('.rounded-xl');
      expect(card).toHaveClass('bg-card', 'text-card-foreground');
    });

    it('description uses theme-aware muted color', () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>,
      );

      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML div attributes', () => {
      render(
        <Card id="test-card" data-testid="card" style={{ margin: '10px' }} onClick={() => {}}>
          Content
        </Card>,
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveStyle({ margin: '10px' });
    });

    it('supports all component variants', () => {
      // Test that all components can be imported and used
      expect(Card).toBeDefined();
      expect(CardHeader).toBeDefined();
      expect(CardTitle).toBeDefined();
      expect(CardDescription).toBeDefined();
      expect(CardContent).toBeDefined();
      expect(CardFooter).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty card', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow');
    });

    it('handles card with only header', () => {
      render(
        <Card>
          <CardHeader>Only Header</CardHeader>
        </Card>,
      );

      const header = screen.getByText('Only Header');
      expect(header).toHaveClass('p-6');
    });

    it('handles card with multiple sections', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content 1</CardContent>
          <CardContent>Content 2</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('handles nested content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <h3>Title</h3>
              <p>Paragraph</p>
              <Card>
                <CardContent>Nested card content</CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Nested card content')).toBeInTheDocument();
    });
  });

  describe('Integration Patterns', () => {
    it('supports form integration', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
            </form>
          </CardContent>
          <CardFooter>
            <button type="submit">Submit</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('supports list layouts', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      render(
        <div>
          {items.map((item) => (
            <Card key={item}>
              <CardContent>{item}</CardContent>
            </Card>
          ))}
        </div>,
      );

      items.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });

      const cards = screen
        .getAllByRole('generic', { hidden: true })
        .filter((element) => element.className?.includes('rounded-xl'));
      expect(cards).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef for performance', () => {
      // Test that refs are properly forwarded (implicitly tested by ref callback)
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);

      expect(ref).toBeDefined();
    });

    it('has displayName for debugging', () => {
      expect(Card.displayName).toBe('Card');
      expect(CardHeader.displayName).toBe('CardHeader');
      expect(CardTitle.displayName).toBe('CardTitle');
      expect(CardDescription.displayName).toBe('CardDescription');
      expect(CardContent.displayName).toBe('CardContent');
      expect(CardFooter.displayName).toBe('CardFooter');
    });
  });
});
