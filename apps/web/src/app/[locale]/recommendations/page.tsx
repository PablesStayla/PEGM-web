'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/store';
import type { Product } from '@/types';

interface Recommendation {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  score: number;
  reasons: string[];
  rank: number;
  category: string;
  aiConfidence: number;
  slug?: string;
  product: Product;
}

interface CatalogStats {
  total: number;
  featured: number;
  inStock: number;
  categories: number;
}

export default function RecommendationsPage() {
  const { addItem } = useCartStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogStats, setCatalogStats] = useState<CatalogStats>({
    total: 0,
    featured: 0,
    inStock: 0,
    categories: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('No fue posible cargar el catalogo');
        }

        const products = (await response.json()) as Product[];

        const inStock = products.filter((product) => (product.stock ?? 0) > 0);
        const rankedProducts = [...inStock]
          .sort((a, b) => {
            const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
            if (featuredDelta !== 0) {
              return featuredDelta;
            }

            const reviewDelta = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
            if (reviewDelta !== 0) {
              return reviewDelta;
            }

            return (b.stock ?? 0) - (a.stock ?? 0);
          })
          .slice(0, 5);

        const mappedRecommendations = rankedProducts.map((product, index) => {
          const score = Math.max(
            0.55,
            Math.min(
              0.98,
              0.55 +
                (product.featured ? 0.18 : 0) +
                Math.min((product.reviewCount ?? 0) / 200, 0.15) +
                Math.min((product.stock ?? 0) / 500, 0.1),
            ),
          );

          const reasons = [
            product.featured
              ? 'Marcado como destacado en el catalogo actual'
              : 'Alta disponibilidad en inventario',
            (product.reviewCount ?? 0) > 0
              ? `${product.reviewCount} resenas registradas`
              : 'Producto con buena disponibilidad para compra inmediata',
            product.category
              ? `Categoria: ${product.category}`
              : 'Seleccionado por senales de demanda y stock',
          ];

          return {
            id: `rec-${product.id}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image || product.images?.[0],
            score,
            reasons,
            rank: index + 1,
            category: product.category ?? 'Sin categoria',
            aiConfidence: Math.min(0.99, score + 0.03),
            slug: product.slug,
            product,
          } satisfies Recommendation;
        });

        const categories = new Set(
          products
            .map((product) => product.category)
            .filter((category): category is string => Boolean(category)),
        );

        if (!cancelled) {
          setRecommendations(mappedRecommendations);
          setCatalogStats({
            total: products.length,
            featured: products.filter((product) => product.featured).length,
            inStock: inStock.length,
            categories: categories.size,
          });
        }
      } catch {
        if (!cancelled) {
          setRecommendations([]);
          setCatalogStats({ total: 0, featured: 0, inStock: 0, categories: 0 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, []);

  const averageConfidence = useMemo(() => {
    if (recommendations.length === 0) {
      return 0;
    }

    const total = recommendations.reduce(
      (acc, recommendation) => acc + recommendation.aiConfidence,
      0,
    );
    return Math.round((total / recommendations.length) * 100);
  }, [recommendations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="text-6xl mb-4">🧠</div>
            <div className="text-xl font-semibold text-slate-900 mb-2">
              Analizando catalogo en tiempo real
            </div>
            <div className="text-slate-600 mb-4">
              Cargando productos y generando recomendaciones actualizadas...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Recomendaciones Inteligentes</h1>
        <p className="text-xl text-slate-600 mb-6">
          Sugerencias calculadas sobre datos reales de catalogo, stock y senales de demanda.
        </p>

        <div className="bg-linear-to-r from-blue-50 to-emerald-50 p-6 rounded-xl mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen de catalogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">Productos</h3>
              <p className="text-slate-600 text-sm">{catalogStats.total}</p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-1">Destacados</h3>
              <p className="text-slate-600 text-sm">{catalogStats.featured}</p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-1">En stock</h3>
              <p className="text-slate-600 text-sm">{catalogStats.inStock}</p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-1">Categorias</h3>
              <p className="text-slate-600 text-sm">{catalogStats.categories}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-900">Items priorizados</div>
          <div className="text-lg font-bold text-blue-600">{recommendations.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-900">Cobertura de stock</div>
          <div className="text-lg font-bold text-green-600">
            {catalogStats.total > 0
              ? `${Math.round((catalogStats.inStock / catalogStats.total) * 100)}%`
              : '0%'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-900">Confianza media</div>
          <div className="text-lg font-bold text-violet-600">{averageConfidence}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-900">Revision</div>
          <div className="text-lg font-bold text-amber-600">En vivo</div>
        </div>
      </div>

      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-600">
            No hay recomendaciones disponibles en este momento.
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      #{recommendation.rank}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="relative w-24 h-24 bg-linear-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {recommendation.imageUrl ? (
                        <Image
                          src={recommendation.imageUrl}
                          alt={recommendation.name}
                          fill
                          sizes="96px"
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {recommendation.name}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                          ${recommendation.price.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {recommendation.category}
                      </span>
                      <span className="text-sm text-slate-600">
                        Confianza: {Math.round(recommendation.aiConfidence * 100)}%
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-600 mr-2">Score:</span>
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.round(recommendation.score * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-slate-900 mb-2">Motivos de recomendacion</h4>
                      <ul className="space-y-1">
                        {recommendation.reasons.map((reason) => (
                          <li key={reason} className="text-sm text-slate-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        onClick={() => void addItem(recommendation.product, 1)}
                      >
                        Agregar al carrito
                      </button>
                      <a
                        href={`/products/${recommendation.slug ?? recommendation.productId}`}
                        className="border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Ver detalles
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
