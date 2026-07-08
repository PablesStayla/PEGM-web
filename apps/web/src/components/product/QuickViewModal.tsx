'use client';

import { Button } from '@pranakaia/ui';
import { Check, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ComparisonButton } from '@/components/comparison/ComparisonButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store';
import type { Product } from '@/types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCartStore();

  if (!product || !isOpen) {
    return null;
  }

  const images =
    product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg'];
  const tags = product.tags ?? [];

  const handleAddToCart = async () => {
    setIsAdding(true);
    addItem(product, quantity);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAdding(false);
    setTimeout(onClose, 1000);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar vista rapida"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vista rapida de ${product.name}`}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vista Rapida</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid md:grid-cols-2 gap-8 p-6">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={images[selectedImage] || '/placeholder-product.jpg'}
                    alt={`${product.name} imagen ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden bg-gray-100 transition-all',
                          selectedImage === index
                            ? 'ring-2 ring-primary-500'
                            : 'hover:ring-2 hover:ring-gray-300',
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} miniatura ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                  {product.featured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      Destacado
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>

                <div className="flex items-center gap-3 mb-6">
                  <p className="text-3xl font-semibold text-primary-600">
                    {formatPrice(product.price, 'CLP')}
                  </p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice, 'CLP')}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                        -
                        {Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100,
                        )}
                        %
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

                <div className="flex items-center gap-2 mb-6">
                  {(product.stock ?? 0) > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-700">
                        {product.stock ?? 0} disponibles
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-sm font-medium text-red-700">Agotado</span>
                    </>
                  )}
                </div>

                {(product.stock ?? 0) > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(event) => {
                          const next = Number.parseInt(event.target.value, 10);
                          if (Number.isNaN(next)) {
                            return;
                          }
                          setQuantity(Math.min(product.stock ?? 0, Math.max(1, next)));
                        }}
                        className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min={1}
                        max={product.stock ?? 0}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock ?? 0, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={(product.stock ?? 0) === 0 || isAdding}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isAdding ? (
                      <>
                        <Check className="w-5 h-5" />
                        Agregado
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Agregar al carrito
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <WishlistButton
                      product={product}
                      showLabel
                      className="justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    />
                    <ComparisonButton
                      product={product}
                      showLabel
                      className="justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    />
                  </div>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="text-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  onClick={onClose}
                >
                  Ver detalles completos
                </Link>

                {tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Caracteristicas</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
