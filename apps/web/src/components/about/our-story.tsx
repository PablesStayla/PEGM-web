'use client';

import { Card } from '@pranakaia/ui';

export function OurStory() {
  const milestones = [
    {
      year: '2026',
      title: 'El Gran Comienzo',
      description:
        'Lanzamiento oficial en Concepción, Chile. Nacemos con la visión de elevar el cultivo cannábico hacia un arte de creación consciente.',
      icon: '🌱',
    },
    {
      year: 'Liderazgo',
      title: 'Tecnología',
      description:
        'Incorporamos los estándares más altos en iluminación LED y nutrición orgánica para el cultivador exigente.',
      icon: '🚀',
    },
    {
      year: 'Comunidad',
      title: 'Red de Excelencia',
      description:
        'Construimos una comunidad en el Biobío y todo Chile, fomentando la innovación y el conocimiento compartido.',
      icon: '🌍',
    },
    {
      year: 'Futuro',
      title: 'Visión 2030',
      description:
        'Proyectamos el futuro de la cultura cannábica a través de la excelencia y un compromiso inquebrantable.',
      icon: '✨',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Nuestra Historia
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Un Legado de
            <span className="bg-linear-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {' '}
              Cultivo Consciente
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Desde sus humildes comienzos hasta el liderazgo global, nuestra historia es una de
            compromiso inquebrantable con la excelencia, la sostenibilidad y el poder transformador
            de la naturaleza.
          </p>
        </div>

        {/* Enhanced Story Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Story Text */}
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                En{' '}
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Prana Kaia Grow
                </span>{' '}
                creemos en el poder de la naturaleza y en el valor de la cultura cannábica como un
                camino hacia el bienestar, la innovación y la responsabilidad. Nuestra misión es
                ofrecer productos y accesorios de alta calidad para el cultivo y consumo
                responsable, siempre respetando la normativa vigente en cada país.
              </p>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Trabajamos con proveedores confiables y seleccionados bajo estrictos estándares de
                calidad, priorizando la transparencia, la legalidad y la confianza de nuestros
                clientes. Cada producto que ofrecemos refleja nuestra dedicación al cultivo
                responsable y a la excelencia.
              </p>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Queremos ser más que una tienda: buscamos ser un referente internacional en el
                mercado de accesorios, suplementos y productos derivados del cáñamo, promoviendo un
                estilo de vida consciente y sostenible que inspire a cultivadores de todo el mundo.
              </p>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Con Prana Kaia Grow, cada cliente forma parte de una comunidad que valora la salud,
                el respeto y la evolución de la cultura cannábica en el mundo. Juntos, cultivamos no
                solo plantas, sino el futuro de una vida consciente.
              </p>
            </div>

            {/* Key Values Callout */}
            <div className="bg-linear-to-r from-green-50 to-amber-50 dark:from-green-900/30 dark:to-amber-900/30 rounded-xl p-6 border border-green-100 dark:border-green-800">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">★</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nuestra Filosofía Central
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                La excelencia no es un logro, es un compromiso. Cada semilla que nutrimos, cada
                cultivador que empoderamos, cada cosecha que celebramos representa nuestra
                dedicación inquebrantable a cultivar la perfección.
              </p>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="aspect-square bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-2xl p-8 shadow-2xl">
              <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Central Icon */}
                <div className="text-center">
                  <div className="text-8xl mb-4">🌿</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Cultivando Excelencia
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Desde 2020</p>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-6 right-6 text-3xl animate-float">✨</div>
                <div
                  className="absolute bottom-6 left-6 text-3xl animate-float"
                  style={{ animationDelay: '2s' }}
                >
                  🌱
                </div>
                <div
                  className="absolute top-1/2 left-6 text-2xl animate-float"
                  style={{ animationDelay: '4s' }}
                >
                  🌟
                </div>
                <div
                  className="absolute bottom-1/2 right-6 text-2xl animate-float"
                  style={{ animationDelay: '6s' }}
                >
                  💚
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Milestones */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Nuestra Evolución
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 shadow-md dark:bg-gray-800 dark:shadow-gray-900/30"
              >
                <div className="text-4xl mb-4">{milestone.icon}</div>
                <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                  {milestone.year}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {milestone.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {milestone.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-linear-to-r from-green-600 to-amber-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Únete a Nuestro Legado</h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Sé parte de una comunidad que valora la excelencia, la innovación y el poder
            transformador del cultivo consciente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
              Explora Nuestra Historia
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 rounded-lg font-semibold transition-colors">
              Conoce al Equipo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
