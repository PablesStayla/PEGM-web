'use client';

import { Card } from '@pranakaia/ui';
import { Award, Heart, Leaf, Shield, Sparkles, Users } from 'lucide-react';

export function ValuesSection() {
  const values = [
    {
      icon: Leaf,
      title: 'Excelencia Natural',
      description:
        'Honramos la pureza y el poder de la naturaleza, seleccionando solo los mejores nutrientes orgánicos, genética premium y prácticas sostenibles que respetan nuestro planeta.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      icon: Shield,
      title: 'Innovación Responsable',
      description:
        'Cada innovación que llevamos al mercado está fundamentada en ciencia rigurosa, prácticas éticas y un profundo compromiso con la seguridad del consumidor y el cumplimiento normativo.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      icon: Users,
      title: 'Comunidad Primero',
      description:
        'Construimos puentes, no barreras. Nuestro éxito no se mide solo en ganancias, sino en la fortaleza de la comunidad que nutrimos y las vidas que tocamos.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      icon: Award,
      title: 'Calidad Inquebrantable',
      description:
        'Desde la semilla hasta la cosecha, mantenemos los más altos estándares de excelencia. La calidad no es negociable: es nuestra promesa hacia ti y hacia nuestro planeta.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      icon: Sparkles,
      title: 'Avance Científico',
      description:
        'Empujamos los límites de la ciencia cannábica, invirtiendo en investigación y desarrollo que avanza la industria y beneficia a cultivadores en todo el mundo.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      icon: Heart,
      title: 'Vida Consciente',
      description:
        'Creemos en el poder transformador del cultivo consciente como un camino hacia el bienestar, la atención plena y una conexión más profunda con la naturaleza.',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/30',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Nuestros Valores
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Principios Que Nos
            <span className="bg-linear-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {' '}
              Guían
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nuestros valores no son solo palabras: son el fundamento de cada decisión que tomamos,
            cada producto que creamos y cada relación que cultivamos.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-md dark:bg-gray-800 dark:shadow-gray-900/30 group"
            >
              <div
                className={`w-16 h-16 ${value.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <value.icon className={`h-8 w-8 ${value.color}`} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {value.description}
              </p>

              {/* Decorative element */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-linear-to-r from-green-400 to-amber-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* Values Statement */}
        <div className="bg-linear-to-r from-green-50 to-amber-50 dark:from-green-900/30 dark:to-amber-900/30 rounded-2xl p-8 md:p-12 border border-green-100 dark:border-green-800">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Viviendo Nuestros Valores Cada Día
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Impacto Global</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Prácticas sostenibles que benefician a nuestro planeta y comunidades en todo el
                  mundo
                </p>
              </div>
              <div>
                <div className="text-3xl mb-3">🔬</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Excelencia Científica
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Investigación y pruebas rigurosas aseguran los más altos estándares de calidad
                </p>
              </div>
              <div>
                <div className="text-3xl mb-3">💚</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Liderazgo Ético
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Liderando con el ejemplo a través de la integridad, transparencia y
                  responsabilidad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
