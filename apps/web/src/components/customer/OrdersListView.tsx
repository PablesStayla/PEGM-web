'use client';

import { Badge, Button, Card, CardContent } from '@pranakaia/ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const statusConfig = {
  PENDING: { label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Procesando', icon: Package, color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Entregado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

interface OrderProductInfo {
  name: string;
  image: string | null;
  slug?: string | null;
}

interface OrderLineItem {
  id: string;
  product: OrderProductInfo;
  quantity: number;
  price: number;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string | Date;
  total: number | string;
  items?: OrderLineItem[];
}

interface OrdersListViewProps {
  orders: CustomerOrder[];
}

export function OrdersListView({ orders }: OrdersListViewProps) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-100 flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No tienes órdenes</h2>
          <p className="mt-2 text-sm text-gray-600">
            Cuando realices una compra, tus órdenes aparecerán aquí
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
        const StatusIcon = statusInfo.icon;

        return (
          <Card key={order.id}>
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Orden #{order.orderNumber}</h3>
                    <Badge variant="outline" className={statusInfo.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Realizada el{' '}
                    {format(new Date(order.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">${order.total.toLocaleString('es-CL')}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-4">
                {(order.items ?? []).slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium hover:text-green-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.price * item.quantity).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                ))}

                {(order.items?.length ?? 0) > 3 && (
                  <p className="text-sm text-gray-500">
                    + {(order.items?.length ?? 0) - 3} producto(s) más
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/orders/${order.orderNumber}`}>Ver Detalles</Link>
                </Button>

                {order.status === 'DELIVERED' && (
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/orders/${order.orderNumber}/review`}>Dejar Reseña</Link>
                  </Button>
                )}

                {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                  <Button asChild variant="ghost" className="w-full sm:w-auto">
                    <Link href="/support">Contactar Soporte</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
