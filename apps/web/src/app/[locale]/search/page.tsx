'use client';

import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

import { Button, Input } from '@pranakaia/ui';
import { Filter, Search, X } from 'lucide-react';
import { FilterSidebar, SortDropdown } from '@/components/filters';
import { ProductCard } from '@/components/ProductCard';
import { useProductStore } from '@/store';

export default function SearchPage() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });

  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const { sortBy, setSortBy } = useProductStore();

  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(searchTerm)}&sort=${sortBy}`,
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.products || []);
          setTotalResults(data.total || 0);
        }
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    },
    [sortBy],
  );

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setQuery(searchQuery.trim());
      performSearch(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Buscar Productos</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Â¿QuÃ© estÃ¡s buscando?"
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={!searchQuery.trim()}>
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </form>

          {/* Search Results Info */}
          {query && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600">
                  {loading ? (
                    'Buscando...'
                  ) : totalResults > 0 ? (
                    <>
                      <span className="font-semibold">{totalResults}</span> resultado
                      {totalResults !== 1 && 's'} para{' '}
                      <span className="font-semibold">"{query}"</span>
                    </>
                  ) : (
                    <>
                      No se encontraron resultados para{' '}
                      <span className="font-semibold">"{query}"</span>
                    </>
                  )}
                </p>
              </div>

              {results.length > 0 && (
                <SortDropdown value={sortBy} onChange={(value) => setSortBy(value)} />
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar />
          </div>

          {/* Results */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta con otros tÃ©rminos de bÃºsqueda o explora nuestras categorÃ­as.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sugerencias:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>â€¢ Verifica la ortografÃ­a</li>
                      <li>â€¢ Usa tÃ©rminos mÃ¡s generales</li>
                      <li>â€¢ Prueba con sinÃ³nimos</li>
                    </ul>
                  </div>
                  <Button asChild>
                    <a href="/products">Ver Todos los Productos</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Busca productos</h3>
                <p className="text-gray-600">
                  Ingresa un tÃ©rmino de bÃºsqueda para encontrar productos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
