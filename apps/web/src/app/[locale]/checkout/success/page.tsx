import { db, orderItems, orders, products } from '@pranakaia/infrastructure/db';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@pranakaia/ui';
import { eq } from 'drizzle-orm';
import { CheckCircle, Mail, Package, Truck } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function CheckoutSuccessContent({ orderId }: { orderId: string }) {
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId));
  const order = orderResult[0];

  if (!order) {
    redirect('/');
  }

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      subtotal: orderItems.subtotal,
      productName: products.name,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">¡Pago Exitoso!</h1>
        <p className="mt-2 text-lg text-gray-600">
          Gracias por tu compra. Tu orden ha sido confirmada.
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Detalles de tu Orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Número de Orden</p>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Pagado</p>
              <p className="text-lg font-semibold text-green-600">
                ${Number(order.total).toLocaleString('es-CL')} CLP
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-900">Productos</p>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName ?? 'Producto'}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${Number(item.subtotal).toLocaleString('es-CL')}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <Mail className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 font-semibold">Email Enviado</h3>
            <p className="mt-2 text-sm text-gray-600">
              Revisa tu inbox para el resumen de tu orden
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Package className="h-8 w-8 text-purple-600" />
            <h3 className="mt-4 font-semibold">Procesando</h3>
            <p className="mt-2 text-sm text-gray-600">Preparando tu orden para envío (1-2 días)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Truck className="h-8 w-8 text-green-600" />
            <h3 className="mt-4 font-semibold">Envío</h3>
            <p className="mt-2 text-sm text-gray-600">
              Recibirás tracking cuando se envíe (3-5 días)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href={`/orders/${order.orderNumber}`}>Ver Detalles de Orden</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products">Seguir Comprando</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Support both order_id (our Flow/internal) and session_id (Stripe)
  const orderId = searchParams.order_id;

  if (!orderId) {
    redirect('/');
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
            <p className="mt-4 text-gray-600">Confirmando tu pago...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent orderId={orderId} />
    </Suspense>
  );
}
