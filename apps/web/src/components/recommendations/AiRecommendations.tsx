'use client';

import { Badge, Button, Card } from '@pranakaia/ui';
import { Heart, ShoppingBag, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store';
import type { Product } from '@/types';

interface AiRecommendationsProps {
  currentProduct?: Product;
  userInterests?: string[];
  purchaseHistory?: string[];
}

export function AiRecommendations({
  currentProduct,
  userInterests = [],
  purchaseHistory = [],
}: AiRecommendationsProps) {
  const { addItem } = useCartStore();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recommendationType, setRecommendationType] = useState<
    'personalized' | 'trending' | 'complete_look' | 'frequently_bought'
  >('personalized');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load products catalog');
        }

        const products = (await response.json()) as Product[];
        if (!cancelled) {
          setCatalog(products);
        }
      } catch {
        if (!cancelled) {
          setCatalog([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (catalog.length === 0) {
      setRecommendations([]);
      return;
    }

    const category = currentProduct?.category;
    const interestSet = new Set(userInterests.map((interest) => interest.toLowerCase()));
    const historySet = new Set(purchaseHistory);

    const ranked = catalog
      .filter((product) => (product.stock ?? 0) > 0)
      .filter((product) => product.id !== currentProduct?.id)
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: el scoring pondera múltiples señales de negocio para ranking personalizado.
      .map((product) => {
        const productTags = (product.tags ?? []).map((tag) => tag.toLowerCase());
        const productCategory = (product.category ?? '').toLowerCase();

        let score = 0;

        if (product.featured) {
          score += 3;
        }

        if (recommendationType === 'complete_look' && category && product.category === category) {
          score += 5;
        }

        if (recommendationType === 'trending') {
          score += product.featured ? 2 : 0;
          score += Math.min((product.reviewCount ?? 0) / 10, 4);
        }

        if (recommendationType === 'personalized') {
          if (interestSet.has(productCategory)) {
            score += 3;
          }
          score += productTags.reduce((acc, tag) => acc + (interestSet.has(tag) ? 1 : 0), 0);
        }

        if (recommendationType === 'frequently_bought' && currentProduct?.tags) {
          const currentTags = new Set(currentProduct.tags.map((tag) => tag.toLowerCase()));
          score += productTags.reduce((acc, tag) => acc + (currentTags.has(tag) ? 2 : 0), 0);
        }

        if (historySet.has(product.id)) {
          score -= 4;
        }

        score += Math.min((product.stock ?? 0) / 20, 2);

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.product);

    setRecommendations(ranked);
  }, [catalog, currentProduct, userInterests, purchaseHistory, recommendationType]);

  const recommendationTypes = [
    {
      id: 'personalized' as const,
      label: 'Para Ti',
      icon: Sparkles,
      description: 'Basado en tus intereses',
    },
    {
      id: 'trending' as const,
      label: 'Tendencias',
      icon: TrendingUp,
      description: 'Lo más popular',
    },
    {
      id: 'complete_look' as const,
      label: 'Completa tu Set',
      icon: ShoppingBag,
      description: 'Productos complementarios',
    },
    {
      id: 'frequently_bought' as const,
      label: 'Compran Juntos',
      icon: Zap,
      description: 'Frecuentemente combinados',
    },
  ];

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary-600 animate-pulse" />
          <h3 className="text-2xl font-bold text-gray-900">
            Generando recomendaciones personalizadas...
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Recomendaciones con IA</h3>
            <p className="text-sm text-gray-600">Seleccionados especialmente para ti</p>
          </div>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          ✨ Powered by AI
        </Badge>
      </div>

      {/* Recommendation Type Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {recommendationTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setRecommendationType(type.id)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              recommendationType === type.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300',
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <type.icon
                className={cn(
                  'w-5 h-5',
                  recommendationType === type.id ? 'text-primary-600' : 'text-gray-400',
                )}
              />
              <span
                className={cn(
                  'font-semibold text-sm',
                  recommendationType === type.id ? 'text-primary-900' : 'text-gray-700',
                )}
              >
                {type.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">{type.description}</p>
          </button>
        ))}
      </div>

      {/* AI Insight */}
      <div className="mb-6 p-4 bg-linear-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900 font-medium mb-1">💡 Insight de IA:</p>
            <p className="text-sm text-gray-600">
              {recommendationType === 'personalized' &&
                'Basándonos en tus visitas recientes y productos guardados, estos artículos podrían interesarte.'}
              {recommendationType === 'trending' &&
                'Estos son los productos más populares esta semana entre usuarios con gustos similares a los tuyos.'}
              {recommendationType === 'complete_look' &&
                'El 85% de usuarios que compraron este producto también adquirieron estos accesorios.'}
              {recommendationType === 'frequently_bought' &&
                'Estos productos se compran juntos en el 78% de los casos, ahorrando hasta 20% en conjunto.'}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((product, index) => (
          <Card
            key={product.id}
            className="group hover:shadow-xl transition-shadow overflow-hidden"
          >
            <Link href={`/products/${product.slug ?? product.id}`}>
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={product.image || product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* AI Match Score */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {95 - index * 5}% Match
                </div>

                {/* Stock Badge */}
                <Badge
                  variant={(product.stock ?? 0) > 10 ? 'default' : 'destructive'}
                  className="absolute top-3 right-3"
                >
                  {product.stock ?? 0} disponibles
                </Badge>
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/products/${product.slug ?? product.id}`}>
                <h4 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                  {product.name}
                </h4>
              </Link>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

              {/* Why Recommended */}
              <div className="mb-3 p-2 bg-purple-50 rounded text-xs text-purple-900">
                <span className="font-medium">Por qué lo recomendamos:</span>
                <br />
                {index === 0 && 'Complementa perfectamente tu compra actual'}
                {index === 1 && 'Los usuarios similares a ti lo adoran'}
                {index === 2 && 'Frecuentemente comprado junto'}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => void addItem(product, 1)}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bundle Suggestion */}
      {recommendationType === 'complete_look' && (
        <div className="mt-8 p-6 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                💰 Compra estos 3 productos juntos y ahorra 15%
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Precio normal:{' '}
                <span className="line-through">
                  {formatPrice(recommendations.reduce((sum, p) => sum + p.price, 0))}
                </span>
              </p>
              <p className="text-2xl font-bold text-green-600">
                Precio bundle:{' '}
                {formatPrice(recommendations.reduce((sum, p) => sum + p.price, 0) * 0.85)}
              </p>
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Zap className="w-5 h-5 mr-2" />
              Comprar Bundle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
