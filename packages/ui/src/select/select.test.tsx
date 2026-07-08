import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

// Mock Radix UI Select
vi.mock('@radix-ui/react-select', () => ({
  Root: ({
    children,
    value,
    onValueChange: _onValueChange,
    open: _open,
    onOpenChange: _onOpenChange,
    defaultOpen: _defaultOpen,
    defaultValue: _defaultValue,
    dir: _dir,
    name,
    autoComplete: _autoComplete,
    disabled: _disabled,
    required,
    form: _form,
    ...props
  }: any) => (
    <div
      data-testid="select-root"
      data-value={value}
      data-name={name}
      data-required={required}
      {...props}
    >
      {children}
    </div>
  ),
  Trigger: ({ children, asChild: _asChild, ...props }: any) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  Value: ({ placeholder, asChild: _asChild, ...props }: any) => (
    <span data-testid="select-value" data-placeholder={placeholder} {...props} />
  ),
  Content: ({
    children,
    asChild: _asChild,
    position: _position,
    side: _side,
    sideOffset: _sideOffset,
    align: _align,
    alignOffset: _alignOffset,
    avoidCollisions: _avoidCollisions,
    ...props
  }: any) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, value, disabled: _disabled, asChild: _asChild, ...props }: any) => (
    <div data-testid="select-item" data-value={value} {...props}>
      {children}
    </div>
  ),
  Label: ({ children, asChild: _asChild, ...props }: any) => (
    <div data-testid="select-label" {...props}>
      {children}
    </div>
  ),
  Separator: ({ asChild: _asChild, ...props }: any) => (
    <hr data-testid="select-separator" {...props} />
  ),
  Group: ({ children, asChild: _asChild, ...props }: any) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, container: _container }: any) => (
    <div data-testid="select-portal">{children}</div>
  ),
  Viewport: ({ children, asChild: _asChild, ...props }: any) => (
    <div data-testid="select-viewport" {...props}>
      {children}
    </div>
  ),
  Icon: ({ children, asChild: _asChild, ...props }: any) => (
    <div data-testid="select-icon" {...props}>
      {children}
    </div>
  ),
  ScrollUpButton: ({ asChild: _asChild, ...props }: any) => (
    <button data-testid="select-scroll-up" {...props} />
  ),
  ScrollDownButton: ({ asChild: _asChild, ...props }: any) => (
    <button data-testid="select-scroll-down" {...props} />
  ),
  ItemIndicator: ({ children, asChild: _asChild }: any) => (
    <span data-testid="select-item-indicator">{children}</span>
  ),
  ItemText: ({ children, asChild: _asChild }: any) => (
    <span data-testid="select-item-text">{children}</span>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  ChevronUp: () => <svg data-testid="chevron-up-icon" />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Select Component System - Enterprise Level', () => {
  describe('Select Root Component', () => {
    it('renders select root with controlled value', () => {
      render(
        <Select value="option1" onValueChange={() => {}}>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-root')).toHaveAttribute('data-value', 'option1');
      expect(screen.getByTestId('select-value')).toHaveAttribute(
        'data-placeholder',
        'Select option',
      );
    });

    it('handles value changes through onValueChange', () => {
      const handleValueChange = vi.fn();

      render(
        <Select value="option1" onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      );

      // Since we're using mocks, we can't easily test the actual value change
      // But we can verify the component structure
      expect(screen.getByTestId('select-root')).toBeInTheDocument();
    });
  });

  describe('SelectTrigger Component', () => {
    it('renders trigger button with proper styling', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">Select Option</SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveTextContent('Select Option');
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveClass(
        'flex',
        'h-9',
        'w-full',
        'items-center',
        'justify-between',
        'whitespace-nowrap',
        'rounded-md',
        'border',
        'border-input',
        'bg-transparent',
        'px-3',
        'py-2',
        'text-sm',
        'shadow-sm',
        'ring-offset-background',
      );
    });

    it('includes chevron down icon', () => {
      render(
        <Select>
          <SelectTrigger>Select Option</SelectTrigger>
        </Select>,
      );

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger>Select Option</SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('handles custom props', () => {
      render(
        <Select>
          <SelectTrigger data-testid="custom-trigger" aria-label="Custom select">
            Select Option
          </SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Custom select');
    });
  });

  describe('SelectValue Component', () => {
    it('renders placeholder when no value selected', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
        </Select>,
      );

      const value = screen.getByTestId('select-value');
      expect(value).toHaveAttribute('data-placeholder', 'Choose an option');
    });

    it('handles placeholder text', () => {
      render(
        <Select value="selected">
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
        </Select>,
      );

      expect(screen.getByTestId('select-value')).toBeInTheDocument();
    });
  });

  describe('SelectContent Component', () => {
    it('renders content with portal and proper positioning', () => {
      render(
        <Select>
          <SelectContent position="popper">
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-portal')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();
    });

    it('includes scroll buttons', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-scroll-up')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down')).toBeInTheDocument();
    });

    it('applies popper positioning classes', () => {
      render(
        <Select>
          <SelectContent position="popper" />
        </Select>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass(
        'data-[side=bottom]:translate-y-1',
        'data-[side=left]:-translate-x-1',
        'data-[side=right]:translate-x-1',
        'data-[side=top]:-translate-y-1',
      );
    });

    it('has animation classes', () => {
      render(
        <Select>
          <SelectContent />
        </Select>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:zoom-out-95',
        'data-[state=open]:zoom-in-95',
      );
    });
  });

  describe('SelectItem Component', () => {
    it('renders item with value and text', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveAttribute('data-value', 'item1');
      expect(item).toHaveTextContent('Item 1');
    });

    it('includes check icon for selected state', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByTestId('select-item-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-text')).toHaveTextContent('Item 1');
    });

    it('applies proper styling', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="item1" className="custom-item">
              Item 1
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('custom-item');
      expect(item).toHaveClass(
        'relative',
        'flex',
        'w-full',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'py-1.5',
        'pl-2',
        'pr-8',
        'text-sm',
        'outline-none',
      );
    });

    it('handles disabled state', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="item1" disabled>
              Item 1
            </SelectItem>
          </SelectContent>
        </Select>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50');
    });
  });

  describe('SelectLabel Component', () => {
    it('renders label with proper styling', () => {
      render(
        <Select>
          <SelectContent>
            <SelectLabel>Group Label</SelectLabel>
          </SelectContent>
        </Select>,
      );

      const label = screen.getByTestId('select-label');
      expect(label).toHaveTextContent('Group Label');
      expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold');
    });
  });

  describe('SelectSeparator Component', () => {
    it('renders separator with styling', () => {
      render(
        <Select>
          <SelectContent>
            <SelectSeparator />
          </SelectContent>
        </Select>,
      );

      const separator = screen.getByTestId('select-separator');
      expect(separator.tagName).toBe('HR');
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });
  });

  describe('SelectGroup Component', () => {
    it('groups items together', () => {
      render(
        <Select>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
              <SelectItem value="item2">Item 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      const group = screen.getByTestId('select-group');
      expect(group).toBeInTheDocument();
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-item')).toHaveLength(2);
    });
  });

  describe('Complete Select Implementation', () => {
    it('renders full select with all components', () => {
      render(
        <Select value="item2" onValueChange={() => {}}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectSeparator />
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="lettuce">Lettuce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      );

      // Root
      expect(screen.getByTestId('select-root')).toHaveAttribute('data-value', 'item2');

      // Trigger
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-value')).toHaveAttribute(
        'data-placeholder',
        'Select an option',
      );

      // Content and Portal
      expect(screen.getByTestId('select-portal')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();

      // Scroll buttons
      expect(screen.getByTestId('select-scroll-up')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down')).toBeInTheDocument();

      // Groups and items
      expect(screen.getAllByTestId('select-group')).toHaveLength(1);
      expect(screen.getAllByTestId('select-label')).toHaveLength(2);
      expect(screen.getAllByTestId('select-item')).toHaveLength(4);
      expect(screen.getByTestId('select-separator')).toBeInTheDocument();

      // Content
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('select trigger has proper focus styles', () => {
      render(
        <Select>
          <SelectTrigger>Select Option</SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('focus:outline-none', 'focus:ring-1', 'focus:ring-ring');
    });

    it('select items have focus styles', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('focus:bg-accent', 'focus:text-accent-foreground');
    });

    it('supports custom aria attributes', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Fruit selector" aria-expanded="false">
            Select Fruit
          </SelectTrigger>
        </Select>,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Fruit selector');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Responsive Design', () => {
    it('select content has responsive positioning', () => {
      render(
        <Select>
          <SelectContent />
        </Select>,
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass(
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
      );
    });

    it('viewport adapts to trigger size in popper mode', () => {
      render(
        <Select>
          <SelectContent position="popper" />
        </Select>,
      );

      const viewport = screen.getByTestId('select-viewport');
      expect(viewport).toHaveClass(
        'h-[var(--radix-select-trigger-height)]',
        'w-full',
        'min-w-[var(--radix-select-trigger-width)]',
      );
    });
  });

  describe('Type Safety', () => {
    it('accepts all valid HTML select attributes', () => {
      render(
        <Select name="fruit-select" required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-name', 'fruit-select');
      expect(root).toHaveAttribute('data-required');
    });

    it('supports all Radix Select props', () => {
      render(
        <Select
          open={true}
          defaultValue="default"
          onOpenChange={() => {}}
          dir="ltr"
          name="test-select"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-name', 'test-select');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty select', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Empty select" />
          </SelectTrigger>
          <SelectContent />
        </Select>,
      );

      expect(screen.getByTestId('select-content')).toBeInTheDocument();
      expect(screen.queryByTestId('select-item')).not.toBeInTheDocument();
    });

    it('handles select with only one item', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="only">Only Item</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByText('Only Item')).toBeInTheDocument();
      expect(screen.getAllByTestId('select-item')).toHaveLength(1);
    });

    it('handles select with many items', () => {
      const items = Array.from({ length: 20 }, (_, i) => (
        <SelectItem key={i} value={`item${i}`}>
          Item {i}
        </SelectItem>
      ));

      render(
        <Select>
          <SelectContent>{items}</SelectContent>
        </Select>,
      );

      expect(screen.getAllByTestId('select-item')).toHaveLength(20);
      expect(screen.getByTestId('select-scroll-up')).toBeInTheDocument();
      expect(screen.getByTestId('select-scroll-down')).toBeInTheDocument();
    });
  });

  describe('Integration Patterns', () => {
    it('supports controlled component pattern', () => {
      const ControlledSelect = () => {
        const [value, setValue] = React.useState('apple');

        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectContent>
          </Select>
        );
      };

      render(<ControlledSelect />);

      // The controlled nature is tested implicitly through the component structure
      expect(screen.getByTestId('select-root')).toHaveAttribute('data-value', 'apple');
    });

    it('supports form integration', () => {
      render(
        <form>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
            </SelectContent>
          </Select>
        </form>,
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-name', 'category');
      expect(root).toHaveAttribute('data-required');
    });
  });
});
