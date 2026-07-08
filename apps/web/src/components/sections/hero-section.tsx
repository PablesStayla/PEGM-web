'use client';

import { Button } from '@pranakaia/ui';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { BRANDING } from '@/config/branding';

export function HeroSection() {
  const t = useTranslations('hero');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-prana-base-950"
    >
      {/* Background — premium Mesh Gradient */}
      <motion.div className="absolute inset-0 bg-mesh-forest opacity-40" style={{ y }} />

      {/* Dynamic Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.35, 0.15],
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          className="absolute -top-[10%] -right-[5%] w-180 h-180 bg-prana-gold/15 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.25, 0.1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-[20%] -left-[10%] w-150 h-150 bg-prana-green-vibrant/5 rounded-full blur-[120px]"
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            filter: 'contrast(150%) brightness(100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-350 mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full min-h-[80vh] flex items-center">
        <div className="grid lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left — Copy */}
          <div className="lg:col-span-7">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#1a4d2e]/40 border border-prana-gold/40 text-prana-gold text-sm font-semibold mb-8 backdrop-blur-md shadow-lg shadow-[#1a4d2e]/20"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prana-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-prana-gold" />
              </div>
              <span className="tracking-wide">{t('badge')}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-none tracking-tight mb-8"
            >
              <span className="text-white drop-shadow-2xl">{t('headline').split('\n')[0]}</span>
              <br />
              <span className="text-gradient-gold drop-shadow-2xl">
                {t('headline').split('\n').slice(1).join(' ') ||
                  t('headline').split(' ').slice(1).join(' ')}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-prana-base-100/80 mb-12 max-w-xl leading-relaxed font-light"
            >
              {t('subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-5 mb-16"
            >
              <Button
                asChild
                size="lg"
                className="btn-luxury group text-lg px-12 py-8 h-auto border-0 text-white! shadow-gold/20"
              >
                <Link href="/products">
                  <span className="relative z-10 flex items-center">
                    {t('ctaPrimary')}
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-prana-gold/50 backdrop-blur-xl text-lg px-12 py-8 h-auto rounded-xl transition-all duration-700 font-semibold"
              >
                <Link href="/about">{t('ctaSecondary')}</Link>
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center gap-10 text-sm text-prana-base-100/60 font-medium"
            >
              {[
                { icon: Truck, text: t('trust1') },
                { icon: Shield, text: t('trust2') },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4 group">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-prana-gold/50 transition-colors duration-300">
                    <item.icon className="w-5 h-5 text-prana-gold" />
                  </div>
                  <span className="tracking-widest uppercase text-[10px]">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Product showcase (Floating visual) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-end items-center relative lg:col-span-5"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-125 h-125 bg-prana-gold/10 rounded-full blur-[100px] animate-glow" />
            </div>

            {/* Glass Card */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              className="relative glass-morphism-dark rounded-[3rem] p-8 w-full max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden group"
            >
              {/* Internal subtle glow */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

              <div className="aspect-square relative rounded-4xl overflow-hidden bg-prana-base-950 mb-10 border border-white/5 shadow-inner">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606573064379-3fb76f62bfa0?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-screen" />
                <div className="absolute inset-0 bg-linear-to-t from-prana-base-950 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-55 h-55 animate-float">
                    <Image
                      src={BRANDING.logo.icon}
                      alt={BRANDING.name}
                      fill
                      sizes="220px"
                      className="object-contain drop-shadow-[0_0_50px_rgba(197,160,89,0.4)] opacity-95 group-hover:scale-110 transition-transform duration-1000"
                      priority
                    />
                  </div>
                </div>
                {/* Product Badge */}
                <div className="absolute top-6 left-6 px-5 py-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-[10px] font-black text-prana-gold tracking-[0.3em] uppercase">
                  SOTA Selection
                </div>
              </div>

              <div className="space-y-6 px-2">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 rounded-full bg-prana-gold/10 text-prana-gold text-[10px] font-black tracking-[0.3em] uppercase border border-prana-gold/30">
                    Edición Limitada
                  </span>
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-prana-gold"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <title>Star</title>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-white text-3xl font-bold leading-tight mb-3">
                    Grow SOTA Kit 2026
                  </h3>
                  <p className="text-prana-base-100/50 text-base leading-relaxed font-light">
                    Ingeniería de cultivo avanzada para resultados profesionales en Concepción.
                  </p>
                </div>
                <div className="flex items-end justify-between pt-8 border-t border-white/10 mt-8">
                  <div>
                    <span className="block text-prana-base-100/30 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                      Inversión
                    </span>
                    <span className="text-prana-gold font-bold text-3xl">$249.990</span>
                  </div>
                  <Link
                    href="/products"
                    aria-label="Ver productos destacados"
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 hover:bg-prana-gold text-white hover:text-prana-base-950 transition-all duration-500 group border border-white/10 hover:border-prana-gold"
                  >
                    <ArrowRight className="w-6 h-6 group-hover:-rotate-45 transition-transform duration-500" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-prana-gold rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
