import type { Product } from '@/actions/products/types';

interface ProductListProps {
  products?: Product[] | undefined;
  loading?: boolean | undefined;
  pagination?:
    | {
        page: number;
        pageSize: number;
        total: number;
      }
    | undefined;
  error?: string | undefined;
}

export function ProductList({
  products = [],
  loading = false,
  pagination: _pagination,
  error,
}: ProductListProps) {
  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Error al cargar productos</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <div>No hay productos</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded p-4">
          <h3 className="font-bold">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.sku}</p>
          <p className="text-lg font-semibold">${product.basePrice?.toFixed(2) || '0.00'}</p>
          <span
            className={`text-xs px-2 py-1 rounded ${product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
          >
            {product.status}
          </span>
        </div>
      ))}
    </div>
  );
}
