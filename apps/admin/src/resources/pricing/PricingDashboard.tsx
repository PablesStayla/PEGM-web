'use client';

import { Badge } from '@pranakaia/ui';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BadgePercent,
  CheckCircle,
  CreditCard,
  DollarSign,
  Package,
  Truck,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

const PAYMENT_GATEWAYS = {
  flow: { name: 'Flow', commission: 2.95 },
  transbank: { name: 'Transbank WebPay', commission: 1.49 },
  mercadopago: { name: 'MercadoPago', commission: 5.59 },
} as const;

type GatewayKey = keyof typeof PAYMENT_GATEWAYS;

const IVA_RATE = 19;

function calcMargin(
  cost: number,
  price: number,
  shippingCost: number,
  gateway: GatewayKey,
  freeShipping: boolean,
) {
  const ivaAmount = Math.round(price * (IVA_RATE / (100 + IVA_RATE)));
  const priceExIva = price - ivaAmount;
  const commissionAmt = Math.round((price * PAYMENT_GATEWAYS[gateway].commission) / 100);
  const shipping = freeShipping ? shippingCost : 0;
  const grossProfit = priceExIva - cost - commissionAmt - shipping;
  const margin = ((grossProfit / priceExIva) * 100).toFixed(1);
  return { grossProfit, margin: parseFloat(margin), ivaAmount, commissionAmt, shipping };
}

interface PricingDashboardProps {
  initialProducts: Array<{
    id: string;
    name: string;
    cost: number;
    price: number;
    shippingCost: number;
    category: string;
  }>;
}

export function PricingDashboard({ initialProducts }: PricingDashboardProps) {
  const [gateway, setGateway] = useState<GatewayKey>('flow');
  const [freeShipping, setFreeShipping] = useState(false);

  const margins = initialProducts.map((p) => ({
    ...p,
    ...calcMargin(p.cost, p.price, p.shippingCost, gateway, freeShipping),
  }));

  const alerts = margins.filter((p) => p.margin < 15);
  const healthy = margins.filter((p) => p.margin >= 30);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
            <Wallet className="h-8 w-8 text-amber-500" />
            Matriz de Rentabilidad
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Margen neto real por producto incluyendo IVA, comisiones y logística (Screaming
            Architecture).
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
              Pasarela de Pago
            </label>
            <select
              className="text-sm bg-[#161616] text-white border border-white/10 rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-[#14b8a6]/50"
              value={gateway}
              onChange={(e) => setGateway(e.target.value as GatewayKey)}
            >
              {Object.entries(PAYMENT_GATEWAYS).map(([key, gw]) => (
                <option key={key} value={key}>
                  {gw.name} ({gw.commission}%)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
              Modo Envío
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFreeShipping(false)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  !freeShipping
                    ? 'bg-[#14b8a6] text-white border-[#14b8a6]'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                Cliente paga
              </button>
              <button
                type="button"
                onClick={() => setFreeShipping(true)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  freeShipping
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                Envío gratis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-green-500/10 rounded-xl border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-xs uppercase font-bold text-green-400 tracking-tighter">
              Rentables +30%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{healthy.length}</p>
          <p className="text-[10px] text-green-500/60 mt-1">productos en zona óptima</p>
        </div>
        <div className="p-5 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase font-bold text-amber-400 tracking-tighter">
              Alertas -15%
            </span>
          </div>
          <p className="text-3xl font-black text-white">{alerts.length}</p>
          <p className="text-[10px] text-amber-500/60 mt-1">productos en zona de riesgo</p>
        </div>
        <div className="p-5 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span className="text-xs uppercase font-bold text-blue-400 tracking-tighter">
              Comisión activa
            </span>
          </div>
          <p className="text-3xl font-black text-white">{PAYMENT_GATEWAYS[gateway].commission}%</p>
          <p className="text-[10px] text-blue-500/60 mt-1">{PAYMENT_GATEWAYS[gateway].name}</p>
        </div>
        <div className="p-5 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BadgePercent className="h-4 w-4 text-gray-400" />
            <span className="text-xs uppercase font-bold text-gray-400 tracking-tighter">
              Margen promedio
            </span>
          </div>
          <p className="text-3xl font-black text-white">
            {(margins.reduce((a, b) => a + b.margin, 0) / (margins.length || 1)).toFixed(1)}%
          </p>
          <p className="text-[10px] text-gray-500 mt-1">sobre todos los productos</p>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-200">
              {alerts.length} producto(s) con margen menor al 15%
            </p>
            <p className="text-xs text-amber-200/60 mt-1">
              {freeShipping
                ? 'Con envío gratis activo, el costo de despacho se está absorbiendo en tu margen.'
                : 'Considera ajustar el precio de venta o buscar un proveedor con mejor costo.'}
            </p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#161616] rounded-2xl border border-white/6 overflow-hidden">
        <div className="p-6 border-b border-white/6 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-bold uppercase tracking-widest text-white">
            Desglose por Producto
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/6">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Producto
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Costo
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  PVP
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  IVA (19%)
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Comisión
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <Truck className="h-3 w-3 inline mr-1" />
                  Despacho
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Ganancia Neta
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {margins.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-white group-hover:text-[#14b8a6] transition-colors">
                        {p.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[9px] mt-1 bg-white/5 border-white/10 text-gray-400"
                      >
                        {p.category}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-right px-4 py-4 font-mono text-gray-400">
                    ${p.cost.toLocaleString('es-CL')}
                  </td>
                  <td className="text-right px-4 py-4 font-mono font-bold text-white">
                    ${p.price.toLocaleString('es-CL')}
                  </td>
                  <td className="text-right px-4 py-4 font-mono text-red-400/80">
                    -${p.ivaAmount.toLocaleString('es-CL')}
                  </td>
                  <td className="text-right px-4 py-4 font-mono text-red-400/80">
                    -${p.commissionAmt.toLocaleString('es-CL')}
                  </td>
                  <td className="text-right px-4 py-4 font-mono text-orange-400/80">
                    {p.shipping > 0 ? `-$${p.shipping.toLocaleString('es-CL')}` : '—'}
                  </td>
                  <td className="text-right px-4 py-4 font-mono font-black">
                    <span className={p.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {p.grossProfit >= 0 ? '+' : ''}${p.grossProfit.toLocaleString('es-CL')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      {p.margin >= 30 ? (
                        <ArrowUp className="h-3.5 w-3.5 text-green-400" />
                      ) : p.margin < 15 ? (
                        <ArrowDown className="h-3.5 w-3.5 text-red-400" />
                      ) : (
                        <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span
                        className={`font-black text-sm ${
                          p.margin >= 30
                            ? 'text-green-400'
                            : p.margin < 15
                              ? 'text-red-400'
                              : 'text-amber-400'
                        }`}
                      >
                        {p.margin}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-gray-600 text-center">
        * Cálculo basado en IVA incluido (19%), comisión {PAYMENT_GATEWAYS[gateway].name} (
        {PAYMENT_GATEWAYS[gateway].commission}%) y costo de despacho estimado.
      </p>
    </div>
  );
}
