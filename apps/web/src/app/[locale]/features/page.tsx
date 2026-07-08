'use client';

import { Button, Card } from '@pranakaia/ui';
import { Bell, Box, Gift, MessageCircle, Share2, Sparkles, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: Share2,
      title: 'Compartir Productos',
      description:
        'Sistema avanzado de compartir en redes sociales con códigos QR, Web Share API y enlaces personalizados.',
      highlights: [
        'Compartir en WhatsApp, Facebook, Twitter, LinkedIn',
        'Generación automática de códigos QR',
        'Copy link con feedback visual',
        'Web Share API nativa del dispositivo',
      ],
      demo: '/products/1',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Sistema de Referidos',
      description:
        'Programa completo de referidos con códigos personalizados, dashboard de estadísticas y comisiones automáticas.',
      highlights: [
        'Códigos de referido únicos',
        'Dashboard con estadísticas en tiempo real',
        'Comisiones del 10% por cada compra',
        'Bonos por alcanzar metas',
      ],
      demo: '/account/referrals',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageCircle,
      title: 'Chat con IA',
      description:
        'Asistente virtual inteligente que responde preguntas, recomienda productos y ayuda en tiempo real.',
      highlights: [
        'Respuestas instantáneas 24/7',
        'Recomendaciones personalizadas',
        'Soporte en múltiples idiomas',
        'Aprende de cada interacción',
      ],
      demo: '#',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Bell,
      title: 'Notificaciones Push',
      description:
        'Sistema de notificaciones inteligentes para alertas de precio, stock y ofertas personalizadas.',
      highlights: [
        'Alertas de bajada de precio',
        'Notificaciones de stock disponible',
        'Ofertas exclusivas personalizadas',
        'Control total sobre preferencias',
      ],
      demo: '#',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Sparkles,
      title: 'Recomendaciones con IA',
      description:
        'Motor de recomendaciones inteligente que aprende de tus preferencias y comportamiento.',
      highlights: [
        'Personalización basada en IA',
        'Productos frecuentemente comprados juntos',
        'Completa tu look con sugerencias inteligentes',
        'Score de compatibilidad por producto',
      ],
      demo: '/products',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Box,
      title: 'Vista 360° de Productos',
      description:
        'Visualización interactiva en 360° con zoom avanzado y puntos de interés informativos.',
      highlights: [
        'Rotación 360° suave y fluida',
        'Zoom hasta 3x con detalles',
        'Puntos de interés interactivos',
        'Modo pantalla completa',
      ],
      demo: '/products/1',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-primary-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">State of the Art Technology</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Funcionalidades de
            <span className="bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {' '}
              Vanguardia
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            PranaKaia utiliza tecnología de última generación para ofrecerte la mejor experiencia de
            compra. Descubre las funcionalidades que nos hacen únicos.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Funcionalidades', value: '50+', icon: Sparkles },
              { label: 'Performance Score', value: '95+', icon: TrendingUp },
              { label: 'Usuarios Activos', value: '10K+', icon: Users },
              { label: 'Satisfacción', value: '98%', icon: Gift },
            ].map((stat) => (
              <Card key={stat.label} className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Gradient Header */}
                <div className={`bg-linear-to-r ${feature.color} p-6 text-white`}>
                  <feature.icon className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-4">{feature.description}</p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-6">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 text-sm">
                        <span className="text-primary-600 mt-0.5">✓</span>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Demo Button */}
                  <Link href={feature.demo}>
                    <Button className="w-full">Ver Demo</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-linear-to-r from-primary-600 to-secondary-600 text-white border-0">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              ¿Listo para experimentar el futuro del e-commerce?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Únete a miles de usuarios que ya disfrutan de estas increíbles funcionalidades
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="secondary">
                  Explorar Productos
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">PranaKaia vs Competencia</h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Funcionalidad
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary-600">
                      PranaKaia
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      Shopify
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      WooCommerce
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ['Chat con IA', true, false, false],
                    ['Vista 360° de Productos', true, 'Premium', false],
                    ['Sistema de Referidos', true, 'Premium', true],
                    ['Notificaciones Push', true, 'Premium', 'Plugin'],
                    ['Recomendaciones IA', true, 'Premium', false],
                    ['Compartir con QR', true, false, false],
                  ].map(([feature, pranakaia, shopify, woo]) => (
                    <tr key={feature as string}>
                      <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
                      <td className="px-6 py-4 text-center">
                        {pranakaia === true ? (
                          <span className="text-green-600 font-bold text-xl">✓</span>
                        ) : (
                          <span className="text-sm text-gray-600">{pranakaia}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {shopify === true ? (
                          <span className="text-green-600 font-bold text-xl">✓</span>
                        ) : shopify === false ? (
                          <span className="text-red-600 font-bold text-xl">✗</span>
                        ) : (
                          <span className="text-sm text-gray-600">{shopify}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {woo === true ? (
                          <span className="text-green-600 font-bold text-xl">✓</span>
                        ) : woo === false ? (
                          <span className="text-red-600 font-bold text-xl">✗</span>
                        ) : (
                          <span className="text-sm text-gray-600">{woo}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
