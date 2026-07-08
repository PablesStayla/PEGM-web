'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCLP } from '@/lib/format';
import type { RevenueDataPoint } from '../actions/admin-analytics';

export default function RevenueChartClient({ data }: { data: RevenueDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1a4d2e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()} ${date.toLocaleString('es-ES', { month: 'short' })}`;
          }}
          dy={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          dx={-10}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload?.length) {
              return (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-lg shadow-xl">
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className="font-bold text-[#1a4d2e] dark:text-green-400">
                    {formatCLP((payload[0]?.value ?? 0) as number)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#1a4d2e"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
