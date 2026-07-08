'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginAction } from '@pranakaia/auth/actions';
import { type AdminLoginInput, AdminLoginSchema } from '@pranakaia/domain';
import { Button, Input, useToast } from '@pranakaia/ui';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

interface LoginFormProps {
  initialEmail?: string;
  initialError?: string | null;
}

interface CookieStoreLike {
  set: (options: {
    name: string;
    value: string;
    path?: string;
    expires?: number | Date;
    sameSite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
  }) => Promise<void>;
}

async function setLocalBypassCookie(): Promise<void> {
  const browserWindow = window as Window & { cookieStore?: CookieStoreLike };

  if (!browserWindow.cookieStore) {
    throw new Error('Cookie Store API no disponible en este navegador');
  }

  await browserWindow.cookieStore.set({
    name: 'pk-admin-local',
    value: 'true',
    path: '/',
    expires: Date.now() + 60 * 60 * 1000,
    sameSite: 'lax',
  });
}

export function LoginForm({ initialEmail = '', initialError = null }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(initialError);

  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: initialEmail,
      password: '',
    },
  });

  const onFormSubmit = (data: AdminLoginInput) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await adminLoginAction(data);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        if (result.mfaRequired) {
          toast({
            title: 'Paso Adicional Requerido',
            description: 'Tu cuenta tiene MFA activo. Por favor, ingresa tu código.',
          });
          router.push('/login/mfa');
          return;
        }

        toast({
          title: 'Acceso Concedido',
          description: 'Sincronizando sesión de infraestructura...',
        });

        router.push('/');
        router.refresh();
      } catch (_e) {
        setServerError('Fallo en la comunicación con el servidor SafeAction.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6" noValidate>
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#14b8a6]/80"
        >
          Identificador de Usuario (Staff)
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Mail className="h-4 w-4 text-gray-500 transition-colors group-focus-within:text-[#14b8a6]" />
          </div>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={isPending}
            placeholder="admin@pranakaia.com"
            className={`h-14 rounded-2xl border-white/5 bg-white/[0.03] pl-11 text-white placeholder-gray-600 backdrop-blur-sm transition-all focus:border-[#14b8a6]/30 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#14b8a6]/10 ${
              errors.email ? 'border-red-500/50' : ''
            }`}
          />
        </div>
        {errors.email && (
          <p className="ml-1 text-[10px] font-medium text-red-400/80">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#14b8a6]/80"
        >
          Clave de Acceso SafeAction
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Lock className="h-4 w-4 text-gray-500 transition-colors group-focus-within:text-[#14b8a6]" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            disabled={isPending}
            placeholder="••••••••••••"
            className={`h-14 rounded-2xl border-white/5 bg-white/[0.03] pl-11 pr-12 text-white placeholder-gray-600 backdrop-blur-sm transition-all focus:border-[#14b8a6]/30 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#14b8a6]/10 ${
              errors.password ? 'border-red-500/50' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#14b8a6] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="ml-1 text-[10px] font-medium text-red-400/80">{errors.password.message}</p>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs font-medium text-red-300/90 leading-relaxed text-left">
            {serverError}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="premium"
        disabled={isPending}
        className="h-14 w-full rounded-2xl text-base shadow-2xl transition-all hover:scale-[1.01]"
      >
        {isPending ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#0a0a0a]" />
            <span className="tracking-wide">Verificando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="tracking-wide uppercase">Identificarse</span>
          </div>
        )}
      </Button>

      {/* Dev Mode Bypass (Staff Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="pt-4 flex flex-col items-center">
          <div className="w-full h-px bg-white/5 mb-6" />
          <button
            type="button"
            onClick={async () => {
              try {
                await setLocalBypassCookie();
                toast({
                  title: 'Bypass Staff Activado',
                  description: 'Accediendo mediante protocolo de emergencia local...',
                });
                router.push('/');
                router.refresh();
              } catch {
                setServerError(
                  'No fue posible activar el bypass local en este navegador (Cookie Store API no disponible).',
                );
              }
            }}
            className="group flex flex-col items-center gap-2 text-white/20 hover:text-prana-gold transition-all duration-300"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">
              Entrada de Emergencia
            </span>
            <div className="h-8 w-8 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}
    </form>
  );
}
