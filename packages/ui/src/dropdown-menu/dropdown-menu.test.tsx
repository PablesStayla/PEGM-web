import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

// Mock Radix Dropdown Menu components
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  __esModule: true,
  Root: ({ children, open, onOpenChange: _onOpenChange, ...props }: any) => (
    <div data-testid="dropdown-root" data-open={open || undefined} {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, asChild: _asChild, ...props }: any) => (
    <button data-testid="dropdown-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({
    children,
    asChild: _asChild,
    side: _side,
    sideOffset: _sideOffset,
    align: _align,
    alignOffset: _alignOffset,
    ...props
  }: any) => (
    <div data-testid="dropdown-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, disabled, asChild: _asChild, ...props }: any) => (
    <div
      data-testid="dropdown-item"
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled ? '' : undefined}
      {...props}
    >
      {children}
    </div>
  ),
  CheckboxItem: ({
    children,
    checked,
    disabled,
    asChild: _asChild,
    onCheckedChange: _onCheckedChange,
    ...props
  }: any) => (
    <div
      data-testid="dropdown-checkbox-item"
      role="menuitemcheckbox"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </div>
  ),
  RadioItem: ({
    children,
    checked,
    value,
    disabled,
    asChild: _asChild,
    onCheckedChange: _onCheckedChange,
    ...props
  }: any) => (
    <div
      data-testid="dropdown-radio-item"
      role="menuitemradio"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      tabIndex={disabled ? -1 : 0}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  ),
  Label: ({ children, inset: _inset, asChild: _asChild, ...props }: any) => (
    <div data-testid="dropdown-label" {...props}>
      {children}
    </div>
  ),
  Separator: ({ asChild: _asChild, ...props }: any) => (
    <div data-testid="dropdown-separator" {...props} />
  ),
  Portal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
  Group: ({ children, asChild: _asChild, ...props }: any) => (
    <div data-testid="dropdown-group" {...props}>
      {children}
    </div>
  ),
  Sub: ({ children, open: _open, onOpenChange: _onOpenChange, ...props }: any) => (
    <div data-testid="dropdown-sub" {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({ children, disabled, asChild: _asChild, ...props }: any) => (
    <button
      data-testid="dropdown-subtrigger"
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  SubContent: ({
    children,
    asChild: _asChild,
    side: _side,
    sideOffset: _sideOffset,
    align: _align,
    alignOffset: _alignOffset,
    ...props
  }: any) => (
    <div data-testid="dropdown-subcontent" {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children, value, defaultValue, onValueChange: _onValueChange, ...props }: any) => (
    <div
      data-testid="dropdown-radiogroup"
      data-value={value}
      data-default-value={defaultValue}
      {...props}
    >
      {children}
    </div>
  ),
  ItemIndicator: ({ children, asChild: _asChild, ...props }: any) => (
    <span data-testid="dropdown-item-indicator" {...props}>
      {children}
    </span>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  Circle: () => <svg data-testid="circle-icon" />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('DropdownMenu Component System - Enterprise Level', () => {
  describe('DropdownMenu Root', () => {
    it('renders root container', () => {
      render(
        <DropdownMenu>
          <div>Content</div>
        </DropdownMenu>,
      );

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('supports controlled open state', () => {
      render(
        <DropdownMenu open onOpenChange={() => {}}>
          <div>Open menu</div>
        </DropdownMenu>,
      );

      const root = screen.getByTestId('dropdown-root');
      expect(root).toHaveAttribute('data-open');
    });
  });

  describe('DropdownMenuTrigger', () => {
    it('renders trigger button', () => {
      render(<DropdownMenuTrigger>Open menu</DropdownMenuTrigger>);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open menu');
    });

    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<DropdownMenuTrigger onClick={handleClick}>Open menu</DropdownMenuTrigger>);

      const trigger = screen.getByTestId('dropdown-trigger');
      await user.click(trigger);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('DropdownMenuContent', () => {
    it('renders content portal', () => {
      render(<DropdownMenuContent>Menu content</DropdownMenuContent>);

      const portal = screen.getByTestId('dropdown-portal');
      expect(portal).toBeInTheDocument();

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass(
        'z-50',
        'max-h-[var(--radix-dropdown-menu-content-available-height)]',
        'min-w-[8rem]',
        'overflow-y-auto',
        'overflow-x-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'p-1',
        'text-popover-foreground',
        'shadow-md',
      );
    });

    it('applies animation classes', () => {
      render(<DropdownMenuContent>Animated content</DropdownMenuContent>);

      const content = screen.getByTestId('dropdown-content');
      expect(content.className).toMatch(/data-\[state/);
    });

    it('supports custom className', () => {
      render(<DropdownMenuContent className="custom-content">Content</DropdownMenuContent>);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('DropdownMenuItem', () => {
    it('renders menu item with proper styling', () => {
      render(<DropdownMenuItem>Item</DropdownMenuItem>);

      const item = screen.getByTestId('dropdown-item');
      expect(item).toHaveClass(
        'relative',
        'flex',
        'cursor-default',
        'select-none',
        'items-center',
        'gap-2',
        'rounded-sm',
        'px-2',
        'py-1.5',
        'text-sm',
        'outline-none',
        'transition-colors',
        'focus:bg-accent',
        'focus:text-accent-foreground',
      );
    });

    it('supports inset prop', () => {
      render(<DropdownMenuItem inset>Inset item</DropdownMenuItem>);

      const item = screen.getByTestId('dropdown-item');
      expect(item).toHaveClass('pl-8');
    });

    it('supports disabled state', () => {
      render(<DropdownMenuItem disabled>Disabled item</DropdownMenuItem>);

      const item = screen.getByTestId('dropdown-item');
      expect(item).toHaveAttribute('data-disabled');
      expect(item).toHaveClass('data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders checkbox item with indicator', () => {
      render(<DropdownMenuCheckboxItem checked>Checkbox item</DropdownMenuCheckboxItem>);

      const checkbox = screen.getByTestId('dropdown-checkbox-item');
      expect(checkbox).toHaveClass('relative', 'flex', 'cursor-default', 'select-none');
      expect(screen.getByTestId('dropdown-item-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('supports checked prop', () => {
      render(<DropdownMenuCheckboxItem checked>Checked item</DropdownMenuCheckboxItem>);

      const checkbox = screen.getByTestId('dropdown-checkbox-item');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('DropdownMenuRadioItem', () => {
    it('renders radio item with indicator', () => {
      render(<DropdownMenuRadioItem value="option">Radio item</DropdownMenuRadioItem>);

      const radio = screen.getByTestId('dropdown-radio-item');
      expect(radio).toHaveClass('relative', 'flex', 'cursor-default', 'select-none');
      expect(screen.getByTestId('dropdown-item-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });

    it('supports value prop', () => {
      render(<DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>);

      const radio = screen.getByTestId('dropdown-radio-item');
      expect(radio).toHaveAttribute('data-value', 'option1');
    });
  });

  describe('DropdownMenuLabel', () => {
    it('renders label with proper styling', () => {
      render(<DropdownMenuLabel>Label</DropdownMenuLabel>);

      const label = screen.getByTestId('dropdown-label');
      expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold');
    });

    it('supports inset prop', () => {
      render(<DropdownMenuLabel inset>Inset label</DropdownMenuLabel>);

      const label = screen.getByTestId('dropdown-label');
      expect(label).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separator with proper styling', () => {
      render(<DropdownMenuSeparator />);

      const separator = screen.getByTestId('dropdown-separator');
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders shortcut text with styling', () => {
      render(<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>);

      const shortcut = screen.getByText('⌘S');
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'opacity-60');
    });

    it('supports custom className', () => {
      render(<DropdownMenuShortcut className="custom-shortcut">Ctrl+C</DropdownMenuShortcut>);

      const shortcut = screen.getByText('Ctrl+C');
      expect(shortcut).toHaveClass('custom-shortcut');
    });
  });

  describe('DropdownMenuSubTrigger & Content', () => {
    it('renders sub trigger with icon', () => {
      render(<DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>);

      const subTrigger = screen.getByTestId('dropdown-subtrigger');
      expect(subTrigger).toHaveTextContent('Sub menu');
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('applies inset styling when requested', () => {
      render(<DropdownMenuSubTrigger inset>Inset sub menu</DropdownMenuSubTrigger>);

      const subTrigger = screen.getByTestId('dropdown-subtrigger');
      expect(subTrigger).toHaveClass('pl-8');
    });

    it('renders sub content with styling', () => {
      render(
        <DropdownMenuSubContent>
          <DropdownMenuItem>Sub item</DropdownMenuItem>
        </DropdownMenuSubContent>,
      );

      const subContent = screen.getByTestId('dropdown-subcontent');
      expect(subContent).toHaveClass(
        'z-50',
        'min-w-[8rem]',
        'rounded-md',
        'border',
        'bg-popover',
        'p-1',
      );
    });
  });

  describe('DropdownMenuRadioGroup', () => {
    it('renders radio group with items', () => {
      render(
        <DropdownMenuRadioGroup value="option1">
          <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>,
      );

      const radioGroup = screen.getByTestId('dropdown-radiogroup');
      expect(radioGroup).toBeInTheDocument();

      const radioItems = screen.getAllByTestId('dropdown-radio-item');
      expect(radioItems).toHaveLength(2);
      expect(radioItems[0]).toHaveAttribute('data-value', 'option1');
      expect(radioItems[1]).toHaveAttribute('data-value', 'option2');
    });

    it('supports default value', () => {
      render(
        <DropdownMenuRadioGroup defaultValue="default">
          <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>,
      );

      const radioGroup = screen.getByTestId('dropdown-radiogroup');
      expect(radioGroup).toHaveAttribute('data-default-value', 'default');
    });
  });

  describe('DropdownMenuGroup', () => {
    it('renders group with children', () => {
      render(
        <DropdownMenuGroup>
          <DropdownMenuItem>Grouped item</DropdownMenuItem>
        </DropdownMenuGroup>,
      );

      const group = screen.getByTestId('dropdown-group');
      expect(group).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSub', () => {
    it('renders sub menu with trigger and content', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenu>,
      );

      expect(screen.getByTestId('dropdown-sub')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-subtrigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-subcontent')).toBeInTheDocument();
    });
  });
});
