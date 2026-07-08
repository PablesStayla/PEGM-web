'use client';

import { cn } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { Award, Box, Zap } from 'lucide-react';

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
  category: string;
}

interface TopProductsTableProps {
  products: TopProduct[];
  loading?: boolean;
}

export function TopProductsTable({ products, loading = false }: TopProductsTableProps) {
  if (loading || products.length === 0) {
    return (
      <div className="bg-black/60 border border-white/5 rounded-[2.5rem] p-10 animate-pulse">
        <div className="w-48 h-6 bg-white/5 rounded-full mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden bg-black/60 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-[10px] font-black text-prana-gold tracking-[0.4em] uppercase mb-2">
            Inventario de Éxito
          </h2>
          <h3 className="text-3xl font-black text-white tracking-tighter">
            Activos de Alto Rendimiento
          </h3>
        </div>
        <div className="bg-prana-gold/10 border border-prana-gold/20 px-4 py-2 rounded-full flex items-center gap-2">
          <Zap className="w-4 h-4 text-prana-gold" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            En Vivo
          </span>
        </div>
      </div>

      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
              <th className="px-6 pb-2">Posicion & Producto</th>
              <th className="px-6 pb-2">Categoria</th>
              <th className="px-6 pb-2 text-right">Volumen</th>
              <th className="px-6 pb-2 text-right">Rendimiento (USD)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
              >
                <td className="px-6 py-5 rounded-l-2xl border-l border-t border-b border-white/5 group-hover:border-prana-gold/20">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border text-xs font-black transition-all duration-500',
                        index < 3
                          ? 'border-prana-gold/40 text-prana-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                          : 'border-white/10 text-white/40',
                      )}
                    >
                      {index < 3 ? <Award className="w-5 h-5" /> : index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white tracking-tight group-hover:text-prana-gold transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        ID: {product.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 border-t border-b border-white/5 group-hover:border-prana-gold/20">
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full w-fit">
                    <Box className="w-3 h-3" />
                    {product.category}
                  </div>
                </td>
                <td className="px-6 py-5 border-t border-b border-white/5 group-hover:border-prana-gold/20 text-right">
                  <span className="text-sm font-black text-white/60 tabular-nums">
                    {product.unitsSold.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-5 rounded-r-2xl border-r border-t border-b border-white/5 group-hover:border-prana-gold/20 text-right">
                  <span className="text-lg font-black text-white tabular-nums">
                    ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
