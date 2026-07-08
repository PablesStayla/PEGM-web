'use client';

import { Button, ThemeToggle } from '@pranakaia/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { BRANDING } from '@/config/branding';
import { useCartStore } from '@/store';
import { useWishlistStore } from '@/store/wishlist';

const MobileMenu = dynamic(() => import('./MobileMenu').then((mod) => mod.MobileMenu), {
  ssr: false, // Lazy load the mobile menu entirely out of SSR to reduce initial JS payload
});

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll(); // set initial state
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const navigation = [
    { name: tNav('products'), href: '/products' },
    { name: tNav('about'), href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: tNav('contact'), href: '/contact' },
  ];

  const { getItemCount: getCartCount, toggleCart } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();
  const cartCount = hasMounted ? getCartCount() : 0;
  const wishlistCount = hasMounted ? getWishlistCount() : 0;

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <motion.header
        data-testid="header"
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? 'header-glass' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 group shrink-0"
              aria-label={`${BRANDING.name} — Inicio`}
            >
              <div className="flex items-center">
                <Image
                  src={BRANDING.logo.main}
                  alt={BRANDING.name}
                  width={256}
                  height={56}
                  sizes="(min-width: 1024px) 256px, 224px"
                  className="h-12 lg:h-14 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300 dark:hidden"
                  priority
                />
                <Image
                  src={BRANDING.logo.dark}
                  alt={BRANDING.name}
                  width={256}
                  height={56}
                  sizes="(min-width: 1024px) 256px, 224px"
                  className="h-12 lg:h-14 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300 hidden dark:block"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav
              data-testid="desktop-menu"
              className="hidden lg:flex items-center space-x-1"
              aria-label="Navegación principal"
            >
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-4 py-2 text-sm font-semibold uppercase tracking-widest transition-all duration-300 nav-link-premium ${
                      isActive
                        ? 'text-[#7a5b2b]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-prana-gold'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-prana-gold"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="hidden sm:flex items-center overflow-hidden"
                  >
                    <div className="relative w-full">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full h-9 pl-9 pr-8 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-[#1a4d2e]/30 dark:focus:ring-[#4ade80]/30 text-gray-900 dark:text-white placeholder:text-gray-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                          }
                        }}
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex rounded-full h-9 w-9 p-0 text-gray-500 dark:text-gray-400 hover:text-[#1a4d2e] dark:hover:text-[#4ade80] hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label={tHeader('search')}
                      onClick={() => setIsSearchOpen(true)}
                    >
                      <Search className="h-4.5 w-4.5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative rounded-full h-9 w-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#1a4d2e] dark:hover:text-[#4ade80] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label={`${tHeader('wishlist')}${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`}
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/profile"
                className="hidden sm:flex rounded-full h-9 w-9 items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#1a4d2e] dark:hover:text-[#4ade80] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label={tHeader('account')}
              >
                <User className="h-4.5 w-4.5" />
              </Link>

              {/* Cart — opens slide-over */}
              <button
                type="button"
                data-testid="cart-icon"
                className="relative rounded-full h-9 w-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#1a4d2e] dark:hover:text-[#4ade80] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label={`${tHeader('cart')}${cartCount > 0 ? ` (${cartCount} productos)` : ''}`}
                onClick={toggleCart}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="cart-count"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      data-testid="cart-count"
                      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-prana-gold text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* Dark / Light toggle */}
              <ThemeToggle />

              {/* Language toggle */}
              <LanguageToggle />

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden rounded-full h-9 w-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={tHeader('openMenu')}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Bar — only render when visible to avoid hidden contrast violations */}
        {isScrolled && (
          <div className="bg-[#1a4d2e] hidden sm:block overflow-hidden transition-all duration-300 max-h-10 opacity-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-center py-1 text-xs text-white/90">
                <div className="flex items-center space-x-8 overflow-x-auto">
                  {BRANDING.copy.hero.trustSignals.map((signal, index) => (
                    <div key={index} className="flex items-center space-x-1.5 shrink-0">
                      <div className="w-1 h-1 bg-prana-gold rounded-full" />
                      <span className="font-medium">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onCloseAction={closeMobileMenu}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  );
}
