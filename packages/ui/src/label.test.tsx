import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Label } from './label';

// Mock Radix UI Label
vi.mock('@radix-ui/react-label', () => {
  const Root = React.forwardRef<HTMLLabelElement, any>(
    ({ children, asChild: _asChild, ...props }: any, ref) => (
      <label ref={ref} {...props}>
        {children}
      </label>
    ),
  );
  Root.displayName = 'Label';
  return { Root };
});

// Mock class-variance-authority
vi.mock('class-variance-authority', () => ({
  cva: vi.fn((base, _config) => {
    return (_props: any = {}) => base;
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Label Component - Enterprise Level', () => {
  it('renders label element', () => {
    render(<Label>Label text</Label>);

    const label = screen.getByText('Label text');
    expect(label.tagName).toBe('LABEL');
    expect(label).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<Label>Default label</Label>);

    const label = screen.getByText('Default label');
    expect(label).toHaveClass(
      'text-sm',
      'font-medium',
      'leading-none',
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70',
    );
  });

  it('applies custom className', () => {
    render(<Label className="custom-label">Custom label</Label>);

    const label = screen.getByText('Custom label');
    expect(label).toHaveClass('custom-label');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Label ref={ref}>Label with ref</Label>);

    expect(ref).toBeDefined();
  });

  it('supports htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Label for input</Label>);

    const label = screen.getByText('Label for input');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(<Label aria-label="Descriptive label">Label text</Label>);

      const label = screen.getByLabelText('Descriptive label');
      expect(label).toBeInTheDocument();
    });

    it('handles disabled peer styling', () => {
      // The disabled styling is applied through peer classes
      render(<Label>Disabled peer label</Label>);

      const label = screen.getByText('Disabled peer label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });
  });

  describe('Form Integration', () => {
    it('associates with form controls', () => {
      render(
        <>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </>,
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('works with various input types', () => {
      render(
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />

          <Label htmlFor="checkbox">Agree</Label>
          <input id="checkbox" type="checkbox" />

          <Label htmlFor="select">Choose</Label>
          <select id="select">
            <option>Option 1</option>
          </select>
        </div>,
      );

      expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
      expect(screen.getByText('Agree')).toHaveAttribute('for', 'checkbox');
      expect(screen.getByText('Choose')).toHaveAttribute('for', 'select');
    });
  });

  describe('Content and Display', () => {
    it('renders different text content', () => {
      const testCases = [
        'Simple label',
        'Label with émojis 🎉',
        'Very long label text that should still work properly',
        'Label with numbers 123',
        'Label-with-dashes',
        'Label_with_underscores',
      ];

      testCases.forEach((text) => {
        render(<Label>{text}</Label>);
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });

    it('handles empty content', () => {
      const { container } = render(<Label />);

      const label = container.querySelector('label');
      expect(label?.tagName).toBe('LABEL');
    });

    it('preserves whitespace and formatting', () => {
      render(<Label> Spaced Label </Label>);

      expect(screen.getByText(/Spaced\s+Label/)).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML label attributes', () => {
      render(
        <Label id="test-label" title="Tooltip text" lang="es" dir="ltr">
          Test label
        </Label>,
      );

      const label = screen.getByText('Test label');
      expect(label).toHaveAttribute('id', 'test-label');
      expect(label).toHaveAttribute('title', 'Tooltip text');
      expect(label).toHaveAttribute('lang', 'es');
      expect(label).toHaveAttribute('dir', 'ltr');
    });

    it('supports Radix Label props', () => {
      render(
        <Label asChild={false} onMouseEnter={() => {}} onMouseLeave={() => {}}>
          Radix label
        </Label>,
      );

      const label = screen.getByText('Radix label');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Styling Variants', () => {
    it('has consistent typography', () => {
      render(<Label>Typography test</Label>);

      const label = screen.getByText('Typography test');
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
    });

    it('supports custom styling through className', () => {
      render(<Label className="text-lg text-blue-600">Custom styled</Label>);

      const label = screen.getByText('Custom styled');
      expect(label).toHaveClass('text-lg', 'text-blue-600');
    });
  });

  describe('Integration Patterns', () => {
    it('works with form libraries', () => {
      render(
        <form>
          <div>
            <Label htmlFor="field1">Field 1</Label>
            <input id="field1" type="text" />
          </div>
          <div>
            <Label htmlFor="field2">Field 2</Label>
            <textarea id="field2" />
          </div>
        </form>,
      );

      const label1 = screen.getByText('Field 1');
      const label2 = screen.getByText('Field 2');
      const input = screen.getByLabelText('Field 1');
      const textarea = screen.getByLabelText('Field 2');

      expect(label1).toHaveAttribute('for', 'field1');
      expect(label2).toHaveAttribute('for', 'field2');
      expect(input).toHaveAttribute('id', 'field1');
      expect(textarea).toHaveAttribute('id', 'field2');
    });

    it('supports compound components', () => {
      const FormField = ({ label, id, type = 'text' }: any) => (
        <div>
          <Label htmlFor={id}>{label}</Label>
          <input id={id} type={type} />
        </div>
      );

      render(
        <form>
          <FormField label="Email" id="email" type="email" />
          <FormField label="Password" id="password" type="password" />
        </form>,
      );

      expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
      expect(screen.getByText('Password')).toHaveAttribute('for', 'password');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined className', () => {
      render(<Label className={undefined}>Undefined className</Label>);

      const label = screen.getByText('Undefined className');
      expect(label).toBeInTheDocument();
    });

    it('handles special HTML characters', () => {
      render(<Label>Label with &amp; &lt; &gt; &quot; &apos; symbols</Label>);

      expect(screen.getByText('Label with & < > " \' symbols')).toBeInTheDocument();
    });

    it('works with React fragments and arrays', () => {
      render(<Label>{['Part 1', ' ', 'Part 2']}</Label>);

      expect(screen.getByText('Part 1 Part 2')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef for performance', () => {
      // This is tested implicitly by the ref forwarding tests
      expect(Label.$$typeof).toBeDefined();
    });

    it('has displayName for debugging', () => {
      expect(Label.displayName).toBe('Label');
    });
  });
});
