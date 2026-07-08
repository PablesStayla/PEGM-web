import * as Sentry from '@sentry/nextjs';

export default function DebugSentryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-vh-100 p-20 gap-8">
      <h1 className="text-4xl font-bold tracking-tight">Sentry Debug Center</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Usa estos botones para verificar que Sentry está capturando errores correctamente en los
        diferentes entornos de Next.js.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {/* Client Error */}
        <div className="p-6 border rounded-xl bg-card hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Client-side Error</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Captura errores que ocurren directamente en el navegador.
          </p>
          <button
            onClick={() => {
              throw new Error('Sentry Debug: Client-side crash test');
            }}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Trigger Client Error
          </button>
        </div>

        {/* Server Action Error */}
        <div className="p-6 border rounded-xl bg-card hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Server Action Error</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Verifica la captura de errores en el servidor (Server Actions).
          </p>
          <form
            action={async () => {
              'use server';
              Sentry.captureMessage('Sentry Debug: Server Action test message');
              throw new Error('Sentry Debug: Server Action crash test');
            }}
          >
            <button
              type="submit"
              className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Trigger Server Action Error
            </button>
          </form>
        </div>
      </div>

      <footer className="mt-12 text-sm text-muted-foreground italic">
        Nota: Asegúrate de tener NEXT_PUBLIC_SENTRY_DSN configurado en tu .env.local
      </footer>
    </div>
  );
}
