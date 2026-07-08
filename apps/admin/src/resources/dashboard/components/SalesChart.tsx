'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesData[];
  loading?: boolean;
}

interface ChartTooltipEntry {
  color?: string;
  name?: string;
  value?: number | string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-prana-gold/20 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index: number) => {
            const valueText =
              typeof entry.value === 'number' ? entry.value.toLocaleString() : (entry.value ?? '-');

            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ color: entry.color, backgroundColor: entry.color }}
                />
                <span className="text-xs font-bold text-white/80">{entry.name}:</span>
                <span className="text-sm font-black text-white tabular-nums">
                  {entry.name === 'Ingresos' ? `$${valueText}` : valueText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function SalesChart({ data, loading = false }: SalesChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: Number(item.revenue.toFixed(2)),
    }));
  }, [data]);

  if (loading || data.length === 0) {
    return (
      <div className="bg-black/60 border border-white/5 rounded-[2rem] p-8 h-[450px] animate-pulse flex flex-col">
        <div className="w-48 h-6 bg-white/5 rounded-full mb-2" />
        <div className="w-64 h-4 bg-white/5 rounded-full mb-8" />
        <div className="flex-1 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden bg-black/60 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-prana-gold/20 to-transparent" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 mb-10">
        <h2 className="text-[10px] font-black text-prana-gold tracking-[0.4em] uppercase mb-2">
          Inteligencia de Mercado
        </h2>
        <h3 className="text-2xl font-black text-white tracking-tighter">
          Rendimiento Global de Ventas
        </h3>
      </div>

      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="8 8" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'rgba(255,255,255,0.2)',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
              }}
              dy={15}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 2 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              content={(props: any) => {
                const { payload } = props;
                return (
                  <div className="flex justify-end gap-6 mb-8">
                    {payload?.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          {String(entry.value ?? '')}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#D4AF37"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: '#D4AF37', stroke: '#000', strokeWidth: 2 }}
              name="Ingresos"
              animationDuration={2000}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#000', strokeWidth: 2 }}
              name="Órdenes"
              animationDuration={2500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
