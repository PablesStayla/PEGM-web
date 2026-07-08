'use client';

import { createClient } from '@pranakaia/auth/client';
import { cn, ThemeToggle } from '@pranakaia/ui';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  BoxIcon,
  Brain,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Package,
  Percent,
  Radio,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Warehouse,
  Webhook,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { env } from '@/lib/env';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Órdenes', href: '/orders', icon: ShoppingCart },
      { name: 'Productos', href: '/products', icon: Package },
      { name: 'Inventario', href: '/inventory', icon: Truck },
      { name: 'Clientes', href: '/customers', icon: Users },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { name: 'Proveedores', href: '/suppliers', icon: Warehouse },
      { name: 'Dropship', href: '/dropship-orders', icon: BoxIcon },
      { name: 'Descuentos', href: '/discounts', icon: Percent },
      { name: 'CMS', href: '/cms', icon: FileText },
      { name: 'Notificaciones', href: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Reportes',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Reportes', href: '/reports', icon: FileText },
      { name: 'Actividad', href: '/activity', icon: Activity },
      { name: 'Webhooks Log', href: '/activity/webhooks', icon: Webhook },
    ],
  },
  {
    label: 'Inteligencia',
    items: [
      { name: 'Rentabilidad', href: '/profitability', icon: Wallet },
      { name: 'Live Commerce', href: '/live-commerce', icon: Radio },
      { name: 'Automatización', href: '/automation', icon: Bot },
      { name: 'Supply Chain AI', href: '/supply-chain', icon: Brain },
    ],
  },
];

const bottomNavigation = [
  { name: 'Monitoreo', href: '/monitoring', icon: Monitor },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

function SidebarContent({
  pathname,
  collapsed = false,
  onNavigate = () => {},
  onToggleCollapse,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-prana-dark-green relative overflow-hidden">
      {/* Deep Ambiance */}
      <div className="absolute inset-0 bg-mesh-forest opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center h-20 px-4 border-b border-white/5 relative z-10 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          {collapsed ? (
            <div className="relative h-9 w-9 shrink-0">
              <Image
                src="/logos/pranakaia-icon-new.png"
                alt="PranaKaia"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <div className="relative h-8 w-36">
                <Image
                  src="/logos/pranakaia-logo-new.png"
                  alt="PranaKaia"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
              <span className="text-[9px] font-semibold text-primary tracking-[0.25em] uppercase pl-0.5">
                Admin Panel
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle (desktop only) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto p-2 rounded-xl text-white/40 hover:text-prana-gold hover:bg-white/5 transition-all duration-300 hidden lg:flex border border-transparent hover:border-prana-gold/20"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-3 mt-4">
                <span className="text-[9px] font-black text-prana-gold/40 tracking-[0.3em] uppercase">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-500',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-prana-gold/10 text-white shadow-[0_0_20px_rgba(212,175,55,0.1)] border border-prana-gold/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-prana-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-all duration-500',
                        isActive
                          ? 'text-prana-gold drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]'
                          : 'text-white/40 group-hover:text-white',
                      )}
                    />
                    {!collapsed && (
                      <span
                        className={cn(
                          'font-bold tracking-tight',
                          isActive
                            ? 'text-white'
                            : 'text-white/60 group-hover:text-white transition-colors',
                        )}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 border-t border-white/5 space-y-1 relative z-10">
        {!collapsed && (
          <div className="px-3 mb-3">
            <span className="text-[9px] font-black text-prana-gold/40 tracking-[0.3em] uppercase">
              SISTEMA MAESTRO
            </span>
          </div>
        )}
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.name : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-500',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-prana-gold/10 text-white border border-prana-gold/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-all duration-500',
                  isActive ? 'text-prana-gold' : 'text-white/40 group-hover:text-white',
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Store link */}
        <a
          href={env.NEXT_PUBLIC_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          title={collapsed ? 'Ir a la Tienda' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/40 hover:text-prana-gold hover:bg-prana-gold/5 transition-all duration-500 border border-transparent hover:border-prana-gold/20',
            collapsed && 'justify-center px-2',
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span>Vista de Cliente</span>}
        </a>

        {/* Theme Toggle & Logout */}
        <div
          className={cn(
            'flex items-center gap-2 mt-4 pt-4 border-t border-white/5',
            collapsed ? 'flex-col' : 'justify-between',
          )}
        >
          <ThemeToggle />
          <LogoutButton collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}

/** Logout button — calls Supabase signOut and redirects to /login */
function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      title={collapsed ? 'Cerrar sesión' : undefined}
      aria-label="Cerrar sesión"
      className={cn(
        'group flex items-center gap-3 rounded-xl p-2.5 text-sm font-medium text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200',
        collapsed ? 'justify-center w-9 h-9' : 'flex-1',
        isPending && 'opacity-50 cursor-not-allowed',
      )}
    >
      <LogOut className="h-4.5 w-4.5 shrink-0 group-hover:rotate-12 transition-transform" />
      {!collapsed && <span>{isPending ? 'Cerrando…' : 'Cerrar sesión'}</span>}
    </button>
  );
}

/** Mobile hamburger button — exported for layout header */
function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden inline-flex items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:bg-accent/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      aria-label="Abrir menú"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-xl px-4 transition-colors duration-300">
        <MobileMenuButton onClick={() => setMobileOpen(true)} />
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-28">
            <Image
              src="/logos/pranakaia-logo-new.png"
              alt="PranaKaia"
              fill
              sizes="112px"
              className="object-contain object-left"
            />
          </div>
          <span className="text-[9px] font-semibold text-primary tracking-[0.2em] uppercase">
            Admin
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setMobileOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-background border-r border-border shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent pathname={pathname ?? '/'} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-background lg:relative transition-all duration-300 ease-out',
          collapsed ? 'lg:w-17' : 'lg:w-60',
        )}
      >
        <SidebarContent
          pathname={pathname ?? '/'}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>
    </>
  );
}
