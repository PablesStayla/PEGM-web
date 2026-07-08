'use client';

import { Maximize2, Move, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Product360ViewerProps {
  images: string[];
  productName: string;
  className?: string;
}

export function Product360Viewer({ images, productName, className }: Product360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const frameCount = Math.max(images.length, 1);
  const currentImage = images[currentFrame % frameCount] || '/placeholder-product.jpg';
  const progressPercent = frameCount > 1 ? (currentFrame / frameCount) * 100 : 100;
  const rotationDegrees = frameCount > 1 ? Math.round((currentFrame / frameCount) * 360) : 0;

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || frameCount < 2) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate, frameCount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || frameCount < 2) {
      return;
    }

    const deltaX = e.clientX - startX;
    const sensitivity = 5;

    if (Math.abs(deltaX) > sensitivity) {
      const newFrame = (currentFrame + Math.sign(deltaX) + frameCount) % frameCount;
      setCurrentFrame(newFrame);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0]?.clientX || 0);
    setAutoRotate(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || frameCount < 2) {
      return;
    }

    const deltaX = (e.touches[0]?.clientX || 0) - startX;
    const sensitivity = 5;

    if (Math.abs(deltaX) > sensitivity) {
      const newFrame = (currentFrame + Math.sign(deltaX) + frameCount) % frameCount;
      setCurrentFrame(newFrame);
      setStartX(e.touches[0]?.clientX || 0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const handleReset = () => {
    setZoom(1);
    setCurrentFrame(0);
    setAutoRotate(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group',
        isFullscreen && 'bg-prana-dark-green',
        className,
      )}
    >
      {/* 360° Indicator */}
      <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-black/60 backdrop-blur-md border border-prana-gold/30 text-prana-gold text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
        <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
        VISIÓN DE GREMIO 360°
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={cn(
            'p-2.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white transition-all duration-300 hover:border-prana-gold hover:text-prana-gold',
            autoRotate &&
              'border-prana-gold text-prana-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]',
          )}
          title="Rotación automática"
        >
          <RotateCw className={cn('w-4 h-4', autoRotate && 'animate-spin')} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white transition-all duration-300 hover:border-prana-gold hover:text-prana-gold"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white transition-all duration-300 hover:border-prana-gold hover:text-prana-gold"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white transition-all duration-300 hover:border-prana-gold hover:text-prana-gold"
          title="Pantalla completa"
        >
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Image Container */}
      <div
        role="application"
        aria-label={`Visor 360 de ${productName}`}
        className={cn(
          'relative aspect-square cursor-grab active:cursor-grabbing select-none',
          isDragging && 'cursor-grabbing',
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* biome-ignore lint/performance/noImgElement: 360 viewer requires direct DOM manipulation via ref */}
        <img
          ref={imageRef}
          src={currentImage}
          alt={`${productName} - Vista 360° Frame ${currentFrame}`}
          className="w-full h-full object-contain transition-transform duration-150"
          style={{
            transform: `scale(${zoom})`,
          }}
          draggable={false}
        />

        {/* Drag Indicator */}
        {!isDragging && zoom === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white/60 px-6 py-3 rounded-full flex items-center gap-3 animate-pulse">
              <Move className="w-5 h-5 text-prana-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Orbitar Activo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1/2 z-10 space-y-3">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1.5">
          <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-prana-gold rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-prana-gold/60 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-prana-gold/10">
            {rotationDegrees}° Azimut
          </span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-3">
        <button
          onClick={handleReset}
          className="bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/30 text-white/40 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300"
        >
          Restaurar Cámara
        </button>
        {zoom !== 1 && (
          <div className="bg-prana-gold/20 backdrop-blur-md border border-prana-gold/30 text-prana-gold px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            Magnificación: {zoom.toFixed(2)}x
          </div>
        )}
      </div>
    </div>
  );
}
