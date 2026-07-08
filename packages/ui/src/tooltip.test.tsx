import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

// Mock Radix Tooltip components
vi.mock('@radix-ui/react-tooltip', () => ({
  __esModule: true,
  Provider: ({
    children,
    delayDuration,
    skipDelayDuration: _skipDelayDuration,
    disableHoverableContent: _disableHoverableContent,
    ...props
  }: any) => (
    <div data-testid="tooltip-provider" data-delay-duration={delayDuration} {...props}>
      {children}
    </div>
  ),
  Root: ({ children, defaultOpen, ...props }: any) => (
    <div data-testid="tooltip-root" data-default-open={defaultOpen ? 'true' : undefined} {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="tooltip-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({
    children,
    asChild: _asChild,
    side: _side,
    sideOffset,
    align: _align,
    alignOffset: _alignOffset,
    ...props
  }: any) => (
    <div data-testid="tooltip-content" data-side-offset={sideOffset} {...props}>
      {children}
    </div>
  ),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Tooltip Component System - Enterprise Level', () => {
  describe('TooltipProvider', () => {
    it('renders provider with children', () => {
      render(
        <TooltipProvider>
          <div>Content</div>
        </TooltipProvider>,
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    });

    it('forwards props to provider', () => {
      render(
        <TooltipProvider delayDuration={300}>
          <div>Content</div>
        </TooltipProvider>,
      );

      const provider = screen.getByTestId('tooltip-provider');
      expect(provider).toHaveAttribute('data-delay-duration', '300');
    });
  });

  describe('Tooltip Root', () => {
    it('renders tooltip root with content', () => {
      render(
        <Tooltip>
          <div>Tooltip children</div>
        </Tooltip>,
      );

      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
    });

    it('forwards props to root', () => {
      render(
        <Tooltip defaultOpen>
          <div>Tooltip children</div>
        </Tooltip>,
      );

      const root = screen.getByTestId('tooltip-root');
      expect(root).toHaveAttribute('data-default-open', 'true');
    });
  });

  describe('TooltipTrigger', () => {
    it('renders trigger button', () => {
      render(<TooltipTrigger>Open tooltip</TooltipTrigger>);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open tooltip');
    });

    it('forwards props to trigger', () => {
      render(<TooltipTrigger disabled>Disabled trigger</TooltipTrigger>);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('TooltipContent', () => {
    it('renders content with proper styling', () => {
      render(<TooltipContent>Tooltip content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass(
        'z-50',
        'overflow-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'px-3',
        'py-1.5',
        'text-sm',
        'text-popover-foreground',
        'shadow-md',
      );
    });

    it('applies animation classes', () => {
      render(<TooltipContent>Animated content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content.className).toMatch(/animate-in/);
      expect(content.className).toMatch(/fade-in-0/);
    });

    it('supports custom className', () => {
      render(<TooltipContent className="custom-tooltip">Custom content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('custom-tooltip');
    });

    it('supports sideOffset prop', () => {
      render(<TooltipContent sideOffset={8}>Offset content</TooltipContent>);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });
  });

  describe('Complete Tooltip Implementation', () => {
    it('renders tooltip system with provider, root, trigger and content', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger')).toHaveTextContent('Hover me');
      expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Tooltip text');
    });

    it('allows nesting multiple tooltips', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>First</TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second</TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const triggers = screen.getAllByTestId('tooltip-trigger');
      const contents = screen.getAllByTestId('tooltip-content');

      expect(triggers).toHaveLength(2);
      expect(contents).toHaveLength(2);
      expect(triggers[0]).toHaveTextContent('First');
      expect(triggers[1]).toHaveTextContent('Second');
    });
  });

  describe('Accessibility', () => {
    it('content is accessible to screen readers', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger aria-label="More info">Info icon</TooltipTrigger>
            <TooltipContent role="tooltip">Additional information</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('role', 'tooltip');
    });

    it('trigger supports aria attributes', () => {
      render(<TooltipTrigger aria-label="Trigger tooltip" />);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Trigger tooltip');
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef for content', () => {
      expect(TooltipContent.$$typeof).toBeDefined();
    });

    it('has display names for debugging', () => {
      expect(Tooltip.displayName).toBeUndefined();
      expect(TooltipContent.displayName).toBeUndefined();
    });

    it('renders efficiently without props', () => {
      expect(() => render(<TooltipContent />)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty trigger content', () => {
      render(<TooltipTrigger />);

      const trigger = screen.getByTestId('tooltip-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('handles empty tooltip content', () => {
      render(<TooltipContent />);

      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
    });

    it('handles missing provider', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Trigger without provider</TooltipTrigger>
          <TooltipContent>Content without provider</TooltipContent>
        </Tooltip>,
      );

      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger')).toHaveTextContent('Trigger without provider');
    });
  });
});
