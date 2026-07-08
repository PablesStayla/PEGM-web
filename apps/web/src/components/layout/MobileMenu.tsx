'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Home, Info, Mail, ShoppingBag, ShoppingCart, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onCloseAction: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

// NAV_LINKS moved inside component to use translations

const drawerVariants = {
  closed: { x: '100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const itemVariants = {
  closed: { x: 20, opacity: 0 },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 300 },
  }),
};

export function MobileMenu({
  isOpen,
  onCloseAction,
  cartCount = 0,
  wishlistCount = 0,
}: Readonly<MobileMenuProps>) {
  const pathname = usePathname();
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');
  const tFooter = useTranslations('footer');
  const tCommon = useTranslations('common');

  const navLinks = useMemo(
    () => [
      { href: '/', label: tNav('home'), icon: Home },
      { href: '/products', label: tNav('products'), icon: ShoppingBag },
      { href: '/about', label: tNav('about'), icon: Info },
      { href: '/contact', label: tNav('contact'), icon: Mail },
    ],
    [tNav],
  );

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar al cambiar de ruta
  // biome-ignore lint/correctness/useExhaustiveDependencies: Close menu when route changes
  useEffect(() => {
    onCloseAction();
  }, [pathname, onCloseAction]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay oscuro */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onCloseAction}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 z-50 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={tHeader('openMenu')}
          >
            {/* Header del drawer */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {tCommon('menu')}
              </span>
              <button
                type="button"
                onClick={onCloseAction}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={tCommon('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links de navegación */}
            <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Navegación mobile">
              <ul className="space-y-1">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <motion.li
                      key={link.href}
                      custom={i}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {link.label}
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="ml-auto h-2 w-2 rounded-full bg-green-500"
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Divisor */}
              <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

              {/* Links secundarios */}
              <ul className="space-y-1">
                <motion.li
                  custom={navLinks.length}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/wishlist"
                    className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="h-5 w-5" />
                      {tHeader('wishlist')}
                    </span>
                    {wishlistCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </motion.li>
                <motion.li
                  custom={navLinks.length + 1}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/cart"
                    className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5" />
                      {tHeader('cart')}
                    </span>
                    {cartCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </motion.li>
                <motion.li
                  custom={navLinks.length + 2}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    {tHeader('account')}
                  </Link>
                </motion.li>
              </ul>
            </nav>

            {/* Footer del drawer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-center text-gray-400">
                {tFooter('copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
