'use client';

import { Button } from '@pranakaia/ui';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-primary-600">404</div>
          <div className="w-32 h-32 mx-auto bg-linear-to-br from-primary-600 to-secondary-600 rounded-full">
            <div className="flex h-full w-full items-center justify-center">
              <Search data-testid="search-icon" className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="text-base text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <p className="text-base text-gray-600">
          Verifica la URL o regresa al inicio para encontrar lo que necesitas.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" size="lg" aria-label="ir al inicio">
              <Home data-testid="home-icon" className="w-5 h-5" />
              <span>Ir al Inicio</span>
            </Button>
          </Link>

          <Link href="/products" className="block">
            <Button variant="outline" className="w-full" size="lg" aria-label="ver productos">
              <Search data-testid="search-icon" className="w-5 h-5" />
              <span>Ver Productos</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoBack}
            aria-label="volver atrás"
          >
            <ArrowLeft data-testid="arrow-left-icon" className="w-5 h-5" />
            <span>Volver Atrás</span>
          </Button>
        </div>

        {/* Help Links */}
        <div className="flex justify-center space-x-6">
          <p className="text-sm text-gray-600">¿Necesitas ayuda?</p>
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contacto
          </Link>
          <Link href="/faq" className="text-primary-600 hover:underline">
            FAQ
          </Link>
          <Link href="/support" className="text-primary-600 hover:underline">
            Soporte
          </Link>
        </div>
      </div>
    </div>
  );
}
