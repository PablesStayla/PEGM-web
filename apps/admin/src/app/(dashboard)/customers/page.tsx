export const dynamic = 'force-dynamic';

import { DashboardService } from '@/lib/admin/dashboard-service';
import { CustomerList } from '@/resources/customers/CustomerList';

export const metadata = {
  title: 'Clientes | Admin - PranaKaia',
  description: 'Gestión de clientes y base de datos de usuarios',
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || '';
  const { customers: rawCustomers, total } = await DashboardService.getCustomers(query);

  const customers = rawCustomers.map((c) => ({
    ...c,
    _count: { orders: c.orderCount },
  }));

  return <CustomerList customers={customers} total={total} query={query} />;
}
