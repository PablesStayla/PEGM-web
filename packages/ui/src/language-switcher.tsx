'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { type Locale, localeFlags, localeNames, locales } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  currentPath?: string;
}

export function LanguageSwitcher({ className = '', currentPath }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      const basePath =
        currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/') ?? '/';
      const normalizedPath = basePath.startsWith(`/${locale}`)
        ? basePath.replace(`/${locale}`, '') || '/'
        : basePath;
      const newPath = `/${newLocale}${normalizedPath}`;
      router.replace(newPath);
    });
  };

  return (
    <div className={cn('relative', className)}>
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        disabled={isPending}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
      >
        {locales.map((localeCode) => (
          <option key={localeCode} value={localeCode}>
            {localeFlags[localeCode]} {localeNames[localeCode]}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isPending && (
        <div className="absolute inset-y-0 right-8 flex items-center pr-2">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
