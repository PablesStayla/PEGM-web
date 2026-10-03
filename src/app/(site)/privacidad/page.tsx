import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Cómo se tratan los datos enviados a través de este sitio profesional.",
  alternates: { canonical: "/privacidad" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">Transparencia</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-6xl">
        Privacidad<span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        Este sitio recopila únicamente los datos necesarios para responder consultas y entender su
        rendimiento técnico.
      </p>

      <div className="mt-14 space-y-12 border-t border-line pt-12 leading-7 text-muted">
        <section aria-labelledby="datos">
          <h2 id="datos" className="font-serif text-2xl text-ink">
            Datos del formulario
          </h2>
          <p className="mt-4">
            Al enviar un mensaje se guardan el nombre, correo y contenido que escribas. Se utilizan
            exclusivamente para responder tu consulta y mantener el historial de la conversación. No
            se venden ni se comparten con fines publicitarios.
          </p>
        </section>

        <section aria-labelledby="seguridad">
          <h2 id="seguridad" className="font-serif text-2xl text-ink">
            Seguridad y prevención de abuso
          </h2>
          <p className="mt-4">
            El formulario y el acceso administrativo aplican límites temporales por solicitud. Para
            ello se almacena un identificador irreversible generado a partir de datos técnicos de
            conexión; la dirección IP no se guarda en claro y el contador expira automáticamente.
          </p>
        </section>

        <section aria-labelledby="medicion">
          <h2 id="medicion" className="font-serif text-2xl text-ink">
            Medición del sitio
          </h2>
          <p className="mt-4">
            El despliegue puede utilizar Vercel Web Analytics y Speed Insights para medir visitas,
            rendimiento y Core Web Vitals. Estas herramientas están configuradas sin perfiles
            publicitarios ni cookies de seguimiento propias del sitio.
          </p>
        </section>

        <section aria-labelledby="control">
          <h2 id="control" className="font-serif text-2xl text-ink">
            Acceso y eliminación
          </h2>
          <p className="mt-4">
            Puedes solicitar acceso, corrección o eliminación de un mensaje escribiendo a{" "}
            <a href={`mailto:${settings.email}`} className="text-accent hover:text-accent-strong">
              {settings.email}
            </a>
            . Los mensajes que dejan de ser necesarios se eliminan desde el panel privado.
          </p>
        </section>
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <Link href="/" className="text-sm text-accent hover:text-accent-strong">
          ← Volver al inicio
        </Link>
      </div>
    </article>
  );
}
