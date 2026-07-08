'use client';

import { Button, Input, Label, useToast } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Leaf, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { signInWithMagicLink } from './actions';

const emailSchema = z.string().email('Email inválido').min(1, 'Email requerido');

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setJustRegistered(params.get('registered') === 'true');
  }, []);

  const validateEmail = (email: string): boolean => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors(result.error.errors.map((e) => e.message));
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.length > 0) {
      validateEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);

      const result = await signInWithMagicLink(formData);

      if (result.success) {
        setEmailSent(true);
        toast({
          title: '✉️ Enlace Sagrado Enviado',
          description: 'Revisa tu bandeja de entrada para acceder a tu cuenta.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error de validación',
          description: result.error || 'No se pudo enviar el enlace',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error Inesperado',
        description: 'Error de conexión. Intenta nuevamente más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (emailSent) {
    return (
      <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#fdfaf6]">
        <div className="w-full h-screen flex flex-col justify-center items-center p-6 bg-white bg-opacity-95">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(26,77,46,0.06)] border border-gray-100 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-prana-gold to-prana-green" />
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-prana-green-light/30 text-prana-green-dark mb-8 transform -rotate-6">
              <Mail className="h-10 w-10 rotate-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Revisa tu email</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Te hemos enviado un enlace mágico a <br />
              <strong className="text-prana-green-dark break-all">{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              Haz clic en el enlace seguro dentro del correo para iniciar sesión instantáneamente.
              Recuerda revisar tu carpeta de Spam.
            </p>
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full h-14 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              Ingresar un email diferente
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#fdfaf6]">
      {/* Left Side - Image Panel */}
      <div className="hidden md:flex relative w-full md:w-1/2 lg:w-5/12 overflow-hidden bg-prana-green-dark items-center justify-center order-2 md:order-1">
        <Image
          src="https://images.unsplash.com/photo-1604762524889-3e2fcc145683?q=80&w=2000&auto=format&fit=crop"
          alt="Atmósfera tranquila indoor"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-prana-green-dark via-prana-green-dark/60 to-transparent" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 p-12 lg:p-16 flex flex-col justify-end h-full w-full"
        >
          <div className="mb-auto mt-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-[-5px_5px_15px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-8 h-8 text-prana-gold-light" />
              </div>
              <span className="text-white text-2xl font-bold font-serif tracking-wide">
                PranaKaia
              </span>
            </Link>
          </div>

          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight font-serif">
              Tu jardín privado <br />
              te espera.
            </h1>
            <p className="text-prana-luxury-700 text-lg lg:text-xl font-light leading-relaxed max-w-md">
              Inicia sesión sin contraseñas engorrosas y retoma tus cultivos premium donde los
              dejaste.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white order-1 md:order-2">
        {/* Mobile Logo */}
        <div className="md:hidden w-full flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-prana-green p-2 rounded-xl shadow-md">
              <Leaf className="w-6 h-6 text-prana-gold" />
            </div>
            <span className="text-prana-green-dark text-xl font-bold font-serif">PranaKaia</span>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-serif">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-500 font-medium">
              Ingresa mediante Magic Link, rápido y extremadamente seguro.
            </p>
          </motion.div>

          {justRegistered && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid="registered-success-banner"
              className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 mb-6"
            >
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">¡Cuenta creada con éxito!</p>
                <p className="text-sm text-green-700 mt-0.5">
                  Ingresa tu email para recibir un Magic Link y acceder a tu cuenta.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium ml-1">
                Ingresa tu Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className={`h-5 w-5 ${errors.length > 0 ? 'text-red-400' : 'text-gray-400'}`}
                  />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  data-testid="login-email"
                  placeholder="ejemplo@correo.com"
                  className={`pl-11 h-14 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl text-[16px] ${
                    errors.length > 0
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-prana-green'
                  }`}
                />
              </div>
              {errors.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 ml-1 text-sm text-red-500 font-medium"
                >
                  {errors[0]}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                data-testid="login-submit"
                disabled={isLoading || !email || errors.length > 0}
                className="w-full bg-prana-green hover:bg-prana-green-dark text-white shadow-lg hover:shadow-[0_8px_30px_rgba(26,77,46,0.2)] transition-all duration-300 h-14 rounded-xl text-lg font-medium group disabled:opacity-60 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generando Magic Link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar al panel
                    <ArrowRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center pt-8 border-t border-gray-100"
            >
              <p className="text-gray-500">
                ¿Aún no tienes cuenta?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-prana-gold hover:text-prana-gold-dark transition-colors"
                >
                  Crea una aquí gratis
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
