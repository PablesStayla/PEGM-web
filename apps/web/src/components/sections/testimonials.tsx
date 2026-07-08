'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

export function Testimonials() {
  const testimonials = [
    {
      name: 'Diego Herrera',
      location: 'Santiago, Chile',
      rating: 5,
      text: 'Mi primer indoor y PranaKaia me asesoró de principio a fin. La carpa, las luces y los nutrientes llegaron perfecto. Cosecha increíble.',
      avatar: 'DH',
    },
    {
      name: 'Camila Soto',
      location: 'Valparaíso, Chile',
      rating: 5,
      text: 'Las semillas feminizadas germinaron al 100%. El equipo de PranaKaia sabe de cultivo y se nota en cada recomendación.',
      avatar: 'CS',
    },
    {
      name: 'Matías Rojas',
      location: 'Concepción, Chile',
      rating: 5,
      text: 'Productos originales, envío rápido y empaque discreto. El Spider Farmer LED que compré rinde exactamente lo que prometen.',
      avatar: 'MR',
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center px-4 py-1.5 bg-[#1a4d2e]/10 text-[#1a4d2e] dark:bg-[#1a4d2e]/30 dark:text-[#4ade80] rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-1.5 fill-current" /> +2.000 clientes satisfechos
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos en todo Chile
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={cardVariants}
              className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-prana-gold/20" />
              <div className="flex items-center mb-5">
                <div className="w-14 h-14 bg-linear-to-br from-[#1a4d2e] to-[#2d6a4f] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center mb-4 gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-prana-gold fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
