'use client';

import { Skeleton } from '@pranakaia/ui';

const ProductSkeleton = () => {
  return (
    <div className="group relative flex flex-col items-start overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-4 w-full space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 flex w-full items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
