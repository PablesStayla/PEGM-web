'use client';

import { Button } from '@pranakaia/ui';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  className?: string;
  variant?: 'default' | 'icon' | 'minimal';
}

export function ShareButton({
  productId,
  productName,
  productImage,
  productPrice,
  className,
  variant = 'default',
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/products/${productId}` : '';

  const handleQuickShare = async () => {
    // Si el navegador soporta Web Share API, usarla
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `¡Mira este producto increíble! ${productName}`,
          url: productUrl,
        });
      } catch (err) {
        // Si el usuario cancela, abrir modal normal
        if ((err as Error).name !== 'AbortError') {
          setIsModalOpen(true);
        }
      }
    } else {
      // Si no soporta Web Share API, abrir modal
      setIsModalOpen(true);
    }
  };

  // Copiado se maneja dentro de ShareModal

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickShare}
          className={cn('p-2', className)}
          aria-label="Compartir producto"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          productName={productName}
          productImage={productImage || '/placeholder-product.jpg'}
          productPrice={productPrice || 0}
          productUrl={productUrl}
        />
      </>
    );
  }

  if (variant === 'minimal') {
    return (
      <>
        <button
          onClick={handleQuickShare}
          className={cn(
            'flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors',
            className,
          )}
        >
          <Share2 className="w-4 h-4" />
          <span>Compartir</span>
        </button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          productName={productName}
          productImage={productImage || '/placeholder-product.jpg'}
          productPrice={productPrice || 0}
          productUrl={productUrl}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickShare}
        className={cn('gap-2', className)}
      >
        <Share2 className="w-4 h-4" />
        <span>Compartir</span>
      </Button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
        productImage={productImage || '/placeholder-product.jpg'}
        productPrice={productPrice || 0}
        productUrl={productUrl}
      />
    </>
  );
}
