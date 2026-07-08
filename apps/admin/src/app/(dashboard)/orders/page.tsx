import { OrderList } from '@/resources/orders';
import type { OrderWithCustomer } from '@/resources/orders/OrdersTable';
import { getAdminOrdersQuery } from '@/resources/orders/queries';

export const metadata = {
  title: 'Órdenes | Admin - PranaKaia',
  description: 'Gestión de órdenes',
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    payment?: string;
    search?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const filters = {
    page,
    pageSize: 20,
    sortBy: sp.sortBy,
    sortOrder: (sp.sortOrder as 'asc' | 'desc') || 'desc',
    status: sp.status,
    paymentStatus: sp.payment,
    search: sp.search,
  };

  // Thin Routes logic: delegate to the resource query
  // Errors are handled by error.tsx via result-bridge unwrap
  const result = await getAdminOrdersQuery(filters);

  const orders = result.items as OrderWithCustomer[];
  const pagination = {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  };

  return <OrderList orders={orders} pagination={pagination} />;
}
