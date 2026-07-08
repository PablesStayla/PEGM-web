'use client';

import { Button } from '@pranakaia/ui';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-green-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-xl animate-float dark:bg-green-900/30" />
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-amber-200/20 rounded-full blur-xl animate-float dark:bg-amber-900/20"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Cultivo Consciente &amp; Responsable
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-linear-to-r from-green-700 via-green-600 to-amber-600 bg-clip-text text-transparent">
                Naturaleza,
              </span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">Bienestar e Innovación</span>
            </h1>

            {/* Description — texto real de la empresa */}
            <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed space-y-4 max-w-2xl">
              <p>
                En{' '}
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Prana Kaia Grow
                </span>{' '}
                creemos en el poder de la naturaleza y en el valor de la cultura cannábica como un
                camino hacia el{' '}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  bienestar, la innovación y la responsabilidad
                </span>
                .
              </p>
              <p>
                Nuestra misión es ofrecer productos y accesorios de alta calidad para el cultivo y
                consumo responsable, siempre respetando la normativa vigente en cada país.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="btn-prana-primary text-lg px-8 py-4">
                <Link href="/products">Ver Productos</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 text-lg px-8 py-4"
              >
                <Link href="/guides">Guías de Cultivo</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 mt-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-500 rounded-full mr-2 shrink-0" />
                <span>100% Orgánico y Sostenible</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-amber-500 rounded-full mr-2 shrink-0" />
                <span>Cumplimiento Legal</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full mr-2 shrink-0" />
                <span>Envíos a Latinoamérica y Europa</span>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-linear-to-br from-green-100 to-amber-100 dark:from-green-900/30 dark:to-amber-900/20 rounded-3xl" />
              <div className="absolute inset-4 bg-linear-to-tl from-green-200/50 to-transparent dark:from-green-800/30 rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">🌱</div>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                    Prana Kaia Grow
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Cultivo Consciente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
