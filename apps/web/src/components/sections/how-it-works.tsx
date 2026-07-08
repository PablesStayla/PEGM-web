'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Truck, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' },
  }),
};

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      step: '01',
      icon: Sparkles,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      step: '02',
      icon: UserCheck,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      step: '03',
      icon: Truck,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
    {
      step: '04',
      icon: Leaf,
      title: t('step4Title'),
      description: t('step4Desc'),
    },
  ];

  return (
    <section className="py-28 bg-[#fafaf8] dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-150 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a4d2e]/03 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-350 mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="inline-block text-prana-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
            {t('tagline')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-[3.5rem] left-[12%] right-[12%] h-[1px] bg-linear-to-r from-transparent via-prana-gold/30 to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeInUp}
                className="text-center relative group"
              >
                {/* Step circle */}
                <div className="relative inline-flex items-center justify-center w-[4.5rem] h-[4.5rem] mb-8">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-[1.5rem] border border-prana-gold/20 group-hover:border-prana-gold/50 transition-colors duration-500" />
                  {/* Inner fill */}
                  <div className="absolute inset-[3px] rounded-[1.3rem] bg-linear-to-br from-[#081c15] to-[#1a4d2e] flex items-center justify-center shadow-[0_8px_30px_-5px_rgba(8,28,21,0.3)] group-hover:shadow-[0_8px_30px_-5px_rgba(197,160,89,0.2)] transition-shadow duration-500">
                    <Icon className="w-6 h-6 text-prana-gold" />
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-[#111] border-2 border-prana-gold/30 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-prana-gold tracking-widest">
                      {step.step}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-base font-light leading-relaxed max-w-[280px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
