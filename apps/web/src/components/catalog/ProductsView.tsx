'use client';

import { useMemo } from 'react';
import { ActiveFilters, FilterSidebar, SortDropdown } from '@/components/filters';
import { ProductGrid } from '@/components/ProductGrid';
import { useProductStore } from '@/store';

export function ProductsView() {
  const {
    currentCategory,
    sortBy,
    filterByCategory,
    searchProducts,
    products,
    searchQuery,
    setSortBy,
  } = useProductStore();

  const clearSearch = () => {
    searchProducts('');
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: clearSearch is stable
  const activeFilters = useMemo(() => {
    const filters: { id: string; label: string; value: string; onRemove: () => void }[] = [];

    if (currentCategory && currentCategory !== 'all') {
      filters.push({
        id: 'category',
        label: 'Categoría',
        value: String(currentCategory),
        onRemove: () => filterByCategory('all'),
      });
    }

    if (searchQuery) {
      filters.push({
        id: 'search',
        label: 'Búsqueda',
        value: searchQuery,
        onRemove: clearSearch,
      });
    }

    return filters;
  }, [currentCategory, filterByCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-8">
        Nuestros Productos
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <FilterSidebar />
        </div>

        <div className="lg:col-span-9">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <ActiveFilters
              filters={activeFilters}
              onClearAll={() => {
                filterByCategory('all');
                clearSearch();
              }}
            />

            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {products.length} producto{products.length !== 1 && 's'}
          </p>

          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
