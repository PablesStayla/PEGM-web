import Image from 'next/image';
import { AgeVerificationForm } from './AgeVerificationForm';

export default function AgeVerificationPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050D0C]">
      {/* Background Layer: Mesh Forest */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-[#1A3C38]/40 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-[#14b8a6]/15 blur-[140px]" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md px-6">
        <div className="mb-12 flex flex-col items-center">
          <div className="relative h-14 w-56 animate-float">
            <Image
              src="/logos/pranakaia-logo-new.png"
              alt="PranaKaia Premium"
              fill
              priority
              sizes="224px"
              className="object-contain drop-shadow-[0_0_20px_rgba(20,184,166,0.4)]"
            />
          </div>
          <span className="mt-4 text-[10px] font-bold tracking-[0.5em] text-[#14b8a6] uppercase">
            Legal Compliance Gate
          </span>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0D1F1D]/60 shadow-2xl backdrop-blur-3xl p-1">
          <div className="rounded-[2.3rem] bg-white/[0.02] p-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
              Verificación de <br />
              <span className="bg-linear-to-r from-[#14b8a6] to-[#86f5dd] bg-clip-text text-transparent italic">
                Mayoría de Edad
              </span>
            </h1>

            <div className="mt-8 space-y-6">
              <p className="text-sm font-light leading-relaxed text-gray-400">
                Este sitio contiene productos e información relacionada con el cannabis. Debe ser
                mayor de 18 años para acceder.
              </p>

              <div className="h-px w-12 bg-[#14b8a6]/30 mx-auto" />

              <AgeVerificationForm />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-medium tracking-widest text-gray-600 uppercase">
          🛡️ PranaKaia Staff Governance & Chile Law 19.628
        </p>
      </main>
    </div>
  );
}
