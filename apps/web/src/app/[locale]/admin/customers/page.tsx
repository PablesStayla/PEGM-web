import { Button, Card } from '@pranakaia/ui';
import { Download, Filter, UserPlus } from 'lucide-react';
import { getAdminCustomers } from '../../actions/admin-customers';
import CustomersTableClient, { type Customer } from './CustomersTableClient';

export const metadata = { title: 'Gestión de Clientes | PranaKaia Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Directorio de Clientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Administra usuarios registrados, sus roles y estados de cuenta.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f] text-white flex items-center gap-2 rounded-xl">
            <UserPlus className="h-4 w-4" />
            Añadir Cliente P.A.
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-gray-200 dark:border-gray-800 shadow-sm glass-morphism">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-gray-50 dark:bg-gray-900/50 py-1 px-3 rounded-full">
            {customers.length} usuarios registrados
          </div>
        </div>

        <CustomersTableClient customers={customers as Customer[]} />
      </Card>
    </div>
  );
}
