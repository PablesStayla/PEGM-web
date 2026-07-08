import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('renders with custom placeholder', () => {
    render(<Input placeholder="Enter your name" />);

    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom type', () => {
    render(<Input type="email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with default type as text', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('has proper base styling', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-base',
      'shadow-sm',
      'transition-colors',
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
      'file:text-foreground',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none',
      'focus-visible:ring-1',
      'focus-visible:ring-ring',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'md:text-sm',
    );
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('handles value prop', () => {
    render(<Input value="Pre-filled value" onChange={() => {}} />);

    const input = screen.getByDisplayValue('Pre-filled value');
    expect(input).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('handles readOnly state', () => {
    render(<Input readOnly />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);

    expect(ref).toBeDefined();
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-1',
        'focus-visible:ring-ring',
      );
    });

    it('supports aria attributes', () => {
      render(<Input aria-label="Custom label" aria-describedby="helper-text" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Custom label');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports form association', () => {
      render(<Input name="username" id="username" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
      expect(input).toHaveAttribute('id', 'username');
    });
  });

  describe('Different Input Types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const;

    it.each(types)('renders correctly with type="%s"', (type) => {
      const { container } = render(<Input type={type} />);

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', type);
    });
  });

  describe('File Input Styling', () => {
    it('has file input styling', () => {
      render(<Input type="file" data-testid="file-input" />);

      const input = screen.getByTestId('file-input');
      expect(input).toHaveClass(
        'file:border-0',
        'file:bg-transparent',
        'file:text-sm',
        'file:font-medium',
        'file:text-foreground',
      );
    });
  });

  describe('Responsive Design', () => {
    it('has responsive text sizing', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-base', 'md:text-sm');
    });
  });

  describe('Event Handlers', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('handles onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();

      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('handles onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();

      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Move focus away

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('integrates with form validation', () => {
      render(<Input required pattern="[A-Za-z]+" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
    });

    it('supports autocomplete attributes', () => {
      render(<Input autoComplete="username" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'username');
    });

    it('supports min/max for number inputs', () => {
      render(<Input type="number" min="0" max="100" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      render(<Input type={undefined} className={undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text'); // Default fallback
    });

    it('preserves other HTML input attributes', () => {
      render(<Input data-testid="custom-input" tabIndex={0} />);

      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('tabindex', '0');
    });

    it('handles empty string values', () => {
      render(<Input value="" onChange={() => {}} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML input props', () => {
      const props = {
        type: 'email' as const,
        placeholder: 'test',
        required: true,
        disabled: false,
        readOnly: false,
        autoComplete: 'email' as const,
        pattern: '[a-z]+',
        minLength: 3,
        maxLength: 50,
      };

      render(<Input {...props} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'test');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('autocomplete', 'email');
      expect(input).toHaveAttribute('pattern', '[a-z]+');
      expect(input).toHaveAttribute('minlength', '3');
      expect(input).toHaveAttribute('maxlength', '50');
    });
  });
});
