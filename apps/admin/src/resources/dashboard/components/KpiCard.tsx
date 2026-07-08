'use client';

import { cn } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import {
  DollarSign,
  type LucideIcon,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
};

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  loading = false,
}: KpiCardProps) {
  const Icon = iconMap[icon] ?? DollarSign;
  const calculatedTrend =
    trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral');
  const formattedChange = change !== undefined ? change.toFixed(1) : null;

  const isPositive = calculatedTrend === 'up';
  const isNegative = calculatedTrend === 'down';

  if (loading) {
    return (
      <div className="bg-black/40 border border-white/5 rounded-[2rem] p-7 h-[160px] animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-white/5 rounded-2xl" />
          <div className="w-20 h-5 bg-white/5 rounded-full" />
        </div>
        <div className="w-32 h-9 bg-white/5 rounded-lg mb-3" />
        <div className="w-24 h-3 bg-white/5 rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden bg-black/60 border border-white/5 hover:border-prana-gold/20 rounded-[2rem] p-8 transition-all duration-500 shadow-2xl"
    >
      {/* Immersive Accents */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-prana-gold/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-prana-gold/10 transition-all duration-700" />
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-prana-gold/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
            <Icon className="w-7 h-7 text-prana-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          </div>

          {formattedChange !== null && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.1em] uppercase transition-all duration-500',
                isPositive
                  ? 'bg-prana-emerald/10 text-prana-emerald border border-prana-emerald/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : isNegative
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-white/5 text-white/40 border border-white/10',
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : isNegative ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : null}
              {isPositive ? '+' : ''}
              {formattedChange}%
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 group-hover:text-prana-gold/40 transition-colors duration-500">
            {title}
          </h3>
          <div className="space-y-1">
            <div className="text-4xl font-black text-white tracking-tighter drop-shadow-2xl">
              {value}
            </div>
            {formattedChange !== null && (
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2 px-1">
                {changeLabel || 'vs periodo anterior'}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
