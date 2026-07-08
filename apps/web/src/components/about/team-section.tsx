'use client';

import { Card } from '@pranakaia/ui';

export function TeamSection() {
  const team = [
    {
      name: 'Dra. Catalina Vergara',
      role: 'Directora Científica',
      specialty: 'Genética y Biotecnología del Cannabis',
      background:
        'Doctorado en Biotecnología Vegetal, ex investigadora líder en instituciones agrícolas de renombre en Chile.',
      image: 'CV',
      achievements: [
        'Más de 15 años en investigación cannábica',
        'Más de 50 publicaciones científicas revisadas por pares',
        'Titular de 3 patentes de innovación en cultivo',
      ],
    },
    {
      name: 'Martín Soto Fuentes',
      role: 'Jefe de Cultivo',
      specialty: 'Métodos de Cultivo Sostenible',
      background:
        'Cultivador experto con más de 20 años de experiencia en sistemas orgánicos e hidropónicos.',
      image: 'MS',
      achievements: [
        'Experto certificado en agricultura orgánica',
        'Consultor internacional de cultivo',
        'Cultivador premiado a nivel nacional',
      ],
    },
    {
      name: 'Dra. Sofía Muñoz Riquelme',
      role: 'Directora de Control de Calidad',
      specialty: 'Pruebas de Producto y Cumplimiento Normativo',
      background:
        'Ex especialista regulatoria con amplia experiencia en suplementos botánicos y normativa fitosanitaria.',
      image: 'SM',
      achievements: [
        'Experta en cumplimiento normativo',
        'Certificada en gestión de calidad',
        'Auditora de estándares internacionales',
      ],
    },
    {
      name: 'Felipe Araya González',
      role: 'Director de Comunidad',
      specialty: 'Educación y Apoyo al Cultivador',
      background:
        'Ex profesor universitario y organizador comunitario en educación cannábica en Latinoamérica.',
      image: 'FA',
      achievements: [
        'Fundador de 3 cooperativas de cultivadores',
        'Creador de contenido educativo',
        'Premiado por liderazgo comunitario',
      ],
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
            Equipo de Liderazgo
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Conoce a los
            <span className="bg-linear-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {' '}
              Expertos Detrás
            </span>
            <br />
            de Prana Kaia Grow
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nuestro diverso equipo combina décadas de experiencia científica, práctica en cultivo y
            una pasión compartida por avanzar la industria cannábica a través de la excelencia y la
            innovación.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {team.map((member, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-md dark:bg-gray-800 dark:shadow-gray-900/30 group"
            >
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="w-20 h-20 bg-linear-to-br from-green-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {member.image}
                  </div>
                </div>

                {/* Content */}
                <div className="grow">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                      {member.role}
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                      {member.specialty}
                    </p>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    {member.background}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Logros Destacados:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {member.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Team Philosophy */}
        <div className="bg-linear-to-r from-green-50 to-amber-50 dark:from-green-900/30 dark:to-amber-900/30 rounded-2xl p-8 md:p-12 text-center border border-green-100 dark:border-green-800">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Nuestra Experiencia Colectiva
          </h3>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-3xl mb-3">🔬</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Investigación Científica
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Experiencia a nivel doctoral en ciencia y genética del cannabis
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🌱</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cultivo Práctico</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Décadas de experiencia práctica en todos los métodos de cultivo
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📋</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Cumplimiento Normativo
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Profundo conocimiento de las regulaciones cannábicas globales
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">👥</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Construcción de Comunidad
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Apasionados por la educación y el desarrollo comunitario del cultivador
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Juntos, formamos un equipo de expertos dedicados a avanzar la industria cannábica a
            través del rigor científico, la sabiduría práctica y un compromiso inquebrantable con la
            excelencia.
          </p>
        </div>
      </div>
    </section>
  );
}
