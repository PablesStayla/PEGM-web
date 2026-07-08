'use client';

import { Button } from '@pranakaia/ui';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store';
import { useWishlistStore } from '@/store/wishlist';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  const { items, clearWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddAllToCart = () => {
    items.forEach((product) => {
      addItem(product, 1);
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6 relative">
            <Heart className="w-24 h-24 text-gray-300 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full animate-ping opacity-20" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tu lista de deseos estÃ¡ vacÃ­a</h2>
          <p className="text-gray-600 mb-8">
            Guarda los productos que te gustan para encontrarlos fÃ¡cilmente mÃ¡s tarde.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Lista de Deseos</h1>
              <p className="text-gray-600 mt-1">{items.length} productos guardados</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearWishlist} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Limpiar todo
            </Button>
            <Button variant="default" onClick={handleAddAllToCart} className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Agregar todo al carrito
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard key={product.id} product={product as any} />

            {/* Remove Button Overlay */}
            <button
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50 hover:text-red-600"
              aria-label="Quitar de favoritos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Share Wishlist */}
      <div className="mt-12 p-6 bg-linear-to-r from-primary-50 to-secondary-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Â¿Quieres compartir tu lista?</h3>
        <p className="text-gray-600 mb-4">Comparte tu lista de deseos con amigos y familia</p>
        <Button variant="outline">Generar enlace para compartir</Button>
      </div>
    </div>
  );
}
