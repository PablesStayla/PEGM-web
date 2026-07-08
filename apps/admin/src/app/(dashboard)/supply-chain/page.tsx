'use client';

import { Badge } from '@pranakaia/ui';
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  dailySales: number;
  daysLeft: number;
  trend: 'up' | 'down' | 'stable';
  supplier: string;
  leadDays: number;
  reorderPoint: number;
  ordered: boolean;
}

const calcDaysLeft = (stock: number, dailySales: number) =>
  dailySales > 0 ? Math.floor(stock / dailySales) : 999;

const PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'LED-12W-E27',
    name: 'Ampolleta LED 12W E27',
    category: 'Iluminación',
    stock: 6,
    dailySales: 3.2,
    daysLeft: calcDaysLeft(6, 3.2),
    trend: 'up',
    supplier: 'LumTech SA',
    leadDays: 5,
    reorderPoint: 10,
    ordered: false,
  },
  {
    id: '2',
    sku: 'STRIP-RGB-5M',
    name: 'Tira LED RGB 5m',
    category: 'Iluminación',
    stock: 24,
    dailySales: 1.8,
    daysLeft: calcDaysLeft(24, 1.8),
    trend: 'up',
    supplier: 'LumTech SA',
    leadDays: 7,
    reorderPoint: 15,
    ordered: false,
  },
  {
    id: '3',
    sku: 'BAT-9V-ALK',
    name: 'Batería 9V Alcalina',
    category: 'Electricidad',
    stock: 80,
    dailySales: 4.5,
    daysLeft: calcDaysLeft(80, 4.5),
    trend: 'stable',
    supplier: 'EnergyPro Ltda',
    leadDays: 3,
    reorderPoint: 30,
    ordered: false,
  },
  {
    id: '4',
    sku: 'CABLE-USB-C-2M',
    name: 'Cable USB-C 2m Premium',
    category: 'Cables',
    stock: 4,
    dailySales: 5.1,
    daysLeft: calcDaysLeft(4, 5.1),
    trend: 'up',
    supplier: 'TechConnect SpA',
    leadDays: 4,
    reorderPoint: 20,
    ordered: false,
  },
  {
    id: '5',
    sku: 'HDMI-4K-1.5M',
    name: 'Cable HDMI 4K 1.5m',
    category: 'Cables',
    stock: 40,
    dailySales: 1.2,
    daysLeft: calcDaysLeft(40, 1.2),
    trend: 'down',
    supplier: 'TechConnect SpA',
    leadDays: 4,
    reorderPoint: 15,
    ordered: false,
  },
  {
    id: '6',
    sku: 'EXT-4P-2M',
    name: 'Extensión 4 Enchufes 2m',
    category: 'Electricidad',
    stock: 3,
    dailySales: 2.3,
    daysLeft: calcDaysLeft(3, 2.3),
    trend: 'up',
    supplier: 'EnergyPro Ltda',
    leadDays: 3,
    reorderPoint: 12,
    ordered: false,
  },
];

const getUrgencyColor = (days: number) => {
  if (days <= 2) {
    return 'bg-red-50 border-red-200';
  }
  if (days <= 5) {
    return 'bg-amber-50 border-amber-200';
  }
  if (days <= 10) {
    return 'bg-yellow-50 border-yellow-100';
  }
  return 'bg-white border-zinc-100';
};

const getUrgencyBadge = (days: number) => {
  if (days <= 2) {
    return { label: 'CRÍTICO', color: 'bg-red-100 text-red-700' };
  }
  if (days <= 5) {
    return { label: 'URGENTE', color: 'bg-amber-100 text-amber-700' };
  }
  if (days <= 10) {
    return { label: 'PRONTO', color: 'bg-yellow-100 text-yellow-700' };
  }
  return { label: 'OK', color: 'bg-green-100 text-green-700' };
};

const getDaysLeftIcon = (days: number) => {
  if (days <= 2) {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  if (days <= 5) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  if (days <= 10) {
    return <Clock className="h-4 w-4 text-yellow-500" />;
  }
  return <CheckCircle className="h-4 w-4 text-green-500" />;
};

const stockoutDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
};

