'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, useToast } from '@pranakaia/ui';
import { AlertCircle, Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { verifyAdminStepUp } from '@/actions/security';

const MfaSchema = z.object({
  code: z.string().min(6, 'El código debe tener al menos 6 dígitos').max(16),
});

type MfaInput = z.infer<typeof MfaSchema>;

export function MfaForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaInput>({
    resolver: zodResolver(MfaSchema),
    defaultValues: { code: '' },
  });

  const onFormSubmit = (data: MfaInput) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await verifyAdminStepUp(data);

        if (result?.serverError || result?.validationErrors) {
          setError(result?.serverError || 'Error de validación en el código.');
          return;
        }

        if (result?.data?.success === false) {
          setError(result?.data?.error || 'Código MFA inválido.');
          return;
        }

        toast({
          title: 'Identidad Verificada',
          description: 'Nivel de seguridad Staff AAL2 activado.',
        });

        router.push('/');
        router.refresh();
      } catch (_e) {
        setError('Error fatal en la verificación del segundo factor.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#14b8a6]/20 bg-[#14b8a6]/5 backdrop-blur-md">
          <Smartphone className="h-8 w-8 text-[#14b8a6]" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            Validación Staff MFA
          </h2>
          <p className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-widest leading-loose">
            Ingresa el código de 6 dígitos de tu aplicación autenticadora o un código de respaldo.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="group relative">
          <Input
            id="code"
            {...register('code')}
            disabled={isPending}
            placeholder="000 000"
            className={`h-16 rounded-2xl border-white/5 bg-white/[0.03] text-center text-2xl font-bold tracking-[0.5em] text-white placeholder-gray-700 backdrop-blur-sm transition-all focus:border-[#14b8a6]/30 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#14b8a6]/10 ${
              errors.code ? 'border-red-500/50' : ''
            }`}
          />
        </div>
        {errors.code && (
          <p className="text-center text-[10px] font-medium text-red-400/80 uppercase">
            {errors.code.message}
          </p>
        )}
      </div>

      {error && (
        <div className="flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs font-medium text-red-300/90 leading-relaxed text-left">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="premium"
        disabled={isPending}
        className="h-14 w-full rounded-2xl text-base shadow-2xl transition-all hover:scale-[1.01]"
      >
        {isPending ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#0a0a0a]" />
            <span className="tracking-wide uppercase">Validando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="tracking-wide uppercase">Verificar y Entrar</span>
          </div>
        )}
      </Button>

      <button
        type="button"
        onClick={() => router.back()}
        className="block w-full text-[10px] font-bold uppercase tracking-widest text-gray-600 transition-colors hover:text-[#14b8a6]"
      >
        Volver al login básico
      </button>
    </form>
  );
}
