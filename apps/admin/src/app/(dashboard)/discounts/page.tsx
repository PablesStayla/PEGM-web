import { coupons } from '@pranakaia/infrastructure/db';
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pranakaia/ui';
import { desc, ilike, or } from 'drizzle-orm';
import { Percent, Tag, TrendingDown } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

type DiscountRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: string;
  minAmount: string | null;
  usageCount: number;
  usageLimit: number | null;
  startsAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
};

const typeLabels: Record<DiscountRow['type'], { label: string; color: string }> = {
  percentage: {
    label: '% Porcentaje',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  fixed: { label: '$ Fijo', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  free_shipping: {
    label: 'Envio gratis',
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
};

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

function fmtDate(value: Date | null): string {
  if (!value) {
    return 'Sin expiracion';
  }
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(value);
}

function ProgressBar({ used, limit }: { used: number; limit: number | null }) {
  if (!limit) {
    return <span className="text-gray-500 text-xs">Ilimitado</span>;
  }

  const pct = Math.min((used / limit) * 100, 100);
  const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-[#14b8a6]';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {used} / {limit}
        </span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden w-24">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = (sp.search ?? '').trim();

  const where = search
    ? or(
        ilike(coupons.code, `%${search}%`),
        ilike(coupons.name, `%${search}%`),
        ilike(coupons.description, `%${search}%`),
      )
    : undefined;

  const discounts = (await db
    .select({
      id: coupons.id,
      code: coupons.code,
      name: coupons.name,
      description: coupons.description,
      type: coupons.type,
      value: coupons.value,
      minAmount: coupons.minAmount,
      usageCount: coupons.usageCount,
      usageLimit: coupons.usageLimit,
      startsAt: coupons.startsAt,
      expiresAt: coupons.expiresAt,
      isActive: coupons.isActive,
    })
    .from(coupons)
    .where(where)
    .orderBy(desc(coupons.createdAt))
    .limit(200)) as DiscountRow[];

  const activeCount = discounts.filter((d) => d.isActive).length;
  const totalUsage = discounts.reduce((acc, d) => acc + d.usageCount, 0);
  const expiringSoon = discounts.filter((d) => {
    if (!d.expiresAt) {
      return false;
    }
    const days = (d.expiresAt.getTime() - Date.now()) / 86400000;
    return days <= 30 && days >= 0;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Descuentos</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestion real de cupones y codigos de descuento desde base de datos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Cupones activos',
            value: activeCount,
            icon: Tag,
            color: 'text-green-400',
            bg: 'bg-green-500/8',
          },
          {
            label: 'Total cupones',
            value: discounts.length,
            icon: Percent,
            color: 'text-[#14b8a6]',
            bg: 'bg-[#14b8a6]/8',
          },
          {
            label: 'Total usos',
            value: totalUsage,
            icon: TrendingDown,
            color: 'text-blue-400',
            bg: 'bg-blue-500/8',
          },
          {
            label: 'Expiran pronto',
            value: expiringSoon,
            icon: TrendingDown,
            color: 'text-orange-400',
            bg: 'bg-orange-500/8',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-white/6 bg-[#161616] p-4 flex items-center gap-3"
            >
              <div className={`rounded-lg p-2.5 ${item.bg}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form className="max-w-xs" role="search">
        <Input
          name="search"
          placeholder="Buscar por codigo o nombre..."
          defaultValue={search}
          className="bg-[#161616] border-white/8 text-white placeholder:text-gray-500"
        />
      </form>

      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/6 hover:bg-transparent">
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Codigo
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Tipo
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Valor
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Min. compra
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Uso
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Vigencia
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-gray-500">
                  No hay cupones registrados para este filtro
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => {
                const typeCfg = typeLabels[discount.type] ?? typeLabels.fixed;
                const numericValue = Number(discount.value);
                const numericMin = discount.minAmount ? Number(discount.minAmount) : null;

                return (
                  <TableRow key={discount.id} className="border-b border-white/4 hover:bg-white/2">
                    <TableCell>
                      <p className="font-mono font-bold text-white tracking-wider">
                        {discount.code}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {discount.description ?? discount.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${typeCfg.color}`}
                      >
                        {typeCfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-white">
                      {discount.type === 'percentage'
                        ? `${numericValue}%`
                        : discount.type === 'free_shipping'
                          ? 'Envio gratis'
                          : fmtCurrency(numericValue)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {numericMin !== null ? (
                        fmtCurrency(numericMin)
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ProgressBar used={discount.usageCount} limit={discount.usageLimit} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      <p>Desde: {fmtDate(discount.startsAt)}</p>
                      <p>Hasta: {fmtDate(discount.expiresAt)}</p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          discount.isActive
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                        }`}
                      >
                        {discount.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
