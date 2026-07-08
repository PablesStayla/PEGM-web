'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Package, Zap } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
  /**
   * Umbral para mostrar "urgencia alta" (rojo pulsante)
   * Default: 5
   */
  urgentThreshold?: number;
  /**
   * Umbral para mostrar "stock limitado" (amarillo)
   * Default: 15
   */
  warningThreshold?: number;
  className?: string;
}

/**
 * Componente de urgencia de stock tipo Booking/Amazon.
 * Genera FOMO y aumenta la tasa de conversión mostrando
 * señales visuales de escasez cuando el stock es bajo.
 *
 * - Stock <= urgentThreshold (5): Rojo pulsante "¡Solo quedan N!"
 * - Stock <= warningThreshold (15): Amarillo "Stock limitado"
 * - Stock > warningThreshold: null (no mostrar nada)
 * - Stock == 0: "Agotado"
 */
export function StockBadge({
  stock,
  urgentThreshold = 5,
  warningThreshold = 15,
  className = '',
}: Readonly<StockBadgeProps>) {
  if (stock > warningThreshold) {
    return null;
  }

  if (stock === 0) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest bg-white/5 text-white/30 border border-white/10 ${className}`}
      >
        <Package className="w-3 h-3" />
        Suministros Agotados
      </div>
    );
  }

  if (stock <= urgentThreshold) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border border-prana-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] ${className}`}
        >
          {/* Pulsing background para urgencia máxima (Dorado Real) */}
          <motion.span
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-prana-gold"
          />
          <span className="relative inline-flex items-center gap-1.5 text-prana-gold">
            <Zap className="w-3 h-3 fill-current animate-pulse" />
            {stock === 1 ? 'Única unidad de Gremio' : `Quedan ${stock} unidades de élite`}
          </span>
        </motion.div>
      </AnimatePresence>
    );
  }

  // warningThreshold >= stock > urgentThreshold
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest bg-prana-amber/10 text-prana-amber border border-prana-amber/30 ${className}`}
    >
      <AlertTriangle className="w-3 h-3" />
      Reserva Limitada ({stock} u.)
    </motion.div>
  );
}
