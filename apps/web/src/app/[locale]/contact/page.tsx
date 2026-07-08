'use client';

import { Button, Card, CardContent, Input, Label } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';

import { submitContactForm } from '@/app/actions/contact';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'contacto@pranakaia.com',
    href: 'mailto:contacto@pranakaia.com',
    description: 'Respondemos en menos de 24h',
  },
  {
    icon: Phone,
    title: 'Teléfono',
    value: '+56 9 1234 5678',
    href: 'tel:+56912345678',
    description: 'Lunes a Viernes, 9:00 - 18:00',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+56 9 1234 5678',
    href: 'https://wa.me/56912345678?text=Hola!%20Tengo%20una%20consulta%20sobre%20PranaKaia',
    description: 'Chat directo con nuestro equipo',
  },
  {
    icon: MapPin,
    title: 'Ubicación Central',
    value: 'Concepción, Región del Biobío, Chile',
    href: '#',
    description: 'Envíos express en toda la 8va Región',
  },
];

const faqItems = [
  {
    q: '¿Cuánto demora el envío?',
    a: 'Envíos dentro de Concepción en 12-24h. Regiones 2-4 días hábiles mediante Blue Express o Starken.',
  },
  {
    q: '¿Tienen garantía?',
    a: 'Todos nuestros productos tienen garantía de satisfacción de 30 días. Si no estás conforme, te devolvemos tu dinero.',
  },
  {
    q: '¿Puedo hacer una devolución?',
    a: 'Sí, aceptamos devoluciones dentro de los primeros 15 días desde la recepción del producto en su estado original.',
  },
  {
    q: '¿Ofrecen asesoría personalizada?',
    a: 'Sí, nuestro equipo de expertos puede ayudarte a elegir los productos ideales para tu proyecto. Contáctanos por WhatsApp.',
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');

    const result = await submitContactForm(formData);

    if (result.success) {
      setFormState('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormState('idle'), 4000);
    } else {
      setFormState('idle');
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-linear-to-br from-green-900 via-green-800 to-green-700 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-green-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-green-200 text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Estamos aquí para ayudarte
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contáctanos
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              ¿Tienes alguna pregunta sobre nuestros productos o necesitas asesoría personalizada?
              Nuestro equipo de expertos está listo para ayudarte.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative -mt-12 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((info, index) => (
            <motion.a
              key={info.title}
              href={info.href}
              target={info.href.startsWith('http') ? '_blank' : undefined}
              rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-transparent hover:border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4 group-hover:bg-green-200 transition-colors group-hover:scale-110 duration-300">
                    <info.icon className="w-6 h-6 text-green-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                  <p className="text-green-700 font-medium text-sm mb-1">{info.value}</p>
                  <p className="text-xs text-gray-500">{info.description}</p>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <div className="bg-linear-to-r from-green-700 to-green-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Envíanos un mensaje</h2>
                <p className="text-green-100 text-sm mt-1">
                  Completa el formulario y te responderemos lo antes posible
                </p>
              </div>
              <CardContent className="p-8">
                {formState === 'sent' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h3>
                    <p className="text-gray-600">
                      Te responderemos dentro de las próximas 24 horas.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto</Label>
                      <select
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecciona un tema</option>
                        <option value="products">Consulta sobre productos</option>
                        <option value="order">Estado de mi pedido</option>
                        <option value="shipping">Envíos y entregas</option>
                        <option value="returns">Devoluciones y garantía</option>
                        <option value="advice">Asesoría personalizada</option>
                        <option value="wholesale">Venta mayorista</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={formState === 'sending'}
                      className="w-full sm:w-auto min-w-50"
                      size="lg"
                    >
                      {formState === 'sending' ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Enviar Mensaje
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ + Hours */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Horarios de Atención</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Lunes a Viernes</span>
                    <span className="font-medium text-green-700">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sábado</span>
                    <span className="font-medium text-green-700">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Domingo</span>
                    <span className="font-medium text-red-500">Cerrado</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">
                    WhatsApp disponible 24/7 para consultas rápidas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preguntas Frecuentes</h3>
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <details
                    key={index}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 hover:text-green-700 transition-colors">
                      {item.q}
                      <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                        ▾
                      </span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/56912345678?text=Hola!%20Tengo%20una%20consulta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-linear-to-r from-green-500 to-green-600 rounded-2xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">¿Necesitas ayuda rápida?</p>
                <p className="text-green-100 text-sm">Chatea con nosotros por WhatsApp</p>
              </div>
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
