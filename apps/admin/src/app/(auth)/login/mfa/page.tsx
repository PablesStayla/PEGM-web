import type { Metadata } from 'next';
import { MfaForm } from './MfaForm';

export const metadata: Metadata = {
  title: 'MFA Verification | PranaKaia Admin',
  description: 'Second-factor authentication for staff access.',
};

export default function MfaPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm rounded-[2.5rem] border border-white/5 bg-black/40 p-8 shadow-2xl backdrop-blur-3xl lg:p-12">
        <MfaForm />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500/50">
        PranaKaia Identity Shield v2 • Staff Only
      </p>
    </div>
  );
}
