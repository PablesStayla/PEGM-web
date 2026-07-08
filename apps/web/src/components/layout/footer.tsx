'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { BRANDING } from '@/config/branding';

export function Footer() {
  const t = useTranslations('footer');
  const tNewsletter = useTranslations('newsletter');
  const currentYear = new Date().getFullYear() < 2026 ? 2026 : new Date().getFullYear();
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubmitted, setFooterSubmitted] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);

  const footerLinks = {
    products: [
      { name: t('links.allProducts'), href: '/products' },
      { name: t('links.lighting'), href: '/products?category=iluminacion' },
      { name: t('links.accessories'), href: '/products?category=accessories' },
      { name: t('links.compare'), href: '/comparison' },
      { name: t('links.recommended'), href: '/recommendations' },
    ],
    learn: [
      { name: t('links.search'), href: '/search' },
      { name: t('links.faq'), href: '/faq' },
      { name: t('links.features'), href: '/features' },
    ],
    company: [
      { name: t('links.about'), href: '/about' },
      { name: t('links.contact'), href: '/contact' },
    ],
    legal: [
      { name: t('links.privacy'), href: '/privacy' },
      { name: t('links.terms'), href: '/terms' },
    ],
  };

  return (
    <footer data-testid="footer" className="footer-mesh text-white">
      {/* Trust Bar */}
      <div className="bg-linear-to-r from-[#1a4d2e] to-[#2d6a4f] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white font-medium text-lg">{t('trustBar')}</p>
            <p className="text-green-100 text-sm mt-1">{t('trustBarSub')}</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image
                src={BRANDING.logo.dark}
                alt={BRANDING.name}
                width={208}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-gray-300 mb-4 max-w-sm">{t('brand')}</p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.products')}</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-prana-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.learn')}</h3>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-prana-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-prana-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.support')}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-prana-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">{t('newsletterTitle')}</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">{t('newsletterDesc')}</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!footerEmail || footerLoading) {
                  return;
                }
                setFooterLoading(true);
                try {
                  const result = await subscribeToNewsletter({
                    email: footerEmail,
                    acceptsMarketing: true,
                  });
                  if (result.success) {
                    setFooterSubmitted(true);
                    setFooterEmail('');
                    setTimeout(() => setFooterSubmitted(false), 4000);
                  }
                } catch {
                  /* ignore */
                } finally {
                  setFooterLoading(false);
                }
              }}
              className="max-w-md mx-auto flex gap-2"
            >
              <input
                type="email"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder={tNewsletter('placeholder')}
                required
                aria-label={t('newsletterTitle')}
                className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={footerLoading}
                className="btn-prana-primary px-6 py-2 whitespace-nowrap"
              >
                {footerSubmitted ? t('subscribed') : footerLoading ? '...' : t('subscribe')}
              </button>
            </form>

            <p className="text-xs text-gray-400 mt-3">{t('noSpam')}</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#060d09] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              {t('copyright', { year: currentYear })}
            </div>

            <div className="flex flex-wrap items-center justify-center space-x-4 md:space-x-6 text-sm text-gray-400">
              <span>{t('location')}</span>
              <span className="hidden md:inline">•</span>
              <span>{t('originalProducts')}</span>
            </div>

            <div className="text-gray-500 text-sm flex items-center space-x-2">
              <span>{t('builtBy')}</span>
              <a
                href="https://github.com/PablesStayla"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                PEGM
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
