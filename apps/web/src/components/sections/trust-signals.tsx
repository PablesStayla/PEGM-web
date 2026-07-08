'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Shield, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export function TrustSignals() {
  const t = useTranslations('trust');

  const trustFeatures = [
    {
      icon: Shield,
      title: t('securePayment'),
      description: t('securePaymentDesc'),
    },
    {
      icon: Truck,
      title: t('shipping'),
      description: t('shippingDesc'),
    },
    {
      icon: Award,
      title: t('original'),
      description: t('originalDesc'),
    },
    {
      icon: CheckCircle,
      title: t('support'),
      description: t('supportDesc'),
    },
  ];

  return (
    <section className="relative py-16 bg-prana-base-950 overflow-hidden section-divide-top section-divide-bottom">
      {/* Background Mesh - Continuous flow */}
      <div className="absolute inset-0 bg-mesh-forest opacity-10" />

      {/* Subtle background glow */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-20">
        <div className="w-[800px] h-[50px] bg-prana-gold blur-[80px] rounded-full animate-glow" />
      </div>

      <div className="max-w-350 mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              variants={fadeInUp}
              className="flex items-start lg:items-center gap-5 group"
            >
              <div className="shrink-0 w-14 h-14 rounded-2xl glass-morphism border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-prana-gold/50 transition-all duration-500 shadow-xl group-hover:shadow-gold/20">
                <feature.icon className="h-6 w-6 text-prana-gold transition-colors duration-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 font-light">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
