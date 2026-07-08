'use client';

import { Button } from '@pranakaia/ui';
import { BookOpen, Calendar, MessageCircle, Users } from 'lucide-react';

export function JoinCommunity() {
  const communityFeatures = [
    {
      icon: Users,
      title: 'Red de Cultivadores',
      description:
        'Conéctate con otros cultivadores, comparte experiencias y aprende de los mejores de la industria.',
      benefits: [
        'Mentoría experta',
        'Apoyo entre pares',
        'Intercambio de conocimientos',
        'Oportunidades de networking',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Soporte Especializado',
      description:
        'Recibe asesoría personalizada de nuestro equipo de especialistas en cultivo y veteranos de la industria.',
      benefits: [
        'Chat de soporte 24/7',
        'Consultas por video',
        'Orientación técnica',
        'Solución de problemas',
      ],
    },
    {
      icon: BookOpen,
      title: 'Recursos Educativos',
      description:
        'Accede a nuestra completa biblioteca de guías, tutoriales y contenido educativo.',
      benefits: ['Video tutoriales', 'Guías de cultivo', 'Mejores prácticas', 'Técnicas avanzadas'],
    },
    {
      icon: Calendar,
      title: 'Eventos y Talleres',
      description:
        'Únete a eventos exclusivos, talleres y masterclasses con líderes de la industria.',
      benefits: [
        'Talleres en vivo',
        'Webinars',
        'Eventos de networking',
        'Programas de certificación',
      ],
    },
  ];

  return (
    <section className="py-20 bg-linear-to-br from-green-900 via-green-800 to-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Únete a Nuestra
            <span className="bg-linear-to-r from-green-300 to-amber-300 bg-clip-text text-transparent">
              {' '}
              Comunidad
            </span>
          </h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Sé parte de una red mundial de cultivadores conscientes que comparten tu pasión por la
            excelencia, la innovación y el poder transformador del cultivo cannábico.
          </p>
        </div>

        {/* Community Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {communityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="grow">
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-green-100 mb-4 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-green-200 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-300 mb-2">25K+</div>
            <div className="text-green-100">Miembros Activos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-300 mb-2">500+</div>
            <div className="text-green-100">Eventos Mensuales</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-300 mb-2">50+</div>
            <div className="text-green-100">Países</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-300 mb-2">4.9/5</div>
            <div className="text-green-100">Calificación de la Comunidad</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            ¿Listo para Elevar tu Experiencia de Cultivo?
          </h3>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de cultivadores que han transformado su práctica con Prana Kaia Grow.
            Accede a recursos premium, guía experta y una comunidad de apoyo, todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Únete a Nuestra Comunidad
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 text-lg px-8 py-4 h-auto font-semibold"
            >
              Agendar Consulta
            </Button>
          </div>

          <p className="text-sm text-green-200 mt-6">
            🌱 Únete hoy y obtén tu primer mes de recursos premium GRATIS
          </p>
        </div>

        {/* Final Message */}
        <div className="text-center mt-16">
          <p className="text-xl text-green-100 max-w-4xl mx-auto leading-relaxed">
            <span className="font-semibold text-white">Prana Kaia Grow</span> es más que una
            empresa: es un movimiento. Un colectivo de visionarios, científicos y cultivadores
            unidos en nuestro compromiso de elevar el arte y la ciencia del cultivo cannábico hacia
            nuevas alturas de excelencia.
          </p>
          <div className="mt-8">
            <div className="inline-flex items-center px-6 py-3 bg-green-600 rounded-full text-white font-medium">
              <span className="mr-2">🌿</span>
              Bienvenido al Futuro del Cultivo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
