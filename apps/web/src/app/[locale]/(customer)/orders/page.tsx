import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCustomerOrders } from '@/app/actions/customer-orders';
import { OrdersListView } from '@/components/customer/OrdersListView';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis Órdenes - PranaKaia',
  description: 'Ver tus órdenes y su estado',
};

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/orders');
  }

  const result = await getCustomerOrders();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const orders = result.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis Órdenes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Revisa el estado de tus órdenes y obtén detalles de envío
        </p>
      </div>

      <OrdersListView orders={orders} />
    </div>
  );
}
