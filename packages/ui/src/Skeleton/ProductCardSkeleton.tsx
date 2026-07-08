export function ProductCardSkeleton() {
  return (
    <div
      role="presentation"
      data-testid="product-card-skeleton"
      className="group relative overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg"
    >
      <div
        className="aspect-square w-full overflow-hidden bg-gray-200 dark:bg-gray-800 animate-pulse"
        data-testid="product-card-skeleton-image"
      />
      <div className="p-4 space-y-2">
        <div
          className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
          data-testid="product-card-skeleton-title"
        />
        <div
          className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
          data-testid="product-card-skeleton-price"
        />
      </div>
    </div>
  );
}
