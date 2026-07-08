'use client';

import { verifyAgeAction } from '@pranakaia/infrastructure/auth/actions';
import { Button, useToast } from '@pranakaia/ui';
import { Info, Leaf, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function AgeVerificationForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      try {
        await verifyAgeAction();

        toast({
          title: 'Acceso Autorizado',
          description: 'Bienvenido a PranaKaia. Tu mayoría de edad ha sido verificada.',
        });

        const from = searchParams.get('from') || '/';
        router.push(from);
        router.refresh();
      } catch (_e) {
        setError('Error de comunicación persistente con el servidor de cumplimiento.');
      }
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
        <Leaf className="h-10 w-10" />
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase italic">
          Control de Acceso
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 leading-relaxed">
          Para acceder a nuestro catálogo de productos,
          <br />
          debes confirmar que eres mayor de 18 años.
        </p>
      </div>

      <div className="w-full space-y-4 pt-4">
        <Button
          onClick={handleVerify}
          disabled={isPending}
          variant="premium"
          className="h-16 w-full rounded-2xl text-base shadow-2xl transition-all hover:scale-[1.02] active:scale-95 bg-white text-black hover:bg-emerald-50"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="tracking-wide text-[11px] uppercase font-bold">
                Verificando Credenciales...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="tracking-wide uppercase font-bold">Soy Mayor de 18 Años</span>
            </div>
          )}
        </Button>

        <button
          type="button"
          onClick={() => (window.location.href = 'https://www.google.com')}
          className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 transition-colors hover:text-red-400"
        >
          No, abandonar el sitio
        </button>
      </div>

      {error && (
        <div className="flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 w-full">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs font-medium text-red-300/90 leading-relaxed text-left">{error}</p>
        </div>
      )}

      <p className="text-[9px] font-medium text-center text-gray-600 uppercase tracking-widest px-4">
        PranaKaia cumple estrictamente con la normativa legal vigente
        <br />
        sobre la venta de productos regulados.
      </p>
    </div>
  );
}
