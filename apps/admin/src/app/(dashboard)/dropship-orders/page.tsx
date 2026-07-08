import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@pranakaia/ui';
import { AlertTriangle, CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { getDropshipOrdersAction, getDropshipStatsAction } from '@/actions/dropship-orders';

export const dynamic = 'force-dynamic';

type DropshipOrderRow = {
  id: string;
  orderNumber: string;
  supplierName: string;
  supplierSku: string;
  quantity: number;
  totalCost: number;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
};

type DropshipStats = {
  pending: number;
  submitted: number;
  shipped: number;
  failed: number;
  total: number;
};

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Enviado',
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    icon: Package,
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    icon: CheckCircle,
  },
  PROCESSING: {
    label: 'Procesando',
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    icon: Package,
  },
  SHIPPED: {
    label: 'Despachado',
    color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-green-500/10 text-green-400 border border-green-500/20',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    icon: XCircle,
  },
  FAILED: {
    label: 'Fallido',
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
    icon: AlertTriangle,
  },
  RETURNED: {
    label: 'Devuelto',
    color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    icon: XCircle,
  },
};

export default async function DropshipOrdersPage() {
  const [ordersResult, statsResult] = await Promise.all([
    getDropshipOrdersAction(undefined),
    getDropshipStatsAction(),
  ]);

  const ordersActionResult = ordersResult as {
    serverError?: string;
    data?: { success: boolean; data?: unknown[] };
  };
  const ordersError = ordersActionResult?.serverError ?? null;

  // next-safe-action: ordersResult.data = { success, data: [...] }
  const ordersRaw = Array.isArray(ordersActionResult?.data?.data)
    ? (ordersActionResult.data!.data as unknown[])
    : [];
  const orders: DropshipOrderRow[] = ordersRaw.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r['id'] ?? ''),
      orderNumber: String(r['orderNumber'] ?? ''),
      supplierName: String(r['supplierName'] ?? 'N/A'),
      supplierSku: String(r['supplierSku'] ?? 'N/A'),
      quantity: Number(r['quantity'] ?? 0),
      totalCost: Number(r['totalCost'] ?? 0),
      status: String(r['status'] ?? 'PENDING'),
      trackingNumber: (r['trackingNumber'] ? String(r['trackingNumber']) : null) as string | null,
      createdAt: String(r['createdAt'] ?? new Date().toISOString()),
    };
  });
  // next-safe-action: statsResult.data = { success, data: { pending, submitted, ... } }
  const statsActionResult = statsResult as { data?: { data?: DropshipStats } };
  const statsInner = statsActionResult?.data?.data ?? null;
  const stats = (
    statsInner && typeof statsInner === 'object' ? statsInner : null
  ) as DropshipStats | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Órdenes Dropship</h1>
        <p className="text-sm text-gray-400 mt-1">
          Gestiona las órdenes enviadas a proveedores dropshipping
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            color="text-white"
            bgColor="bg-[#161616] border-white/6"
          />
          <StatCard
            label="Pendientes"
            value={stats.pending}
            color="text-yellow-400"
            bgColor="bg-yellow-500/8 border-yellow-500/20"
          />
          <StatCard
            label="Enviadas"
            value={stats.submitted}
            color="text-blue-400"
            bgColor="bg-blue-500/8 border-blue-500/20"
          />
          <StatCard
            label="Despachadas"
            value={stats.shipped}
            color="text-cyan-400"
            bgColor="bg-cyan-500/8 border-cyan-500/20"
          />
          <StatCard
            label="Fallidas"
            value={stats.failed}
            color="text-red-400"
            bgColor="bg-red-500/8 border-red-500/20"
          />
        </div>
      )}

      {ordersError && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          <p>Error: {ordersError}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/6 hover:bg-transparent">
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Orden
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Proveedor
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                SKU
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Cant.
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Costo
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Tracking
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Fecha
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const statusKey = order.status as keyof typeof statusConfig;
              const config = statusConfig[statusKey] || statusConfig.PENDING;
              const StatusIcon = config.icon;

              return (
                <TableRow
                  key={order.id}
                  className="border-b border-white/4 hover:bg-white/2 transition-colors"
                >
                  <TableCell className="font-mono font-medium text-sm text-white">
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">{order.supplierName}</TableCell>
                  <TableCell className="text-sm font-mono text-gray-500">
                    {order.supplierSku}
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">{order.quantity}</TableCell>
                  <TableCell className="text-sm font-medium text-[#14b8a6]">
                    ${order.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.trackingNumber ? (
                      <span className="font-mono text-xs text-[#14b8a6]">
                        {order.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-CL')}
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="font-medium text-white">Sin órdenes dropship</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Las órdenes aparecerán aquí cuando los clientes completen sus compras.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border`}>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
