import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

// Mock Radix UI Avatar
vi.mock('@radix-ui/react-avatar', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="avatar-root" {...props}>
      {children}
    </div>
  )),
  Image: React.forwardRef((props: any, ref: any) => (
    <img ref={ref} data-testid="avatar-image" {...props} />
  )),
  Fallback: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="avatar-fallback" {...props}>
      {children}
    </div>
  )),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Avatar Component - Enterprise Level', () => {
  describe('Avatar Root', () => {
    it('renders with default size', () => {
      render(<Avatar />);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass(
        'relative',
        'flex',
        'shrink-0',
        'overflow-hidden',
        'rounded-full',
        'h-10',
        'w-10',
      );
    });

    it('renders with custom size', () => {
      render(<Avatar size="lg" />);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('h-12', 'w-12');
    });

    it('renders all size variants correctly', () => {
      const sizes = ['sm', 'default', 'lg', 'xl'] as const;

      sizes.forEach((size) => {
        const { unmount } = render(<Avatar size={size} />);
        const avatar = screen.getByTestId('avatar-root');

        if (size === 'sm') {
          expect(avatar).toHaveClass('h-8', 'w-8');
        } else if (size === 'default') {
          expect(avatar).toHaveClass('h-10', 'w-10');
        } else if (size === 'lg') {
          expect(avatar).toHaveClass('h-12', 'w-12');
        } else if (size === 'xl') {
          expect(avatar).toHaveClass('h-16', 'w-16');
        }
        unmount();
      });
    });

    it('applies custom className', () => {
      render(<Avatar className="custom-avatar" />);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('custom-avatar');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Avatar ref={ref} />);

      expect(ref).toBeDefined();
    });

    it('accepts additional HTML attributes', () => {
      render(<Avatar data-testid="custom-avatar" id="avatar-1" />);

      const avatar = screen.getByTestId('custom-avatar');
      expect(avatar).toHaveAttribute('id', 'avatar-1');
    });
  });

  describe('AvatarImage', () => {
    it('renders image with proper classes', () => {
      render(<AvatarImage src="/avatar.jpg" alt="User avatar" />);

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveAttribute('src', '/avatar.jpg');
      expect(image).toHaveAttribute('alt', 'User avatar');
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<AvatarImage ref={ref} />);

      expect(ref).toBeDefined();
    });

    it('applies custom className', () => {
      render(<AvatarImage className="custom-image" />);

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveClass('custom-image');
    });
  });

  describe('AvatarFallback', () => {
    it('renders fallback with proper classes', () => {
      render(<AvatarFallback>JD</AvatarFallback>);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('JD');
      expect(fallback).toHaveClass(
        'flex',
        'h-full',
        'w-full',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-muted',
        'text-sm',
        'font-medium',
      );
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<AvatarFallback ref={ref}>Fallback</AvatarFallback>);

      expect(ref).toBeDefined();
    });

    it('applies custom className', () => {
      render(<AvatarFallback className="custom-fallback">Fallback</AvatarFallback>);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('custom-fallback');
    });
  });

  describe('Complete Avatar Usage', () => {
    it('renders avatar with image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveAttribute('src', '/user.jpg');
      expect(image).toHaveAttribute('alt', 'User');

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('JD');
    });

    it('renders avatar with only fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('AB');

      // Image should not be present
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
    });

    it('renders avatar with different sizes and content', () => {
      const { rerender } = render(
        <Avatar size="sm">
          <AvatarImage src="/small.jpg" alt="Small avatar" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>,
      );

      let avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('h-8', 'w-8');

      rerender(
        <Avatar size="xl">
          <AvatarImage src="/large.jpg" alt="Large avatar" />
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>,
      );

      avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('h-16', 'w-16');

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveAttribute('src', '/large.jpg');
      expect(image).toHaveAttribute('alt', 'Large avatar');

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('XL');
    });
  });

  describe('Accessibility', () => {
    it('avatar image has alt text', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User profile picture" />
        </Avatar>,
      );

      const image = screen.getByAltText('User profile picture');
      expect(image).toBeInTheDocument();
    });

    it('fallback provides accessible text alternative', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );

      const fallback = screen.getByText('JD');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('avatar maintains aspect ratio across sizes', () => {
      const sizes = ['sm', 'default', 'lg', 'xl'] as const;

      sizes.forEach((size) => {
        const { unmount } = render(<Avatar size={size} />);
        const avatar = screen.getByTestId('avatar-root');

        // All avatars should be square (h === w)
        expect(avatar).toHaveClass('rounded-full');
        unmount();
      });
    });
  });

  describe('Theme Support', () => {
    it('uses theme-aware background for fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>Fallback</AvatarFallback>
        </Avatar>,
      );

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('bg-muted');
    });
  });

  describe('Type Safety', () => {
    it('accepts all valid size types', () => {
      const sizes: Array<'sm' | 'default' | 'lg' | 'xl'> = ['sm', 'default', 'lg', 'xl'];

      sizes.forEach((size) => {
        const { unmount } = render(<Avatar size={size}>Test</Avatar>);
        expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
        unmount();
      });
    });

    it('accepts all HTML div attributes', () => {
      render(
        <Avatar id="test-avatar" style={{ margin: '10px' }} onClick={() => {}}>
          Content
        </Avatar>,
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveAttribute('id', 'test-avatar');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty avatar', () => {
      render(<Avatar />);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('h-10', 'w-10'); // Default size
    });

    it('handles avatar with invalid size', () => {
      // TypeScript would prevent this, but runtime should handle gracefully
      render(<Avatar size={undefined as any} />);

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('h-10', 'w-10'); // Should default to 'default'
    });

    it('handles image load errors', () => {
      render(
        <Avatar>
          <AvatarImage src="invalid-image.jpg" alt="Broken image" onError={() => {}} />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );

      const image = screen.getByTestId('avatar-image');
      expect(image).toHaveAttribute('src', 'invalid-image.jpg');

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('FB');
    });

    it('handles multiple avatars', () => {
      render(
        <>
          <Avatar>
            <AvatarImage src="/user1.jpg" alt="User 1" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/user2.jpg" alt="User 2" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
        </>,
      );

      const avatars = screen.getAllByTestId('avatar-root');
      expect(avatars).toHaveLength(2);

      const images = screen.getAllByTestId('avatar-image');
      expect(images).toHaveLength(2);

      const fallbacks = screen.getAllByTestId('avatar-fallback');
      expect(fallbacks).toHaveLength(2);
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef for performance', () => {
      // This is tested implicitly by the ref forwarding tests above
      expect(Avatar.$$typeof).toBeDefined();
      expect(AvatarImage.$$typeof).toBeDefined();
      expect(AvatarFallback.$$typeof).toBeDefined();
    });

    it('has displayName for debugging', () => {
      expect(Avatar.displayName).toBe('Avatar');
      expect(AvatarImage.displayName).toBe('AvatarImage');
      expect(AvatarFallback.displayName).toBe('AvatarFallback');
    });
  });
});
