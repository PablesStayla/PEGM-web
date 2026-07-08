'use client';

import { Button } from '@pranakaia/ui';
import { ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useComparisonStore } from '@/store/comparison';

interface ComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComparisonDrawer({ isOpen, onClose }: ComparisonDrawerProps) {
  const { items, removeFromComparison, clearComparison } = useComparisonStore();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar comparador"
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transition-transform duration-300',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Comparar Productos ({items.length}/4)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Selecciona hasta 4 productos para comparar
              </p>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearComparison}>
                  Limpiar todo
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products */}
          {items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {items.map((product) => (
                <div key={product.id} className="relative bg-gray-50 rounded-lg p-4 group">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Product Image */}
                  <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-primary-600 font-semibold text-lg">${product.price}</p>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: 4 - items.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 flex items-center justify-center"
                >
                  <p className="text-sm text-gray-400 text-center">Agrega más productos</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay productos para comparar</p>
              <Button onClick={onClose}>Explorar Productos</Button>
            </div>
          )}

          {/* Actions */}
          {items.length >= 2 && (
            <div className="flex justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/comparison">
                  Ver Comparación Detallada
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
