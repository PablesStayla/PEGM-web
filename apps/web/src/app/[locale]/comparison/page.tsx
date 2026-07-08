'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@pranakaia/ui';
import { ArrowLeft, Check, Minus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useComparisonStore } from '@/store/comparison';

import type { Product } from '@/types';

export default function ComparisonPage() {
  const router = useRouter();
  const { items, removeFromComparison, clearComparison } = useComparisonStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No hay productos para comparar</h2>
          <p className="text-gray-600 mb-8">
            Agrega productos desde la tienda para compararlos aquí
          </p>
          <Button asChild>
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const specifications = [
    { key: 'Precio', getValue: (product: Product) => `$${product.price}` },
    { key: 'Categoría', getValue: (product: Product) => product.category ?? '-' },
    { key: 'Stock', getValue: (product: Product) => `${product.stock ?? 0} disponibles` },
    {
      key: 'Descuento',
      getValue: (product: Product) =>
        product.originalPrice
          ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
          : '-',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comparación de Productos</h1>
            <p className="text-gray-600 mt-1">
              Comparando {items.length} producto{items.length !== 1 && 's'}
            </p>
          </div>
          <Button variant="outline" onClick={clearComparison}>
            Limpiar todo
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-4 bg-gray-50 border border-gray-200 sticky left-0 z-10">
                <span className="text-sm font-semibold text-gray-700">Característica</span>
              </th>
              {items.map((product) => (
                <th key={product.id} className="p-4 bg-white border border-gray-200 min-w-[250px]">
                  <div className="relative">
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFromComparison(product.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Product Image */}
                    <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-2xl font-bold text-primary-600">${product.price}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Specifications */}
            {specifications.map((spec, index) => (
              <tr key={index}>
                <td className="p-4 bg-gray-50 border border-gray-200 font-medium text-gray-700 sticky left-0 z-10">
                  {spec.key}
                </td>
                {items.map((product) => (
                  <td
                    key={product.id}
                    className="p-4 border border-gray-200 text-center text-gray-900"
                  >
                    {spec.getValue(product)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Tags */}
            <tr>
              <td className="p-4 bg-gray-50 border border-gray-200 font-medium text-gray-700 sticky left-0 z-10">
                Características
              </td>
              {items.map((product) => (
                <td key={product.id} className="p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(product.tags ?? []).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Featured */}
            <tr>
              <td className="p-4 bg-gray-50 border border-gray-200 font-medium text-gray-700 sticky left-0 z-10">
                Destacado
              </td>
              {items.map((product) => (
                <td key={product.id} className="p-4 border border-gray-200 text-center">
                  {product.featured ? (
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  ) : (
                    <Minus className="w-6 h-6 text-gray-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="p-4 bg-gray-50 border border-gray-200 font-medium text-gray-700 sticky left-0 z-10">
                Acción
              </td>
              {items.map((product) => (
                <td key={product.id} className="p-4 border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link href={`/products/${product.slug}`}>Ver Detalles</Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      Agregar al Carrito
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
