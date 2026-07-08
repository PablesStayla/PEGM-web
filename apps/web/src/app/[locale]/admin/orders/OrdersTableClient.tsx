'use client';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pranakaia/ui';
import { Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { formatCLP } from '@/lib/format';
import { type getAdminOrders, updateOrderStatus } from '../../actions/admin-orders';

type AdminOrder = Awaited<ReturnType<typeof getAdminOrders>>[number];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-teal-100 text-teal-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

type OrderStatus = Parameters<typeof updateOrderStatus>[1];

export default function OrdersTableClient({ orders }: { orders: AdminOrder[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    const statusFlow: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus as OrderStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return;
    }

    const newStatus = statusFlow[currentIndex + 1];
    if (!newStatus) {
      return;
    }
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableHead className="w-25">ID Orden</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No se han registrado órdenes en la plataforma.
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => {
            const customerDisplay = order.guestEmail || order.customerId || 'Invitado';
            const email = order.guestEmail || 'N/A';

            return (
              <TableRow
                key={order.id}
                className={`hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors ${
                  updatingId === order.id ? 'opacity-50' : ''
                }`}
              >
                <TableCell className="font-medium text-xs">
                  #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{customerDisplay}</div>
                  <div className="text-xs text-gray-400">{email}</div>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('es-CL')}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCLP(order.totalAmount.amount)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleStatusChange(order.id, order.status)}
                    disabled={updatingId === order.id}
                    className="focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] rounded"
                    type="button"
                  >
                    <Badge
                      variant={order.status === 'PENDING' ? 'outline' : 'default'}
                      className={`text-[10px] uppercase border-none ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
