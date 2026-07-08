import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: Readonly<ProductGridProps>) {
  if (!products?.length) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
