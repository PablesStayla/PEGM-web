import Image from 'next/image';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function getInitialLoginError(email: string) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return null;
  }
  return 'Ingrese su contraseña para continuar.';
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialEmail = getFirstSearchParam(resolvedSearchParams.email);
  const initialError = getInitialLoginError(initialEmail);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050D0C]">
      {/* Background Layer: Mesh Forest with Noise */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-[#1A3C38]/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-[#14b8a6]/10 blur-[120px]" />
      </div>

      {/* Main Container: Split Layout with Glassmorphism */}
      <main className="relative z-10 flex h-full max-h-[800px] w-full max-w-[1200px] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0D1F1D]/40 shadow-2xl backdrop-blur-3xl lg:flex-row mx-4">
        {/* Left Panel: Brand Experience */}
        <div className="relative hidden w-full flex-col justify-between p-12 lg:flex lg:w-[45%] bg-linear-to-br from-[#0D1F1D] to-[#050D0C]">
          <div className="absolute inset-0 bg-noise opacity-[0.02]" />

          <div className="relative z-10">
            <div className="flex flex-col gap-2">
              <div className="relative h-12 w-48 animate-float">
                <Image
                  src="/logos/pranakaia-logo-new.png"
                  alt="PranaKaia Premium"
                  fill
                  sizes="192px"
                  className="object-contain object-left drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                />
              </div>
              <p className="mt-2 text-[10px] font-bold tracking-[0.4em] text-[#14b8a6] uppercase">
                Staff Governance Panel
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-sm">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white font-serif">
              Cultivando <br />
              <span className="bg-linear-to-r from-[#14b8a6] to-[#86f5dd] bg-clip-text text-transparent italic">
                Excelencia
              </span>
            </h1>
            <div className="mt-6 h-1 w-12 bg-[#14b8a6] rounded-full" />
            <p className="mt-8 text-lg font-light leading-relaxed text-gray-400">
              Acceso restringido a la infraestructura crítica de PranaKaia. Verificación de
              identidad requerida.
            </p>
          </div>

          <div className="relative z-10 flex gap-8 border-t border-white/5 pt-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">99.9%</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-[#14b8a6]">
                Disponibilidad
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">AES-256</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-[#14b8a6]">
                Cifrado
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Security Auth Interface */}
        <div className="relative flex w-full flex-col justify-center bg-transparent px-8 py-16 lg:w-[55%] lg:px-20">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Header */}
            <div className="mb-12 flex flex-col items-center lg:hidden">
              <div className="relative h-10 w-40">
                <Image
                  src="/logos/pranakaia-logo-new.png"
                  alt="PranaKaia"
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
              <span className="mt-2 text-[9px] font-bold tracking-[0.3em] text-[#14b8a6] uppercase">
                Governance Portal
              </span>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white">Identificación</h2>
              <p className="mt-3 text-base font-light text-gray-500">
                Ingrese sus credenciales de alto nivel para proceder.
              </p>
            </div>

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.02] p-1 shadow-inner backdrop-blur-xl">
              <div className="rounded-[1.8rem] bg-[#0D1F1D]/20 p-8 shadow-2xl">
                <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
                  <LoginForm initialEmail={initialEmail} initialError={initialError} />
                </Suspense>
              </div>
            </div>

            <p className="mt-8 text-center text-[11px] font-medium tracking-[0.1em] text-gray-600 uppercase">
              🔒 Sesión monitoreada y protegida por PranaGuard™
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
