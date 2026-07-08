'use client';

import { Badge, Card, Skeleton } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { AlertTriangle, Archive, ArrowUpRight, Box, Package, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';
import { InventoryTable } from './InventoryTable';

interface InventoryListProps {
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    stockQuantity: number | null;
  }>;
  products: any[];
}

export function InventoryList({ stats, lowStockProducts, products }: InventoryListProps) {
  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <Box className="h-6 w-6 text-prana-gold" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Control de <span className="text-prana-gold">Inventario</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] ml-12">
            Gestión de Activos & Protocolos de Stock
          </p>
        </div>
        <div className="flex items-center gap-2 px-6 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">
            Sincronizado: OK
          </span>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total de Productos',
            value: stats.totalProducts,
            subtitle: `${stats.activeProducts} activos`,
            icon: Package,
            accent: 'text-white',
          },
          {
            title: 'Valor del Inventario',
            value: new Intl.NumberFormat('es-US', {
              style: 'currency',
              currency: 'USD',
            }).format(stats.totalValue),
            subtitle: 'Estimación de Activos',
            icon: TrendingUp,
            accent: 'text-prana-gold',
          },
          {
            title: 'Alertas de Stock',
            value: stats.lowStockCount,
            subtitle: `${stats.outOfStockCount} agotados`,
            icon: AlertTriangle,
            accent: 'text-red-400',
          },
          {
            title: 'Salud Operativa',
            value: `${stats?.totalProducts ? Math.round(((stats.totalProducts - (stats.lowStockCount || 0)) / stats.totalProducts) * 100) : 0}%`,
            subtitle: 'Eficiencia de Stock',
            icon: Archive,
            accent: 'text-prana-emerald',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="luxury-card-admin p-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-500`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.accent} transition-colors`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/10 group-hover:text-white/40 transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tighter font-mono">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white/50 transition-colors">
                  {stat.title}
                </p>
                <p className="mt-1 text-[10px] font-bold text-white/10 uppercase tracking-widest">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Low Stock Alert ────────────────────────────────────────────────── */}
      {lowStockProducts.length > 0 && (
        <Card className="relative overflow-hidden bg-red-500/[0.03] border-red-500/20 rounded-[2.5rem] p-10">
          <div className="absolute inset-0 bg-noise opacity-[0.01] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
                  Alerta de Suministro Crítico
                </h2>
                <p className="text-[10px] font-black text-red-400/60 uppercase tracking-widest mt-1 font-mono">
                  {lowStockProducts.length} Activos requieren atención inmediata
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center justify-between rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/30 p-5 transition-all duration-500"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate tracking-tight">
                      {product.name}
                    </p>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono mt-1">
                      SKU: {product.slug}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      (product.stockQuantity ?? 0) === 0
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase tracking-widest'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] font-black uppercase tracking-widest'
                    }
                  >
                    {(product.stockQuantity ?? 0) === 0
                      ? 'Agotado'
                      : `${product.stockQuantity ?? 0} UDS`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Inventory Table Container ────────────────────────────────────────── */}
      <div className="luxury-card-admin overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
        <div className="px-10 py-8 border-b border-white/5 relative z-10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-prana-gold/10 rounded-lg border border-prana-gold/20">
              <Archive className="h-4 w-4 text-prana-gold" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-1">
                Registro Maestro
              </h2>
              <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                Catálogo de Activos
              </h3>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {products.length} Items Registrados
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="p-20 flex justify-center">
                <Skeleton className="h-60 w-full max-w-4xl bg-white/5 rounded-3xl" />
              </div>
            }
          >
            <InventoryTable products={products} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
