'use client';

import { createClient } from '@pranakaia/auth/client';
import { Button, Checkbox, Input, Label, useToast } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Leaf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { registerUser } from '@/app/actions/register';

export function RegisterClient() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get('callbackUrl') ?? '/');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: 'Atención',
        description: 'Debes aceptar los términos y condiciones',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: formData.agreeToTerms,
      });

      if (!result.success) {
        toast({
          title: 'Error de Registro',
          description: result.error,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: '¡Bienvenido a PranaKaia!',
        description: 'Cuenta activada. Iniciando sesión...',
      });

      // Intentar login automático tras registro exitoso (ahora auto-confirmado)
      const { error: signInError } = await signInWithPassword(formData.email, formData.password);

      if (!signInError) {
        router.replace(callbackUrl);
        router.refresh();
      } else {
        console.error('[SIGNIN_ERROR]', signInError);
        router.replace(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
    } catch (error) {
      console.error('[REGISTRATION_UI_FATAL]', error);
      toast({
        title: 'Error Inesperado',
        description: 'Hubo un problema al crear tu cuenta. Intenta nuevamente.',
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

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#fdfaf6]">
      {/* Left Side - Ambient Image Panel */}
      <div className="hidden md:flex relative w-full md:w-1/2 lg:w-5/12 overflow-hidden bg-prana-green-dark items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=2000&auto=format&fit=crop"
          alt="Plantas indoor vibrantes"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-prana-green-dark via-prana-green-dark/80 to-transparent" />

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

          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight font-serif">
              Cultiva tu mejor versión.
            </h1>
            <p className="text-prana-luxury-700 text-lg lg:text-xl font-light leading-relaxed max-w-md">
              Únete a la familia de cultivadores más exclusiva de Chile. Accede a equipo premium,
              semillas de colección y atención experta.
            </p>
          </div>

          <div className="flex items-center gap-4 text-prana-gold-light">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-prana-green-dark bg-prana-green-light flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'
                    }
                    width={40}
                    height={40}
                    alt="User"
                    className="opacity-80 mix-blend-luminosity"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">+2,000 cultivadores unidos</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white">
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
          className="w-full max-w-lg"
        >
          <motion.div variants={itemVariants} className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Crear una cuenta</h2>
            <p className="text-gray-500">
              Ingresa tus datos para acceder a tu panel personalizado.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} data-testid="register-form" className="space-y-5">
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  Nombre
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  data-testid="register-first-name"
                  placeholder="Ej: Juan"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12 rounded-xl ${fieldErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-prana-green'}`}
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  data-testid="register-last-name"
                  placeholder="Ej: Pérez"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12 rounded-xl ${fieldErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-prana-green'}`}
                  autoComplete="family-name"
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Privado
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                data-testid="register-email"
                placeholder="tu@email.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12 rounded-xl ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-prana-green'}`}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Contraseña Segura
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  data-testid="register-password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12 rounded-xl pr-12 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-prana-green'}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-prana-green transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                data-testid="register-confirm-password"
                placeholder="Repite tu contraseña"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12 rounded-xl ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-prana-green'}`}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 pt-2 pb-4">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                data-testid="register-terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, agreeToTerms: !!checked }))
                }
                className="mt-1 data-[state=checked]:bg-prana-green data-[state=checked]:border-prana-green rounded"
              />
              <Label
                htmlFor="agreeToTerms"
                className="text-sm font-normal text-gray-600 leading-relaxed cursor-pointer"
              >
                He leído y acepto los{' '}
                <Link
                  href="/terms"
                  className="text-prana-green hover:text-prana-green-dark font-semibold transition-colors"
                >
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link
                  href="/privacy"
                  className="text-prana-green hover:text-prana-green-dark font-semibold transition-colors"
                >
                  Política de Privacidad
                </Link>
                .
              </Label>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                data-testid="register-submit"
                className="w-full bg-prana-green hover:bg-prana-green-dark text-white shadow-lg hover:shadow-xl transition-all h-14 rounded-xl text-lg font-medium group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Comenzar mi viaje
                    <ArrowRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-center text-gray-500 mt-8 pt-4 border-t border-gray-100"
            >
              ¿Ya eres miembro?{' '}
              <Link
                href="/login"
                className="font-semibold text-prana-gold hover:text-prana-gold-dark transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
