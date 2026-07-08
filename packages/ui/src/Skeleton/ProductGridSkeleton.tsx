import { ProductCardSkeleton } from './ProductCardSkeleton';

export function ProductGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
      data-testid="product-grid-skeleton"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={`product-skeleton-${i}`} />
      ))}
    </div>
  );
}
