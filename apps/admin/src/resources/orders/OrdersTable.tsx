'use client';

import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@pranakaia/ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Eye, MoreHorizontal, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateOrderStatus } from '@/actions/admin-orders';
import { SortableHeader } from '@/components/shared/SortableHeader';
import { UpdateStatusDialog } from './UpdateStatusDialog';

export interface OrderWithCustomer {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string | number;
  guestEmail: string | null;
  createdAt: Date | string;
  customer: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
}

interface OrdersTableProps {
  orders: OrderWithCustomer[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  PAID: { label: 'Pagado', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  PROCESSING: { label: 'Procesando', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  SHIPPED: { label: 'Enviado', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  DELIVERED: {
    label: 'Entregado',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  REFUNDED: { label: 'Reembolsado', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  FAILED: { label: 'Fallido', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  PROCESSING: { label: 'Procesando', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED: {
    label: 'Completado',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  PAID: { label: 'Pagado', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  FAILED: { label: 'Fallido', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  REFUNDED: {
    label: 'Reembolsado',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const handleMarkDelivered = async (order: OrderWithCustomer) => {
    const result = await updateOrderStatus({ orderId: order.id, status: 'DELIVERED' });
    if (result?.serverError) {
      toast({ variant: 'destructive', title: '❌ Error', description: String(result.serverError) });
      return;
    }
    const data = (result as { data?: { success: boolean } })?.data;
    if (data?.success) {
      toast({
        title: '✅ Orden entregada',
        description: `La orden ${order.orderNumber} ha sido marcada como entregada`,
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'No se pudo actualizar la orden',
      });
    }
  };

  const handleCancelOrder = async (order: OrderWithCustomer) => {
    const confirmed = window.confirm(`¿Estás seguro de cancelar la orden ${order.orderNumber}?`);
    if (!confirmed) {
      return;
    }
    const result = await updateOrderStatus({ orderId: order.id, status: 'CANCELLED' });
    if (result?.serverError) {
      toast({ variant: 'destructive', title: '❌ Error', description: String(result.serverError) });
      return;
    }
    const data = (result as { data?: { success: boolean } })?.data;
    if (data?.success) {
      toast({
        title: '🚫 Orden cancelada',
        description: `La orden ${order.orderNumber} ha sido cancelada`,
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'No se pudo cancelar la orden',
      });
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex h-100 items-center justify-center rounded-xl border border-white/6 bg-[#161616]">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-lg font-semibold text-white">No hay órdenes</p>
          <p className="text-sm text-gray-500 mt-1">
            Las órdenes aparecerán aquí cuando los clientes realicen compras
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/6 hover:bg-transparent">
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="orderNumber">Orden</SortableHeader>
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Cliente
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="status">Estado</SortableHeader>
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Pago
              </TableHead>
              <TableHead className="text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="totalAmount" className="justify-end">
                  Total
                </SortableHeader>
              </TableHead>
              <TableHead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <SortableHeader field="createdAt">Fecha</SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusConfig[order.status] ?? {
                label: order.status,
                className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
              };
              const payStatus = paymentStatusConfig[order.paymentStatus] ?? {
                label: order.paymentStatus,
                className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
              };
              return (
                <TableRow
                  key={order.id}
                  className="border-b border-white/4 hover:bg-white/2 transition-colors"
                >
                  {/* Order Number */}
                  <TableCell className="font-mono font-medium text-white text-sm">
                    {order.orderNumber}
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {order.customer ? (
                        <>
                          <span className="font-medium text-white text-sm">
                            {[order.customer.firstName, order.customer.lastName]
                              .filter(Boolean)
                              .join(' ') || 'Sin nombre'}
                          </span>
                          <span className="text-xs text-gray-500">{order.customer.email}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-white text-sm">Invitado</span>
                          <span className="text-xs text-gray-500">
                            {order.guestEmail || 'Sin email'}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-medium border', status.className)}
                    >
                      {status.label}
                    </Badge>
                  </TableCell>

                  {/* Payment Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-medium border', payStatus.className)}
                    >
                      {payStatus.label}
                    </Badge>
                  </TableCell>

                  {/* Total */}
                  <TableCell className="text-right font-semibold text-[#14b8a6]">
                    ${Number(order.totalAmount).toLocaleString('es-CL')}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-sm text-gray-400">
                    {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/6"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1a1a1a] border-white/8 text-white"
                      >
                        <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider">
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/6" />
                        <DropdownMenuItem
                          className="hover:bg-white/6 cursor-pointer"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4 text-gray-400" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-white/6 cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowUpdateDialog(true);
                          }}
                        >
                          <Truck className="mr-2 h-4 w-4 text-gray-400" />
                          Actualizar estado
                        </DropdownMenuItem>
                        {order.status !== 'DELIVERED' && (
                          <DropdownMenuItem
                            className="hover:bg-white/6 cursor-pointer text-green-400 hover:text-green-300"
                            onClick={() => handleMarkDelivered(order)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar entregado
                          </DropdownMenuItem>
                        )}
                        {order.status !== 'CANCELLED' && (
                          <DropdownMenuItem
                            className="hover:bg-red-500/10 cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() => handleCancelOrder(order)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar orden
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <UpdateStatusDialog
          order={selectedOrder}
          open={showUpdateDialog}
          onOpenChangeAction={setShowUpdateDialog}
        />
      )}
    </>
  );
}
