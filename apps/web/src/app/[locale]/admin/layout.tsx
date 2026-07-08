'use client';

import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BRANDING } from '@/config/branding';

const ADMIN_NAV = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Órdenes', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Productos', href: '/admin/products', icon: Package },
  { name: 'Clientes', href: '/admin/customers', icon: Users },
  { name: 'Análisis', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidbarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`${
          isSidbarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 z-50 transition-all duration-300 glass-morphism border-r border-white/20 dark:border-white/10 flex flex-col`}
      >
        {/* Header/Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <Image src={BRANDING.logo.favicon} alt="Logo" fill className="object-contain" />
            </div>
            {isSidbarOpen && (
              <span className="font-bold text-gray-900 dark:text-white truncate">Admin Panel</span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidbarOpen)}
            className="hidden lg:flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {isSidbarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1a4d2e] text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidbarOpen && <span className="text-sm font-medium">{item.name}</span>}
                {isActive && isSidbarOpen && (
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
            <LogOut className="h-5 w-5" />
            {isSidbarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidbarOpen ? 'pl-64' : 'pl-20'}`}>
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
