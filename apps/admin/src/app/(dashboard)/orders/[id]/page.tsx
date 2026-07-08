export const dynamic = 'force-dynamic';

import { Badge, Button, Card, Separator } from '@pranakaia/ui';
import { ArrowLeft, Package, Truck, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/actions/admin-orders';
import { OrderStatusSelector } from '@/resources/orders/OrderStatusSelector';
import type { OrderStatus } from '@/types/db';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  subtotal: number;
  productData: Record<string, unknown>;
}

interface AdminOrderCustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: Date;
  guestEmail?: string | null;
  subtotal?: number | string;
  shippingAmount?: number | string;
  taxAmount?: number | string;
  totalAmount?: number | string;
  shippingAddress?: Record<string, unknown> | null;
  customer?: AdminOrderCustomer | null;
  items: OrderItem[];
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminOrderById({ orderId: id });

  // next-safe-action: result.data = actionReturn = { success, data: orderObj }
  const inner = (result as { data?: { data?: Record<string, unknown> } })?.data ?? null;

  if (!inner?.data) {
    notFound();
  }

  const order = inner.data as unknown as AdminOrderDetail;

  // Formatter helpers
  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(amount));

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' }).format(date);

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Orden {order.orderNumber}</h1>
            <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">Realizada el {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content: Items */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" /> Productos
            </h3>
            <div className="divide-y">
              {order.items.map((item: OrderItem) => {
                const pd = item.productData as Record<string, unknown> | null;
                return (
                  <div key={item.id} className="py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {pd?.image && typeof pd.image === 'string' ? (
                        <Image
                          src={pd.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-md bg-gray-100"
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(Number(item.subtotal))}</p>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>{formatCurrency(Number(order.shippingAmount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impuestos</span>
                <span>{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar: Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> Cliente
            </h3>
            <div className="space-y-3 text-sm">
              {order.customer ? (
                <>
                  <p>
                    <span className="font-medium">Nombre:</span> {order.customer.firstName}{' '}
                    {order.customer.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {order.customer.email}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span> {order.customer.phone || 'N/A'}
                  </p>
                </>
              ) : (
                <p>
                  <span className="font-medium">Email Invitado:</span> {order.guestEmail}
                </p>
              )}
            </div>
          </Card>

          {/* Shipping Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" /> Envío
            </h3>
            <div className="space-y-3 text-sm">
              {order.shippingAddress ? (
                (() => {
                  const addr = order.shippingAddress as Record<string, unknown>;
                  return (
                    <div className="space-y-1 text-gray-600">
                      {Boolean(addr.street) && <p>{String(addr.street)}</p>}
                      {Boolean(addr.apartment) && <p>{String(addr.apartment)}</p>}
                      {Boolean(addr.city || addr.region) && (
                        <p>
                          {addr.city ? String(addr.city) : ''}
                          {addr.city && addr.region ? ', ' : ''}
                          {addr.region ? String(addr.region) : ''}
                        </p>
                      )}
                      {Boolean(addr.zip) && <p>CP: {String(addr.zip)}</p>}
                      {Boolean(addr.country) && <p>{String(addr.country)}</p>}
                      {Boolean(addr.phone) && <p>Tel: {String(addr.phone)}</p>}
                      {!addr.street && !addr.city && (
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(order.shippingAddress, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="text-gray-400">No especificada</p>
              )}
              <Separator />
              <p>
                <span className="font-medium">Costo Envío:</span>{' '}
                {formatCurrency(Number(order.shippingAmount))}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
