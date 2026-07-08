import { db, desc, eq, orders, users } from '@pranakaia/infrastructure/db';
import { getDashboardMetrics, getSalesData, getTopProducts } from '@/lib/admin/analytics';
import { DashboardOverview } from '@/resources/dashboard/DashboardOverview';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'War Room | Admin - PranaKaia',
  description: 'Centro de mando administrativo de alta fidelidad',
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  guestEmail: string | null;
  createdAt: Date;
  customerEmail: string | null;
};

async function getRecentOrders(): Promise<RecentOrder[]> {
  try {
    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.total,
        guestEmail: orders.guestEmail,
        createdAt: orders.createdAt,
        customerEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(6);

    return result as RecentOrder[];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
}

export default async function AdminDashboard() {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const [recentOrders, metrics, salesData, topProducts] = await Promise.all([
    getRecentOrders(),
    getDashboardMetrics(startDate, endDate),
    getSalesData(startDate, endDate, 'day'),
    getTopProducts(startDate, endDate, 5),
  ]);

  return (
    <DashboardOverview
      recentOrders={recentOrders}
      metrics={metrics}
      salesData={salesData}
      topProducts={topProducts}
    />
  );
}
