'use client';

import { motion } from 'framer-motion';
import { Activity, Clock, ShieldCheck, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-2 w-2 rounded-full bg-prana-emerald animate-pulse shadow-[0_0_10px_#10B981]" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
              SISTEMA OPERATIVO : ACTIVO
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
            Centro de <span className="text-prana-gold">Mando</span>
          </h1>
          <p className="text-white/40 font-bold tracking-tight mt-2 max-w-md">
            Consola administrativa de alta fidelidad. Monitoreo global de PranaKaia en tiempo real.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-wrap items-center gap-4"
        >
          {/* System Stats Pill */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-8 shadow-2xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                <Clock className="w-3 h-3 text-prana-gold" />
                Tiempo Local
              </div>
              <div className="text-xl font-black text-white tabular-nums tracking-tighter">
                {time.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>

            <div className="h-8 w-px bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-prana-emerald opacity-60" />
                <span className="text-[8px] font-black text-white/20">SECURED</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Wifi className="w-5 h-5 text-prana-gold opacity-60" />
                <span className="text-[8px] font-black text-white/20">UPLINK</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Activity className="w-5 h-5 text-blue-400 opacity-60" />
                <span className="text-[8px] font-black text-white/20">LIVE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Atmospheric Divider */}
      <div className="mt-8 h-px w-full bg-gradient-to-r from-prana-gold/40 via-prana-gold/5 to-transparent" />
    </div>
  );
}
