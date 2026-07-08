import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './language-switcher';

const mockUseLocale = vi.fn(() => 'es');
vi.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
}));

const mockRouterReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

const mockStartTransition = vi.fn((cb) => cb());
vi.mock('react', async () => {
  const actual = await vi.importActual<any>('react');
  return {
    ...actual,
    useTransition: () => [false, mockStartTransition],
  };
});

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has at least one locale option', () => {
    render(<LanguageSwitcher />);
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });
});
