'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const AGE_GATE_KEYS = ['pk_age_verified', 'pk_age_ok'] as const;

function persistAgeGateCookies() {
  const date = new Date();
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const cookieName of AGE_GATE_KEYS) {
    // biome-ignore lint/suspicious/noDocumentCookie: Standard cookie setting for broad support
    document.cookie = `${cookieName}=true; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  }
}

export default function AgeVerificationPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const [rejected, setRejected] = useState(false);

  const handleConfirm = () => {
    persistAgeGateCookies();

    // Force a hard redirect to ensure the cookie is processed by Middleware
    window.location.href = from;
  };

  const handleReject = () => {
    setRejected(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[url('https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=2000')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #1a4d2e 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, #c5a059 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg mx-4 z-10"
      >
        <div className="bg-linear-to-b from-[#0a1f13] to-[#081c15] rounded-4xl border border-[#1a4d2e]/40 shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Accent Line */}
          <div className="h-1.5 bg-linear-to-r from-transparent via-prana-gold to-transparent" />

          <div className="p-10 sm:p-14 text-center">
            {/* Logo */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <div className="w-24 h-24 mx-auto bg-linear-to-br from-prana-green-dark to-black rounded-3xl p-5 shadow-2xl border border-prana-gold/20 flex items-center justify-center">
                <Image
                  src="/logos/pranakaia-icon-new.png"
                  alt="PranaKaia"
                  width={120}
                  height={120}
                  className="drop-shadow-2xl"
                />
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight font-serif">
              Portal de Acceso
            </h1>
            <p className="text-prana-gold text-lg font-medium mb-10">PranaKaia Official Store</p>

            {rejected ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 font-medium">
                    Protocolo de seguridad: Para navegar en esta plataforma debes ser mayor de 18
                    años.
                  </p>
                </div>
                <button
                  onClick={() => (window.location.href = 'https://google.com')}
                  className="w-full py-4 px-8 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Regresar
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-white/80 text-lg leading-relaxed">
                    Nuestros productos están destinados exclusivamente a adultos.
                  </p>
                  <p className="text-white/40 text-sm italic">
                    Al confirmar, declaras bajo juramento tener la edad legal requerida.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className="w-full py-5 px-8 rounded-2xl bg-linear-to-r from-prana-green-dark to-[#2d6a4f] text-white font-bold text-xl shadow-2xl shadow-prana-green-dark/40 hover:shadow-prana-green-dark/60 transition-all border border-prana-gold/30"
                  >
                    Soy mayor de 18 años
                  </motion.button>

                  <button
                    onClick={handleReject}
                    className="w-full py-4 px-8 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-sm hover:text-white/60 hover:bg-white/10 transition-all duration-300"
                  >
                    No tengo la edad requerida
                  </button>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-center gap-6">
                  <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest font-bold">
                    <span>Certificado</span>
                    <div className="w-1 h-1 rounded-full bg-prana-gold/50" />
                    <span>Seguro</span>
                    <div className="w-1 h-1 rounded-full bg-prana-gold/50" />
                    <span>Privado</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
