'use client';

import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { type routing, usePathname, useRouter } from '@/i18n/routing';

type AppLocale = (typeof routing.locales)[number];

const LOCALES: { locale: AppLocale; flag: string; label: string; name: string }[] = [
  { locale: 'es', flag: '🇨🇱', label: 'ES', name: 'Español' },
  { locale: 'en', flag: '🇺🇸', label: 'EN', name: 'English' },
  { locale: 'pt', flag: '🇧🇷', label: 'PT', name: 'Português' },
];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-9" aria-hidden />;
  }

  const current = LOCALES.find((l) => l.locale === locale) ?? LOCALES[0]!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Seleccionar idioma"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block uppercase">{current.label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Idiomas disponibles"
          className="absolute right-0 mt-1 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50"
        >
          {LOCALES.map(({ locale: loc, flag, label, name }) => (
            <li key={loc}>
              <button
                type="button"
                role="option"
                aria-selected={locale === loc}
                onClick={() => {
                  router.replace(pathname, { locale: loc });
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  locale === loc
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{flag}</span>
                <span>{name}</span>
                <span className="ml-auto text-xs text-gray-400 uppercase">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
