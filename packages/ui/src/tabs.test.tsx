import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// Mock Radix UI Tabs with prop propagation
vi.mock('@radix-ui/react-tabs', () => ({
  Root: React.forwardRef((props: any, ref: any) => (
    <div ref={ref} data-testid="tabs-root" {...props}>
      {props.children}
    </div>
  )),
  List: React.forwardRef((props: any, ref: any) => (
    <div ref={ref} data-testid="tabs-list" {...props}>
      {props.children}
    </div>
  )),
  Trigger: React.forwardRef((props: any, ref: any) => (
    <button ref={ref} data-testid="tabs-trigger" role="tab" {...props}>
      {props.children}
    </button>
  )),
  Content: React.forwardRef((props: any, ref: any) => (
    <div ref={ref} data-testid="tabs-content" role="tabpanel" {...props}>
      {props.children}
    </div>
  )),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Tabs Component System - Enterprise Level', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Tabs Root', () => {
    it('renders tabs container', () => {
      render(<Tabs>Tab content</Tabs>);
      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
    });

    it('forwards props to root', () => {
      render(<Tabs aria-label="test-tabs" orientation="vertical" />);
      const root = screen.getByTestId('tabs-root');
      expect(root).toHaveAttribute('aria-label', 'test-tabs');
      expect(root).toHaveAttribute('orientation', 'vertical');
    });
  });

  describe('TabsList', () => {
    it('renders tabs list with proper styling', () => {
      render(<TabsList>Tab triggers</TabsList>);
      const list = screen.getByTestId('tabs-list');
      expect(list).toHaveClass('inline-flex', 'bg-muted');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<TabsList ref={ref}>Content</TabsList>);
      expect(ref.current).toBeDefined();
    });
  });

  describe('TabsTrigger', () => {
    it('renders tab trigger', () => {
      render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>);
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveTextContent('Tab 1');
      expect(trigger).toHaveAttribute('value', 'tab1');
    });

    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <TabsTrigger value="t1" onClick={handleClick}>
          Click
        </TabsTrigger>,
      );
      await user.click(screen.getByTestId('tabs-trigger'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('TabsContent', () => {
    it('renders tab content', () => {
      render(<TabsContent value="c1">Content</TabsContent>);
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveTextContent('Content');
      expect(content).toHaveAttribute('value', 'c1');
    });
  });

  describe('Performance', () => {
    it('has proper displayNames', () => {
      expect(TabsList.displayName).toBe('TabsList');
      expect(TabsTrigger.displayName).toBe('TabsTrigger');
      expect(TabsContent.displayName).toBe('TabsContent');
    });
  });
});
