'use client';

import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ImageGallery({ images, productName, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsLightboxOpen(false);
    }
  };

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Main Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 group border border-white/10 shadow-2xl">
          <Image
            src={images[currentIndex] || '/placeholder-product.jpg'}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />

          {/* Zoom Button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-6 right-6 p-3 bg-prana-gold/10 backdrop-blur-md rounded-full border border-prana-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-prana-gold/20"
            aria-label="Ver en tamaño completo"
          >
            <ZoomIn className="w-5 h-5 text-prana-gold" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white/10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white/10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white text-[10px] uppercase font-black tracking-widest">
              Activo {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden bg-white/5 transition-all duration-500 border',
                  currentIndex === index
                    ? 'border-prana-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0',
                )}
              >
                <Image
                  src={image}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 10vw, 20vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria ampliada de ${productName}`}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
            <Image
              src={images[currentIndex] || '/placeholder-product.jpg'}
              alt={`${productName} - Imagen ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
