import { carts, orderItems, orders, products, users } from '@pranakaia/infrastructure/db';
import { Badge } from '@pranakaia/ui';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { Eye, Flame, MapPin, Radio, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

type ActiveCart = {
  id: string;
  sessionId: string | null;
  userEmail: string | null;
  status: string;
  updatedAt: Date;
};

type CheckoutOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  guestEmail: string | null;
  userEmail: string | null;
  createdAt: Date;
};

type ProductTrend = {
  productId: string;
  productName: string;
  sold: number;
};

export default async function LiveCommercePage() {
  const now = new Date();
  const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const soldExpr = sql<number>`sum(${orderItems.quantity})`;

  const [activeCarts, checkoutOrders, recentOrders, topProducts, cartsToday, ordersToday] =
    await Promise.all([
      db
        .select({
          id: carts.id,
          sessionId: carts.sessionId,
          userEmail: users.email,
          status: carts.status,
          updatedAt: carts.updatedAt,
        })
        .from(carts)
        .leftJoin(users, eq(carts.userId, users.id))
        .where(and(eq(carts.status, 'active'), gte(carts.updatedAt, last30Minutes)))
        .orderBy(desc(carts.updatedAt))
        .limit(20),
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          guestEmail: orders.guestEmail,
          userEmail: users.email,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(
          and(
            gte(orders.createdAt, last30Minutes),
            inArray(orders.status, ['PENDING', 'PAID', 'PROCESSING', 'FULFILLING'] as const),
          ),
        )
        .orderBy(desc(orders.createdAt))
        .limit(20),
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          guestEmail: orders.guestEmail,
          userEmail: users.email,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(gte(orders.createdAt, last24Hours))
        .orderBy(desc(orders.createdAt))
        .limit(12),
      db
        .select({
          productId: products.id,
          productName: products.name,
          sold: soldExpr,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(gte(orders.createdAt, last24Hours))
        .groupBy(products.id, products.name)
        .orderBy(desc(soldExpr))
        .limit(5),
      db
        .select({ total: sql<number>`count(*)` })
        .from(carts)
        .where(gte(carts.createdAt, startOfDay)),
      db
        .select({ total: sql<number>`count(*)` })
        .from(orders)
        .where(gte(orders.createdAt, startOfDay)),
    ]);

  const activeNow = activeCarts.length + checkoutOrders.length;
  const visitsToday = cartsToday[0]?.total ?? 0;
  const purchasesToday = ordersToday[0]?.total ?? 0;
  const hotProduct = (topProducts[0] as ProductTrend | undefined)?.productName ?? 'Sin datos';

  const checkoutStatusClass: Record<string, string> = {
    PENDING: 'bg-yellow-500/15 text-yellow-300',
    PAID: 'bg-green-500/15 text-green-300',
    PROCESSING: 'bg-blue-500/15 text-blue-300',
    FULFILLING: 'bg-purple-500/15 text-purple-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Radio className="h-8 w-8 text-red-500" />
            Live Commerce
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Estado operativo en tiempo casi real (datos de carrito, checkout y ordenes)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
              Activos (30m)
            </span>
          </div>
          <p className="text-4xl font-black text-zinc-900">{activeNow}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
              Carritos hoy
            </span>
          </div>
          <p className="text-4xl font-black text-zinc-900">{visitsToday}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
              Ordenes hoy
            </span>
          </div>
          <p className="text-4xl font-black text-amber-600">{purchasesToday}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
              Producto hot 24h
            </span>
          </div>
          <p className="text-sm font-black text-orange-600 leading-tight">{hotProduct}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <header className="p-5 border-b border-zinc-50 flex items-center gap-2">
            <Eye className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-600">
              Checkouts activos (ultimos 30 minutos)
            </h2>
          </header>

          <div className="divide-y divide-zinc-100">
            {checkoutOrders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-500">
                No hay checkouts activos en este momento.
              </p>
            ) : (
              (checkoutOrders as CheckoutOrder[]).map((order) => (
                <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Orden #{order.orderNumber}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {order.userEmail || order.guestEmail || 'Cliente invitado'} ·{' '}
                      {new Date(order.createdAt).toLocaleTimeString('es-CL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        checkoutStatusClass[order.status] ?? 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 mt-1">
                      ${Number(order.total).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <header className="p-5 border-b border-zinc-50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-600">
              Productos con mayor rotacion (24h)
            </h2>
          </header>
          <div className="divide-y divide-zinc-100">
            {topProducts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-500">Sin ventas en las ultimas 24h.</p>
            ) : (
              (topProducts as ProductTrend[]).map((item, index) => (
                <div
                  key={item.productId}
                  className="px-5 py-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      #{index + 1} {item.productName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Unidades vendidas</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-none">{item.sold}</Badge>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <header className="p-5 border-b border-zinc-50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-600">
            Ultimas ordenes (24h)
          </h2>
        </header>
        <div className="divide-y divide-zinc-100">
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500">No hay ordenes recientes.</p>
          ) : (
            (recentOrders as CheckoutOrder[]).map((order) => (
              <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">#{order.orderNumber}</p>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{' '}
                    {order.userEmail || order.guestEmail || 'Cliente invitado'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleString('es-CL')}
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">
                    ${Number(order.total).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <header className="p-5 border-b border-zinc-50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-600">
            Carritos activos (30m)
          </h2>
        </header>
        <div className="divide-y divide-zinc-100">
          {activeCarts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500">
              No hay carritos activos en ventana de 30 minutos.
            </p>
          ) : (
            (activeCarts as ActiveCart[]).map((cart) => (
              <div key={cart.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Carrito {cart.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {cart.userEmail || cart.sessionId || 'Sesion anonima'}
                  </p>
                </div>
                <p className="text-xs text-zinc-500">
                  {new Date(cart.updatedAt).toLocaleString('es-CL')}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
