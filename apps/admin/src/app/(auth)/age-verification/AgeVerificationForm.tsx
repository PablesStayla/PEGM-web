'use client';

import { verifyAgeAction } from '@pranakaia/auth/actions';
import { Button, useToast } from '@pranakaia/ui';
import { Info, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function AgeVerificationForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      try {
        await verifyAgeAction();

        toast({
          title: 'Verificación Exitosa',
          description: 'PranaKaia Identity Shield v2 activado.',
        });

        router.push('/login');
        router.refresh();
      } catch (_e) {
        setError('Error de comunicación persistente.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button
          onClick={handleVerify}
          disabled={isPending}
          variant="premium"
          className="h-16 w-full rounded-2xl text-base shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#0a0a0a]" />
              <span className="tracking-wide">Verificando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="tracking-wide uppercase">Soy Mayor de 18 Años</span>
            </div>
          )}
        </Button>

        <button
          type="button"
          onClick={() => (window.location.href = 'https://www.google.com')}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 transition-colors hover:text-red-400"
        >
          No, soy menor de edad
        </button>
      </div>

      {error && (
        <div className="flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs font-medium text-red-300/90 leading-relaxed text-left">{error}</p>
        </div>
      )}
    </div>
  );
}
