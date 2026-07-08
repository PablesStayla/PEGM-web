'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const AGE_GATE_KEYS = ['pk_age_verified', 'pk_age_ok'] as const;

function hasAgeGateCookie() {
  return AGE_GATE_KEYS.some((cookieName) =>
    document.cookie.split('; ').some((row) => row.startsWith(`${cookieName}=true`)),
  );
}

function persistAgeGateCookies() {
  const date = new Date();
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const cookieName of AGE_GATE_KEYS) {
    // biome-ignore lint/suspicious/noDocumentCookie: compat fallback for browsers
    document.cookie = `${cookieName}=true; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  }
}

export function AgeGate() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    // 1. Skip if on the dedicated verification page
    if (pathname?.includes('age-verification')) {
      setShow(false);
      document.body.style.overflow = '';
      return;
    }

    const verified = hasAgeGateCookie();
    if (!verified) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [pathname]);

  const handleConfirm = () => {
    persistAgeGateCookies();

    setShow(false);
    document.body.style.overflow = '';
  };

  const handleReject = () => {
    setRejected(true);
  };

  if (!show) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-xl"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
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
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Card */}
          <div className="bg-linear-to-b from-[#0a1f13] to-[#081c15] rounded-3xl border border-[#1a4d2e]/40 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Top accent line */}
            <div className="h-1 bg-linear-to-r from-transparent via-[#c5a059] to-transparent" />

            <div className="p-8 sm:p-10 text-center">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <Image
                  src="/logos/pranakaia-icon-new.png"
                  alt="PranaKaia"
                  width={80}
                  height={80}
                  className="mx-auto drop-shadow-2xl"
                />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Verificación de Edad
              </h2>
              <p className="text-prana-gold text-sm font-medium mb-6">PranaKaia Grow Shop</p>

              {rejected ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm font-medium">
                      Lo sentimos, debes ser mayor de 18 años para acceder a este sitio.
                    </p>
                  </div>
                  <button
                    onClick={() => (window.location.href = 'https://google.com')}
                    className="w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all duration-200"
                  >
                    Salir del sitio
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Message */}
                  <div className="mb-8 space-y-2">
                    <p className="text-white/80 text-sm leading-relaxed">
                      Este sitio vende productos para cultivo indoor y está destinado a personas
                      mayores de 18 años.
                    </p>
                    <p className="text-white/50 text-xs">
                      Al hacer clic en "Soy mayor de 18" confirmas que cumples con la edad legal
                      requerida.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-[#1a4d2e] to-[#2d6a4f] text-white font-semibold text-sm shadow-lg shadow-[#1a4d2e]/30 hover:shadow-xl hover:shadow-[#1a4d2e]/40 transition-all duration-300 border border-[#2d6a4f]/50"
                    >
                      Soy mayor de 18 años
                    </motion.button>
                    <button
                      onClick={handleReject}
                      className="w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all duration-200"
                    >
                      No, soy menor de edad
                    </button>
                  </div>

                  {/* Legal */}
                  <p className="mt-6 text-white/30 text-[10px] leading-relaxed">
                    Al ingresar aceptas nuestros{' '}
                    <span className="text-prana-gold/60 underline">Términos de Servicio</span> y{' '}
                    <span className="text-prana-gold/60 underline">Política de Privacidad</span>.
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
