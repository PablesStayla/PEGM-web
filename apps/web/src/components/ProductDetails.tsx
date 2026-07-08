'use client';

import { Button } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { CheckCircle, Minus, Package, Plus, RefreshCw, Shield, Truck } from 'lucide-react';
import { useState } from 'react';
import { ComparisonButton } from '@/components/comparison/ComparisonButton';
import { ImageGallery } from '@/components/product/ImageGallery';
import { StockBadge } from '@/components/product/StockBadge';
import { type VariantOption, VariantSelector } from '@/components/product/VariantSelector';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { StarRating } from '@/components/reviews/StarRating';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { formatCLP, formatDiscount } from '@/lib/format';
import { useCartActions } from '@/store/selectors';
import type { Product } from '@/types';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: Readonly<ProductDetailsProps>) {
  const { addItem } = useCartActions();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'reviews'>(
    'description',
  );
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500 dark:text-gray-400">Producto no encontrado</p>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const averageRating = 4.6;
  const totalReviews = 0;
  const variantOptions: VariantOption[] = [];
  const maxQty = Math.min(product.stock ?? 10, 10);

  const tabs = [
    { key: 'description' as const, label: 'Descripción' },
    { key: 'specs' as const, label: 'Especificaciones' },
    { key: 'shipping' as const, label: 'Envío' },
    { key: 'reviews' as const, label: `Reseñas (${totalReviews})` },
  ];

  const trustBadges = [
    { icon: Shield, text: 'Pago 100% Seguro' },
    { icon: Truck, text: 'Envío gratis sobre $80.000 CLP' },
    { icon: RefreshCw, text: 'Devolución 30 días' },
    { icon: CheckCircle, text: 'Garantía de calidad' },
  ];

  return (
    <div className="flex flex-col space-y-12">
      {/* Top: Gallery + Info */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ImageGallery images={images?.filter(Boolean) as string[]} productName={product.name} />
        </motion.div>

        {/* Info */}
        <motion.div
          className="flex flex-col space-y-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Title & Rating */}
          <div className="space-y-4">
            <h1
              data-testid="product-name"
              className="text-4xl md:text-5xl font-bold tracking-tight text-gradient-gold pb-2"
            >
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-prana-gold/10 rounded-full border border-prana-gold/20 shadow-lg shadow-prana-gold/5">
                <StarRating rating={averageRating} size="sm" readonly />
                <span className="text-xs text-prana-gold font-black ml-1 uppercase tracking-widest">
                  {averageRating}
                </span>
              </div>
              <span className="text-xs text-prana-base-100/40 uppercase font-black tracking-widest">
                ({totalReviews} reseñas)
              </span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-[10px] text-prana-gold hover:text-white font-black uppercase tracking-[0.2em] transition-colors"
              >
                Leer Testimonios
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-white/5">
            <span
              data-testid="product-price"
              className="text-4xl font-bold text-prana-gold tracking-tighter shadow-gold/20"
            >
              {formatCLP(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-prana-base-100/30 line-through font-mono">
                  {formatCLP(product.originalPrice)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-prana-amber/10 text-prana-amber border border-prana-amber/30 animate-pulse">
                  -{formatDiscount(product.originalPrice, product.price)} OFF
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p
            data-testid="product-description"
            className="text-prana-base-100/60 leading-relaxed text-base italic"
          >
            "{product.description}"
          </p>

          {/* Stock & Meta */}
          <div className="flex flex-wrap items-center gap-4">
            <StockBadge stock={product.stock ?? 0} urgentThreshold={5} warningThreshold={20} />
            <span className="text-[10px] text-prana-base-100/30 font-black uppercase tracking-widest">
              Gremio: <strong className="text-prana-gold">{product.category}</strong>
            </span>
          </div>

          {/* Variants (if any) */}
          {variantOptions.length > 0 && (
            <VariantSelector
              options={variantOptions}
              selectedVariants={{}}
              onVariantChange={() => {}}
            />
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Cantidad:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                data-testid="quantity-decrease"
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                data-testid="product-quantity"
                className="px-4 py-2 font-semibold text-center min-w-[48px] border-x border-gray-300"
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                data-testid="quantity-increase"
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6">
            <Button
              onClick={handleAddToCart}
              disabled={(product.stock ?? 0) === 0}
              data-testid="add-to-cart-button"
              className="btn-luxury flex-1 h-14"
            >
              {addedToCart ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> ¡Añadido al Gremio!
                </span>
              ) : (product.stock ?? 0) === 0 ? (
                'Agotado'
              ) : (
                <span className="flex items-center gap-3">
                  <Package className="w-5 h-5" /> AGREGAR AL CARRITO
                </span>
              )}
            </Button>
            <div className="flex gap-2">
              <WishlistButton product={product} />
              <ComparisonButton product={product} />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
            {trustBadges.map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-prana-base-100/40"
              >
                <div className="p-1 px-1.5 bg-prana-gold/10 rounded-md border border-prana-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                  <badge.icon className="w-3.5 h-3.5 text-prana-gold shrink-0 italic" />
                </div>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs Section */}
      <div className="luxury-card p-1">
        <div className="border-b border-white/5 px-2">
          <nav className="flex gap-4 -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all duration-500 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-prana-gold text-prana-gold shadow-[0_4px_10px_rgba(212,175,55,0.1)]'
                    : 'border-transparent text-prana-base-100/30 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none text-prana-base-100/60"
            >
              <p className="text-lg leading-relaxed">{product.description}</p>
              <div className="mt-8 grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-prana-gold/5 border border-prana-gold/20 rounded-2xl shadow-xl shadow-gold/5">
                  <h4 className="text-xs font-black text-prana-gold uppercase tracking-[0.2em] mb-4">
                    Características de Elite
                  </h4>
                  <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-prana-gold/60">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-prana-gold" /> Producto 100% Orgánico
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-prana-gold" /> Calidad de Gremio
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-prana-gold" /> Resultados de
                      Campeonato
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">
                    Perfil Recomendado
                  </h4>
                  <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-prana-green-vibrant" /> Cultivadores
                      Premium
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-prana-green-vibrant" /> Entornos
                      Controlados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-prana-green-vibrant" /> Genéticas de
                      Autor
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Categoría', product.category || 'General'],
                      ['SKU', product.id?.slice(0, 8)?.toUpperCase() || 'N/A'],
                      ['Disponibilidad', (product.stock ?? 0) > 0 ? 'En stock' : 'Agotado'],
                      ['Tipo', '100% Orgánico'],
                      ['Origen', 'Chile'],
                    ].map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-3 font-medium text-gray-900">{label}</td>
                        <td className="px-6 py-3 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Truck,
                    title: 'Santiago',
                    time: '24-48 horas',
                    cost: 'Gratis sobre $100.000',
                  },
                  {
                    icon: Package,
                    title: 'Regiones',
                    time: '3-5 días hábiles',
                    cost: '$5.000 CLP',
                  },
                  { icon: RefreshCw, title: 'Devoluciones', time: '15 días', cost: 'Sin costo' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-5 border border-gray-200 rounded-xl text-center hover:border-green-300 transition-colors"
                  >
                    <item.icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.time}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">{item.cost}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReviewsList
                productId={product.id}
                reviews={[]}
                averageRating={averageRating}
                totalReviews={totalReviews}
                canReview={false}
                onSubmitReview={async () => {}}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
