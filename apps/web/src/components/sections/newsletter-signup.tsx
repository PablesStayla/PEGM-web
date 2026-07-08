'use client';

import { Button, Label } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { Gift, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export function NewsletterSignup() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscribeToNewsletter({
        email,
        acceptsMarketing: true,
      });

      if (result.success) {
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (_error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative py-24 bg-prana-base-950 overflow-hidden section-divide-top">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 bg-mesh-forest opacity-30" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-prana-green-vibrant/10 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-prana-gold/5 rounded-full blur-3xl animate-glow" />
      </div>
      <motion.div
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-prana-gold/30 text-prana-gold text-[10px] font-black tracking-[0.3em] uppercase mb-8 shadow-xl">
          <Gift className="w-4 h-4 mr-3" /> {t('badge')}
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          {t('title')}
        </h2>
        <p className="text-xl text-prana-base-100/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          {t('subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <Label htmlFor="newsletter-email" className="sr-only">
            Email
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholder')}
                required
                className="w-full pl-12 pr-4 py-4 bg-white/5 text-white rounded-xl border border-white/10 focus:border-prana-gold focus:ring-1 focus:ring-prana-gold backdrop-blur-xl shadow-2xl transition-all placeholder:text-gray-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-luxury px-10 py-4 h-auto border-0 shadow-gold/20"
            >
              <span className="relative z-10">
                {submitted ? t('success') : isLoading ? '...' : t('cta')}
              </span>
            </Button>
          </div>
        </form>

        <p className="text-sm text-gray-400 mt-5">{t('noSpam')}</p>
      </motion.div>
    </section>
  );
}
