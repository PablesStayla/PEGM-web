import { Button, Card } from '@pranakaia/ui';
import { Filter, Plus, Search } from 'lucide-react';
import { getAdminProducts } from '../../actions/admin-products';
import ProductsTableClient from './ProductsTableClient';

export const metadata = { title: 'Gestión de Productos | PranaKaia Admin' };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventario de Productos
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona tu catálogo de productos y niveles de stock ({products.length} registrados).
          </p>
        </div>
        <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f] text-white flex items-center gap-2 rounded-xl shadow-md transition-transform hover:scale-105">
          <Plus className="h-4 w-4" />
          Añadir Producto
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-gray-200 dark:border-gray-800 shadow-sm glass-morphism">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos por SKU o nombre..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#1a4d2e]/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl">
              <Filter className="h-4 w-4" />
              Categorías
            </Button>
          </div>
        </div>

        <ProductsTableClient products={products} />
      </Card>
    </div>
  );
}