export default function SupplyChainPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'urgent' | 'ok'>('all');

  const markOrdered = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ordered: true } : p)));
  };

  const filtered = products.filter((p) => {
    if (filter === 'critical') {
      return p.daysLeft <= 2;
    }
    if (filter === 'urgent') {
      return p.daysLeft <= 5 && p.daysLeft > 2;
    }
    if (filter === 'ok') {
      return p.daysLeft > 10;
    }
    return true;
  });

  const critical = products.filter((p) => p.daysLeft <= 2).length;
  const urgent = products.filter((p) => p.daysLeft <= 5 && p.daysLeft > 2).length;
  const avgDays = Math.round(products.reduce((a, b) => a + b.daysLeft, 0) / products.length);
  const totalAtRisk = products.filter((p) => p.daysLeft <= 5).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-500" />
            Supply Chain AI
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Predicción inteligente de quiebre de stock basada en velocidad de ventas diaria.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Actualizado hace 2 min
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-red-50 rounded-2xl border border-red-100 text-center">
          <p className="text-4xl font-black text-red-600">{critical}</p>
          <p className="text-xs uppercase font-bold text-red-400 tracking-wider mt-1">
            Críticos (≤2d)
          </p>
        </div>
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-center">
          <p className="text-4xl font-black text-amber-600">{urgent}</p>
          <p className="text-xs uppercase font-bold text-amber-400 tracking-wider mt-1">
            Urgentes (≤5d)
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
          <p className="text-4xl font-black text-zinc-900">{avgDays}d</p>
          <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider mt-1">
            Promedio Stock
          </p>
        </div>
        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
          <p className="text-4xl font-black text-indigo-600">{totalAtRisk}</p>
          <p className="text-xs uppercase font-bold text-indigo-400 tracking-wider mt-1">
            En Riesgo Total
          </p>
        </div>
      </div>

      {/* AI Insight Banner */}
      {critical > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <Brain className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">
              Alerta IA: {critical} producto{critical !== 1 ? 's' : ''} se agota
              {critical !== 1 ? 'n' : ''} en menos de 2 días
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Basado en la tasa de ventas de los últimos 7 días. Se recomienda hacer pedido
              inmediato para evitar quiebre de stock.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all' as const, label: 'Todos', count: products.length },
          { id: 'critical' as const, label: 'Críticos', count: critical, color: 'text-red-600' },
          { id: 'urgent' as const, label: 'Urgentes', count: urgent, color: 'text-amber-600' },
          {
            id: 'ok' as const,
            label: 'OK',
            count: products.filter((p) => p.daysLeft > 10).length,
            color: 'text-green-600',
          },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              filter === f.id
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {f.label}{' '}
            <span
              className={`ml-1 ${filter === f.id ? 'text-white' : (f.color ?? 'text-zinc-400')}`}
            >
              ({f.count})
            </span>
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="space-y-3">
        {filtered.map((product) => {
          const urgency = getUrgencyBadge(product.daysLeft);
          const stockoutBy = (stock: number) => stockoutDate(stock);
          const needsOrder = product.stock <= product.reorderPoint;

          return (
            <div
              key={product.id}
              className={`rounded-2xl border p-4 md:p-5 transition-all ${getUrgencyColor(product.daysLeft)}`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Product Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white rounded-xl border border-zinc-100 shadow-sm shrink-0">
                    <Package className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{product.name}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">{product.sku}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[9px] bg-zinc-100 text-zinc-600 border-none">
                        {product.category}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                        <Truck className="h-3 w-3" /> {product.supplier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
                  <div>
                    <p className="text-lg font-black text-zinc-900">{product.stock}</p>
                    <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">
                      Stock
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-zinc-900 flex items-center justify-center gap-0.5">
                      {product.dailySales}
                      {product.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {product.trend === 'down' && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </p>
                    <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">
                      Vtas/día
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-black flex items-center justify-center gap-1 ${
                        product.daysLeft <= 2
                          ? 'text-red-600'
                          : product.daysLeft <= 5
                            ? 'text-amber-600'
                            : product.daysLeft <= 10
                              ? 'text-yellow-600'
                              : 'text-green-600'
                      }`}
                    >
                      {getDaysLeftIcon(product.daysLeft)}
                      {product.daysLeft > 100 ? '∞' : product.daysLeft}d
                    </p>
                    <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">
                      Restantes
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-zinc-700">
                      {product.daysLeft > 100 ? '—' : stockoutBy(product.daysLeft)}
                    </p>
                    <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">
                      Quiebre
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-zinc-700">{product.leadDays}d</p>
                    <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">
                      Lead Time
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${urgency.color}`}
                  >
                    {urgency.label}
                  </span>
                  {product.ordered ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Pedido hecho
                    </span>
                  ) : needsOrder ? (
                    <button
                      type="button"
                      onClick={() => markOrdered(product.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Hacer Pedido
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-300 font-semibold">Sin acción</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
