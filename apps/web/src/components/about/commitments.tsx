'use client';

import { Card } from '@pranakaia/ui';
import { Award, CheckCircle, Globe, Heart, Leaf, Shield } from 'lucide-react';

export function Commitments() {
  const commitments = [
    {
      icon: Shield,
      title: 'Cumplimiento Normativo',
      description:
        'Operamos dentro de todas las leyes y regulaciones aplicables, manteniendo los más altos estándares de conducta legal y ética, siempre respetando la normativa vigente en cada país.',
      details: [
        'Cumplimiento total con regulaciones locales',
        'Auditorías legales periódicas',
        'Reportes transparentes',
        'Prácticas de abastecimiento ético',
      ],
    },
    {
      icon: Leaf,
      title: 'Responsabilidad Ambiental',
      description:
        'Nuestro compromiso con el planeta guía cada decisión, desde empaques sostenibles hasta operaciones con huella de carbono neutral.',
      details: [
        'Empaques 100% biodegradables',
        'Programa de compensación de carbono',
        'Prácticas de cultivo sostenible',
        'Iniciativas de conservación del agua',
      ],
    },
    {
      icon: Award,
      title: 'Control de Calidad',
      description:
        'Pruebas rigurosas y control de calidad aseguran que cada producto cumple con nuestros estrictos estándares de excelencia.',
      details: [
        'Pruebas en laboratorios certificados',
        'Procesos certificados ISO 9001',
        'Auditorías de calidad regulares',
        'Trazabilidad por lote',
      ],
    },
    {
      icon: Globe,
      title: 'Estándares Globales',
      description:
        'Nos apegamos a las mejores prácticas internacionales y elevamos continuamente el estándar de excelencia en la industria.',
      details: [
        'Cumplimiento GACP',
        'Certificación orgánica',
        'Alianzas de comercio justo',
        'Estándares internacionales de calidad',
      ],
    },
    {
      icon: Heart,
      title: 'Responsabilidad Comunitaria',
      description:
        'Contribuimos activamente a nuestras comunidades a través de educación, apoyo e impacto social positivo.',
      details: [
        'Programas de educación para cultivadores',
        'Promoción de la industria',
        'Alianzas comunitarias',
        'Iniciativas solidarias',
      ],
    },
    {
      icon: CheckCircle,
      title: 'Seguridad del Consumidor',
      description:
        'Tu seguridad y satisfacción son nuestras máximas prioridades, con pruebas exhaustivas y sistemas de soporte integral.',
      details: [
        'Pruebas de seguridad exhaustivas',
        'Guías de uso claras',
        'Soporte experto 24/7',
        'Garantía de satisfacción',
      ],
    },
  ];

  const certifications = [
    { name: 'Certificación Orgánica', status: 'Activa', color: 'bg-green-500' },
    { name: 'ISO 9001', status: 'Certificado', color: 'bg-blue-500' },
    { name: 'GACP', status: 'Verificado', color: 'bg-purple-500' },
    { name: 'Comercio Justo', status: 'Asociado', color: 'bg-amber-500' },
    { name: 'Carbono Neutral', status: 'Logrado', color: 'bg-green-600' },
    { name: 'Testeo en Lab', status: 'Requerido', color: 'bg-indigo-500' },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Nuestros Compromisos
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Excelencia a Través de la
            <span className="bg-linear-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {' '}
              Responsabilidad
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nuestros compromisos no son solo palabras: son acciones medibles que demuestran nuestra
            dedicación a la calidad, la sostenibilidad y las prácticas empresariales éticas.
          </p>
        </div>

        {/* Commitments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {commitments.map((commitment, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-xl transition-all duration-300 border-0 shadow-md dark:bg-gray-800 dark:shadow-gray-900/30 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition-colors">
                  <commitment.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {commitment.title}
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {commitment.description}
              </p>

              <ul className="space-y-2">
                {commitment.details.map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestras Certificaciones y Estándares
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Verificación independiente de nuestro compromiso con la excelencia y el cumplimiento
              de estándares globales.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 transition-colors group"
              >
                <div
                  className={`w-12 h-12 ${cert.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {cert.name}
                </h4>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {cert.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Statement */}
        <div className="mt-16 text-center">
          <div className="bg-linear-to-r from-green-600 to-amber-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Nuestra Promesa</h3>
            <p className="text-lg opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Cada producto que ofrecemos, cada alianza que formamos y cada decisión que tomamos
              refleja nuestro compromiso inquebrantable con la excelencia, la ética y el
              mejoramiento de la comunidad cannábica. No solo cumplimos estándares: los
              establecemos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                Ver Nuestros Estándares
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 rounded-lg font-semibold transition-colors">
                Contactar Equipo de Cumplimiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
