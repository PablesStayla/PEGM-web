import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsReport, type Ranking } from "@/lib/analytics/report";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Analítica", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const number = (value: number) =>
  new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 }).format(value);
const actionNames: Record<string, string> = {
  cv_download: "Descargas del CV",
  email_click: "Clics en correo",
  contact_success: "Formularios enviados",
  lab_interaction: "Interacciones con el laboratorio",
  outbound_click: "Clics en perfiles externos",
};
const sectionNames: Record<string, string> = {
  "sobre-mi": "Perfil profesional",
  especialidades: "Enfoque técnico",
  proyectos: "Proyectos",
  trayectoria: "Trayectoria",
  laboratorio: "Laboratorio",
  contacto: "Contacto",
  procesos: "Procesos",
  simulacion: "Simulación CFD",
  datos: "Datos e IA",
  aprendizaje: "Aprendizaje",
  about: "Perfil (EN)",
  projects: "Proyectos (EN)",
  flotacion: "Cinética de flotación",
  balance: "Balance de masa",
  pourbaix: "Diagrama Eh-pH",
  planta: "Planta virtual",
};
function change(current: number, previous: number) {
  if (!previous) return current ? "Sin base anterior" : "Sin actividad";
  const delta = ((current - previous) / previous) * 100;
  return `${delta > 0 ? "+" : ""}${number(delta)} % vs. período anterior`;
}
function RankingPanel({
  title,
  rows,
  empty = "Todavía no hay datos para este período.",
}: {
  title: string;
  rows: Ranking;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="min-w-0 border border-line bg-bg p-5">
      <h2 className="font-serif text-xl">{title}</h2>
      {rows.length ? (
        <table className="mt-4 w-full text-left text-xs">
          <caption className="sr-only">{title}: etiqueta y número de eventos</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th scope="row" className="max-w-52 py-3 pr-3 font-normal">
                  <span className="block break-words">{row.label}</span>
                  <span aria-hidden="true" className="mt-2 block h-1 bg-accent/15">
                    <span
                      className="block h-1 bg-accent"
                      style={{ width: `${(row.value / max) * 100}%` }}
                    />
                  </span>
                </th>
                <td className="w-12 text-right tabular-nums">{number(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-5 text-xs leading-relaxed text-muted">{empty}</p>
      )}
    </section>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const requested = Number((await searchParams).days ?? 30);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const [report, projects] = await Promise.all([getAnalyticsReport(days), getProjects()]);
  const actions = (name: string) => report.actions.find((item) => item.label === name)?.value ?? 0;
  const metrics = [
    {
      title: "Visitantes estimados",
      value: number(report.current.visitors),
      detail: change(report.current.visitors, report.previous.visitors),
    },
    {
      title: "Sesiones",
      value: number(report.current.sessions),
      detail: change(report.current.sessions, report.previous.sessions),
    },
    {
      title: "Páginas vistas",
      value: number(report.current.views),
      detail: change(report.current.views, report.previous.views),
    },
    {
      title: "Activas en los últimos 5 min",
      value: number(report.live),
      detail: "Sesiones con actividad recibida; no es un contador instantáneo.",
    },
    {
      title: "Tiempo activo por página",
      value: report.averageSeconds === null ? "—" : `${number(report.averageSeconds)} s`,
      detail: "Tiempo visible reportado por el navegador.",
    },
    {
      title: "Scroll medio",
      value: report.current.views ? `${number(report.current.depth)} %` : "—",
      detail: "Profundidad máxima media por página.",
    },
    {
      title: "Sesiones interesadas",
      value: report.engagementRate === null ? "—" : `${number(report.engagementRate)} %`,
      detail: "Más de 1 página, ≥10 s activos o ≥75 % de scroll.",
    },
    {
      title: "Conversión profesional",
      value: report.conversionRate === null ? "—" : `${number(report.conversionRate)} %`,
      detail: "Sesiones con descarga de CV, clic en correo o formulario enviado.",
    },
  ];
  const peak = Math.max(1, ...report.daily.map((item) => item.value));
  const sectionRows = report.sections.map((item) => ({
    ...item,
    label: item.label.startsWith("project-")
      ? (projects.find((project) => `project-${project.id}` === item.label)?.title ?? item.label)
      : (sectionNames[item.label] ?? item.label),
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs tracking-widest text-accent uppercase">Audiencia y oportunidades</p>
          <h1 className="mt-2 font-serif text-3xl">Analítica</h1>
          <p className="mt-2 text-sm text-muted">
            Qué atrae interés y qué lleva al contacto profesional.
          </p>
        </div>
        <nav aria-label="Período de analítica" className="flex gap-2">
          {[7, 30, 90].map((period) => (
            <Link
              key={period}
              href={`/admin/analitica?days=${period}`}
              aria-current={days === period ? "page" : undefined}
              className={`border px-3 py-2 text-xs ${days === period ? "border-ink bg-ink text-bg" : "border-line bg-bg"}`}
            >
              {period} días
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-5 border border-line bg-bg p-4 text-xs leading-relaxed text-muted">
        Solo se miden visitas con consentimiento. Identificadores aleatorios, sin nombres ni IP
        guardadas. Se excluyen administradores autenticados, bots conocidos y localhost (salvo
        prueba explícita). Ventana móvil de {days} días; fechas del gráfico en America/Santiago. Los
        bloqueadores y la falta de consentimiento reducen la cobertura.
      </p>
      {process.env.ANALYTICS_DISABLED === "true" ? (
        <p role="status" className="mt-4 border border-accent p-4 text-sm">
          La recogida de analítica está desactivada mediante ANALYTICS_DISABLED.
        </p>
      ) : null}
      {!report.current.views ? (
        <div role="status" className="mt-6 border border-line bg-bg p-6">
          <h2 className="font-serif text-xl">Listo para recibir visitas reales</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Todavía no hay páginas vistas registradas en este período. No se han añadido datos de
            demostración. En localhost el seguimiento está excluido por defecto; empieza a medir al
            publicar y recibir consentimiento.
          </p>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <section key={metric.title} className="border border-line bg-bg p-5">
            <h2 className="text-xs text-muted">{metric.title}</h2>
            <p className="mt-3 font-serif text-3xl text-accent tabular-nums">{metric.value}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">{metric.detail}</p>
          </section>
        ))}
      </div>
      <section className="mt-6 border border-line bg-bg p-5">
        <h2 className="font-serif text-xl">Evolución de páginas vistas</h2>
        <p className="mt-2 text-xs text-muted">
          Primer y último día pueden ser parciales. Las barras tienen sus valores en la tabla
          desplegable.
        </p>
        <div className="mt-6 flex h-36 items-end gap-1" aria-hidden="true">
          {report.daily.map((item) => (
            <div
              key={item.label}
              className="flex h-full min-w-0 flex-1 items-end"
              title={`${item.label}: ${item.value}`}
            >
              <div
                className="w-full bg-accent"
                style={{
                  height: item.value ? `${Math.max(2, (item.value / peak) * 100)}%` : "1px",
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>{report.daily[0]?.label}</span>
          <span>{report.daily.at(-1)?.label}</span>
        </div>
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-accent">Ver valores por fecha</summary>
          <table className="mt-3 w-full text-left">
            <thead>
              <tr>
                <th scope="col">Fecha (Chile)</th>
                <th scope="col">Páginas vistas</th>
              </tr>
            </thead>
            <tbody>
              {report.daily.map((item) => (
                <tr key={item.label}>
                  <td className="py-1">{item.label}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {["cv_download", "email_click", "contact_success"].map((name) => (
          <section key={name} className="border border-line bg-bg p-5">
            <h2 className="text-xs text-muted">{actionNames[name]}</h2>
            <p className="mt-2 font-serif text-3xl text-accent">{number(actions(name))}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankingPanel title="Páginas más vistas" rows={report.pages} />
        <RankingPanel title="Procedencia del tráfico · páginas vistas" rows={report.sources} />
        <RankingPanel title="Secciones y proyectos explorados · eventos" rows={sectionRows} />
        <RankingPanel
          title="Acciones registradas"
          rows={report.actions.map((item) => ({
            ...item,
            label: actionNames[item.label] ?? item.label,
          }))}
        />
        <RankingPanel title="Dispositivos · páginas vistas" rows={report.devices} />
        <RankingPanel title="Navegadores · páginas vistas" rows={report.browsers} />
        <RankingPanel
          title="País aproximado · páginas vistas"
          rows={report.countries}
          empty="Disponible al desplegar en Vercel con geolocalización de la plataforma."
        />
        <RankingPanel
          title="Campañas UTM · páginas vistas"
          rows={report.campaigns}
          empty="Usa enlaces como /?utm_source=linkedin&utm_campaign=perfil para distinguir campañas."
        />
      </div>
      <section className="mt-6 border border-line bg-bg p-5">
        <h2 className="font-serif text-xl">Rendimiento y errores</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Percentil 75 de mediciones reales de navegación de documento recibidas, no una puntuación
          Lighthouse. Cada métrica tiene cobertura distinta según navegador e interacción. La
          muestra incluye solo visitantes que aceptan analítica.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {report.vitals.map((metric) => (
            <div key={metric.label} className="border border-line p-4">
              <h3 className="text-xs text-muted">{metric.label} · p75</h3>
              <p className="mt-2 font-serif text-2xl">
                {metric.p75 === null
                  ? "—"
                  : metric.label === "CLS"
                    ? metric.p75.toFixed(3)
                    : `${number(metric.p75)} ms`}
              </p>
              <p className="mt-1 text-[10px] text-muted">
                {metric.samples} muestras
                {metric.samples < 20 ? " · muestra insuficiente para conclusiones" : ""}
              </p>
            </div>
          ))}
          <div className="border border-line p-4">
            <h3 className="text-xs text-muted">Errores del navegador</h3>
            <p className="mt-2 font-serif text-2xl">{report.errors}</p>
            <p className="mt-1 text-[10px] text-muted">
              Solo categoría; no se guardan mensajes ni datos sensibles.
            </p>
          </div>
        </div>
        {report.vitalSampleCapped ? (
          <p className="mt-4 text-xs text-muted">
            Cálculo limitado a las 10.000 mediciones más recientes del período.
          </p>
        ) : null}
      </section>
      <p className="mt-6 text-xs leading-relaxed text-muted">
        Visitantes ≠ personas identificadas: un navegador, dispositivo o borrado de almacenamiento
        puede cambiar el identificador. Las sesiones expiran tras 30 minutos de inactividad y se
        separan por pestaña. Retención: 180 días. Los clics de descarga no prueban la lectura del CV
        y un clic en correo no prueba el envío de un mensaje. Actualiza esta página para consultar
        nuevos datos.
      </p>
    </>
  );
}
