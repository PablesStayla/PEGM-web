'use client';

import { Card } from '@pranakaia/ui';
import { Eye, Heart, Target } from 'lucide-react';

export function MissionVision() {
  const pillars = [
    {
      icon: Target,
      title: 'Nuestra Misión',
      subtitle: 'Excelencia a Través del Cultivo Consciente',
      content:
        'Ofrecer productos y accesorios de alta calidad para el cultivo y consumo responsable, siempre respetando la normativa vigente en cada país. Trabajamos con proveedores confiables y seleccionados bajo estrictos estándares de calidad, priorizando la transparencia, la legalidad y la confianza de nuestros clientes.',
      color: 'from-green-600 to-green-700',
    },
    {
      icon: Eye,
      title: 'Nuestra Visión',
      subtitle: 'Referentes Internacionales en la Industria',
      content:
        'Ser más que una tienda: buscamos ser un referente internacional en el mercado de accesorios, suplementos y productos derivados del cáñamo, promoviendo un estilo de vida consciente y sostenible que inspire cambios positivos en todo el mundo.',
      color: 'from-amber-600 to-orange-600',
    },
    {
      icon: Heart,
      title: 'Nuestro Propósito',
      subtitle: 'Cultivando el Potencial Humano',
      content:
        'Creemos en el poder de la naturaleza y en el valor de la cultura cannábica como un camino hacia el bienestar, la innovación y la responsabilidad. Cada cliente forma parte de una comunidad que valora la salud, el respeto y la evolución de la cultura cannábica en el mundo.',
      color: 'from-green-700 to-teal-700',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
            Nuestra Esencia
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Impulsados por el
            <span className="bg-linear-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {' '}
              Propósito
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nuestra misión, visión y propósito guían cada decisión, cada innovación y cada relación
            que cultivamos.
          </p>
        </div>

        {/* Mission Vision Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pillars.map((pillar, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all duration-500 border-0 shadow-lg dark:bg-gray-800 dark:shadow-gray-900/30 group"
            >
              <div
                className={`w-16 h-16 bg-linear-to-r ${pillar.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <pillar.icon className="h-8 w-8 text-white" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    {pillar.subtitle}
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{pillar.content}</p>
              </div>

              {/* Decorative element */}
              <div
                className={`absolute top-4 right-4 w-12 h-12 bg-linear-to-r ${pillar.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
              />
            </Card>
          ))}
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🌱</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sostenibilidad</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prácticas ecoconscientes que honran nuestro planeta
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🏆</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Excelencia</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estándares inquebrantables en todo lo que hacemos
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🤝</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Comunidad</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Construyendo conexiones significativas a nivel mundial
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🚀</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Innovación</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Empujando límites a través del avance científico
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-linear-to-r from-green-600 via-green-500 to-amber-500 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Sé Parte de Nuestra Misión</h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Únete a miles de cultivadores conscientes que están elevando la industria cannábica a
            través de la excelencia, la innovación y un compromiso inquebrantable con la calidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105">
              Comienza Tu Camino
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Saber Más
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
