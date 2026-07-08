'use client';

import { Card } from '@pranakaia/ui';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'Productos',
    questions: [
      {
        question: '¿Qué productos ofrecen en su Grow Shop?',
        answer:
          'Ofrecemos todo lo necesario para cultivo indoor: iluminación LED, carpas de cultivo, semillas feminizadas y autoflorecientes, nutrientes orgánicos, sustratos, sistemas de ventilación, medidores pH/EC y accesorios profesionales.',
      },
      {
        question: '¿Los productos incluyen garantía?',
        answer:
          'Sí, todos nuestros equipos de iluminación y ventilación incluyen garantía del fabricante de 1 a 3 años. Las semillas tienen garantía de germinación.',
      },
      {
        question: '¿Tienen productos para principiantes?',
        answer:
          'Absolutamente. Tenemos kits de inicio completos con carpa, luz, ventilación y nutrientes ideales para tu primer cultivo. Nuestro equipo te asesora gratis en todo el proceso.',
      },
    ],
  },
  {
    category: 'Envíos',
    questions: [
      {
        question: '¿Cuánto tiempo tarda el envío?',
        answer:
          'Los envíos dentro de la Región del Biobío (Concepción, Talcahuano, Chiguayante, San Pedro de la Paz) tardan entre 12-24 horas. Para el resto de Chile, entre 2-4 días hábiles.',
      },
      {
        question: '¿El envío es gratuito?',
        answer:
          'Ofrecemos envío gratuito en toda la intercomuna de Concepción por compras sobre $30.000. Para el resto del país, envío gratis sobre $60.000.',
      },
      {
        question: '¿Puedo rastrear mi pedido?',
        answer:
          'Sí, una vez que tu pedido sea enviado, recibirás un código de seguimiento por email para que puedas rastrear tu paquete en tiempo real.',
      },
    ],
  },
  {
    category: 'Pagos',
    questions: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer:
          'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), transferencias bancarias, y pagos a través de Mercado Pago. Todos los pagos son procesados de forma segura.',
      },
      {
        question: '¿Es seguro comprar en línea?',
        answer:
          'Completamente seguro. Utilizamos encriptación SSL de 256 bits y cumplimos con los estándares PCI DSS para proteger tu información financiera.',
      },
      {
        question: '¿Puedo pagar en cuotas?',
        answer:
          'Sí, ofrecemos la opción de pagar en cuotas sin interés con tarjetas de crédito participantes. Las opciones de cuotas se muestran durante el proceso de pago.',
      },
    ],
  },
  {
    category: 'Devoluciones',
    questions: [
      {
        question: '¿Cuál es su política de devoluciones?',
        answer:
          'Aceptamos devoluciones dentro de 30 días de la compra, siempre que el producto esté en condiciones originales y sin usar. Los gastos de envío de devolución corren por cuenta del cliente.',
      },
      {
        question: '¿Cómo inicio una devolución?',
        answer:
          'Puedes iniciar una devolución desde tu cuenta en "Mis Pedidos" o contactándonos directamente. Te proporcionaremos una etiqueta de envío prepagada.',
      },
      {
        question: '¿Cuándo recibo mi reembolso?',
        answer:
          'Una vez que recibamos y procesemos tu devolución, el reembolso se procesará en 5-10 días hábiles al método de pago original.',
      },
    ],
  },
  {
    category: 'Cuenta',
    questions: [
      {
        question: '¿Necesito crear una cuenta para comprar?',
        answer:
          'No es obligatorio, pero recomendamos crear una cuenta para un checkout más rápido, seguimiento de pedidos, y acceso a ofertas exclusivas.',
      },
      {
        question: '¿Cómo cambio mi contraseña?',
        answer:
          'Puedes cambiar tu contraseña desde tu perfil en "Configuración de Cuenta" o usar la opción "Olvidé mi contraseña" en el login.',
      },
      {
        question: '¿Puedo modificar mi dirección de envío?',
        answer:
          'Sí, puedes agregar, editar o eliminar direcciones de envío desde tu perfil. También puedes usar una dirección diferente durante el checkout.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Preguntas Frecuentes</h1>
          <p className="text-xl text-gray-400">
            Encuentra respuestas rápidas a las preguntas más comunes
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-linear-to-r from-[#1a4d2e] to-prana-gold" />
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((faq, index) => (
                  <Card
                    key={index}
                    className="p-0 overflow-hidden bg-[#161616] border-white/6 hover:border-white/12 transition-colors rounded-xl"
                  >
                    <details className="group">
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/2 transition-colors">
                        <h3 className="font-semibold text-gray-200 pr-4 group-open:text-prana-gold transition-colors">
                          {faq.question}
                        </h3>
                        <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180 group-open:text-prana-gold" />
                      </summary>

                      <div className="px-6 pb-6 pt-2">
                        <p className="text-gray-400 leading-relaxed border-l-2 border-[#1a4d2e] pl-4">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 rounded-2xl text-center bg-[#161616] border border-white/6 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#1a4d2e]/20 to-prana-gold/10 pointer-events-none" />
          <h2 className="text-2xl font-bold text-white mb-4 relative z-10">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="mb-8 text-gray-400 relative z-10 max-w-2xl mx-auto">
            Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta adicional sobre
            tus cultivos o nuestros productos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-[#1a4d2e] hover:bg-[#1a4d2e]/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contactar Soporte
            </a>
            <a
              href="mailto:info@pranakaia.com"
              className="inline-flex items-center justify-center bg-transparent border border-white/12 text-gray-300 hover:bg-white/6 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
