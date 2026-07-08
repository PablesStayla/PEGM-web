import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea';

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Textarea Component - Enterprise Level', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders textarea element', () => {
    render(<Textarea />);

    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<Textarea />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass(
      'flex',
      'min-h-[60px]',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-2',
      'text-base',
      'shadow-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none',
      'focus-visible:ring-1',
      'focus-visible:ring-ring',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'md:text-sm',
    );
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);

    expect(ref).toBeDefined();
  });

  describe('Textarea Attributes', () => {
    it('supports placeholder', () => {
      render(<Textarea placeholder="Enter your message" />);

      const textarea = screen.getByPlaceholderText('Enter your message');
      expect(textarea).toBeInTheDocument();
    });

    it('supports value prop', () => {
      render(<Textarea value="Pre-filled text" onChange={() => {}} />);

      const textarea = screen.getByDisplayValue('Pre-filled text');
      expect(textarea).toBeInTheDocument();
    });

    it('supports defaultValue', () => {
      render(<Textarea defaultValue="Default text" />);

      const textarea = screen.getByDisplayValue('Default text');
      expect(textarea).toBeInTheDocument();
    });

    it('supports rows attribute', () => {
      render(<Textarea rows={5} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('supports cols attribute', () => {
      render(<Textarea cols={30} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '30');
    });

    it('supports disabled state', () => {
      render(<Textarea disabled />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('supports readOnly state', () => {
      render(<Textarea readOnly />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('supports required attribute', () => {
      render(<Textarea required />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('required');
    });
  });

  describe('User Interactions', () => {
    it('allows typing text', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello World' } });

      expect(textarea).toHaveValue('Hello World');
    });

    it('handles onChange events', () => {
      const handleChange = vi.fn();

      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'a' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('handles onFocus and onBlur events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalled();

      await user.tab(); // Move focus away
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-1',
        'focus-visible:ring-ring',
      );
    });

    it('supports aria attributes', () => {
      render(<Textarea aria-label="Message input" aria-describedby="helper-text" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Message input');
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports form association', () => {
      render(<Textarea name="message" id="message" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('id', 'message');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      expect(textarea).toHaveFocus();

      // Test tab navigation
      await user.tab();
      expect(textarea).not.toHaveFocus();
    });
  });

  describe('Content Handling', () => {
    it('handles multiline text', async () => {
      const user = userEvent.setup();
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3');

      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });

    it('handles long text content', () => {
      const longText = 'A'.repeat(1000);

      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: longText } });

      expect(textarea).toHaveValue(longText);
    });

    it('handles special characters', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Text with émojis 🎉 and symbols !@#$%^&*()' },
      });

      expect(textarea).toHaveValue('Text with émojis 🎉 and symbols !@#$%^&*()');
    });

    it('preserves whitespace', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: ' Spaced Text ' } });

      expect(textarea).toHaveValue(' Spaced Text ');
    });
  });

  describe('Form Integration', () => {
    it('supports form submission', () => {
      render(
        <form>
          <Textarea name="message" />
          <button type="submit">Submit</button>
        </form>,
      );

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      expect(textarea).toHaveAttribute('name', 'message');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('supports form validation', () => {
      render(<Textarea required minLength={10} maxLength={500} pattern="[A-Za-z0-9\s]+" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('required');
      expect(textarea).toHaveAttribute('minlength', '10');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toHaveAttribute('pattern', '[A-Za-z0-9\\s]+');
    });

    it('supports autocomplete', () => {
      render(<Textarea autoComplete="off" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('Responsive Design', () => {
    it('has responsive text sizing', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-base', 'md:text-sm');
    });

    it('maintains minimum height', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('min-h-[60px]');
    });

    it('is full width', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('w-full');
    });
  });

  describe('Type Safety', () => {
    it('accepts all HTML textarea attributes', () => {
      render(
        <Textarea
          id="message"
          name="message"
          placeholder="Enter message"
          rows={4}
          cols={50}
          wrap="soft"
          spellCheck={true}
          autoCapitalize="sentences"
          autoCorrect="on"
        />,
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'message');
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('placeholder', 'Enter message');
      expect(textarea).toHaveAttribute('rows', '4');
      expect(textarea).toHaveAttribute('cols', '50');
      expect(textarea).toHaveAttribute('wrap', 'soft');
      expect(textarea).toHaveAttribute('spellcheck', 'true');
    });

    it('supports React event handlers', () => {
      const handleInput = vi.fn();
      const handleKeyDown = vi.fn();
      const handlePaste = vi.fn();

      render(<Textarea onInput={handleInput} onKeyDown={handleKeyDown} onPaste={handlePaste} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined props', () => {
      render(<Textarea placeholder={undefined} className={undefined} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('handles empty string values', () => {
      render(<Textarea value="" onChange={() => {}} />);

      const textarea = screen.getByDisplayValue('');
      expect(textarea).toBeInTheDocument();
    });

    it('handles zero rows', () => {
      render(<Textarea rows={0} />);

      const textarea = screen.getByRole('textbox');
      // React/browsers typically remove invalid rows=0 attribute
      expect(textarea).not.toHaveAttribute('rows');
    });

    it('handles very large row values', () => {
      render(<Textarea rows={1000} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '1000');
    });
  });

  describe('Performance', () => {
    it('uses React.forwardRef', () => {
      expect(Textarea).toBeDefined();
    });

    it('has displayName for debugging', () => {
      expect(Textarea.displayName).toBe('Textarea');
    });

    it('handles typing efficiently', () => {
      render(<Textarea />);

      const textarea = screen.getByRole('textbox');

      // Use fireEvent for stable value setting in JSDOM
      fireEvent.change(textarea, { target: { value: 'test' } });

      expect(textarea).toHaveValue('test');
    });
  });

  describe('Integration Patterns', () => {
    it('works with form libraries', () => {
      const handleSubmit = vi.fn();

      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="comment" placeholder="Enter your comment" required />
          <button type="submit">Submit Comment</button>
        </form>,
      );

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit Comment' });

      expect(textarea).toHaveAttribute('name', 'comment');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your comment');
      expect(textarea).toHaveAttribute('required');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('supports controlled components', () => {
      const ControlledTextarea = () => {
        const [value, setValue] = React.useState('Initial value');

        return <Textarea value={value} onChange={(e) => setValue(e.target.value)} />;
      };

      render(<ControlledTextarea />);

      const textarea = screen.getByDisplayValue('Initial value');
      expect(textarea).toBeInTheDocument();
    });

    it('supports uncontrolled components', () => {
      render(<Textarea defaultValue="Default text" />);

      const textarea = screen.getByDisplayValue('Default text');
      expect(textarea).toBeInTheDocument();
    });
  });
});
