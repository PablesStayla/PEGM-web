'use client';

import { Badge, Button, Skeleton } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Layers,
  Package,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { TablePagination } from '@/components/shared/TablePagination';
import type { ProductWithDetails } from '@/resources/products/schemas';
import { ProductsFilters } from './ProductsFilters';
import { ProductsTable } from './ProductsTable';

interface ProductListProps {
  products: ProductWithDetails[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function ProductList({ products, pagination }: ProductListProps) {
  // Calculate stats
  const activeProducts = products.filter((p) => p.status === 'PUBLISHED').length;
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const lowStockCount = products.filter((p) => (p.stockQuantity || 0) < 10).length;

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <Layers className="h-6 w-6 text-prana-gold" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Catálogo <span className="text-prana-gold">Maestro</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] ml-12">
            Gestión de Activos Digitales & Variantes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4 stroke-[3]" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Productos',
            value: pagination.total,
            subtitle: 'En el catálogo',
            icon: Package,
            color: 'text-white',
          },
          {
            title: 'Activos',
            value: activeProducts,
            subtitle: 'Publicados',
            icon: CheckCircle,
            color: 'text-emerald-400',
          },
          {
            title: 'Stock Total',
            value: totalStock,
            subtitle: 'Unidades',
            icon: ShoppingCart,
            color: 'text-prana-gold',
          },
          {
            title: 'Stock Bajo',
            value: lowStockCount,
            subtitle: 'Crítico (<10)',
            icon: AlertCircle,
            color: 'text-orange-400',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="luxury-card-admin p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <ArrowUpRight className="h-3 w-3 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-white font-mono tracking-tighter">
                {stat.value}
              </p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                {stat.title}
              </p>
              <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest mt-1">
                {stat.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters & Search ─────────────────────────────────────────────── */}
      <div className="luxury-card-admin p-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
        <Suspense fallback={<Skeleton className="h-16 w-full bg-white/5 rounded-2xl" />}>
          <ProductsFilters />
        </Suspense>
      </div>

      {/* ── Main Table ───────────────────────────────────────────────────── */}
      <div className="luxury-card-admin overflow-hidden relative">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-prana-gold animate-pulse" />
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
              Registro de Inventario <span className="text-gray-600 font-medium">/ SYNC</span>
            </h2>
          </div>
          <Badge
            variant="outline"
            className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest px-4 py-1"
          >
            Pagina {pagination.page} de {pagination.totalPages}
          </Badge>
        </div>
        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="p-20 flex flex-col items-center gap-4">
                <RefreshCw className="h-8 w-8 text-white/10 animate-spin" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  Cifrando Datos...
                </p>
              </div>
            }
          >
            <ProductsTable products={products} />
          </Suspense>
        </div>
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <TablePagination pagination={pagination} />
        </div>
      </div>
    </div>
  );
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
