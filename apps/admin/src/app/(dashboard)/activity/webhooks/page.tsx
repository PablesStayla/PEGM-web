import { webhookLogs } from '@pranakaia/infrastructure/db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { CheckCircle2, Webhook, XCircle } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

type WebhookDelivery = {
  id: string;
  event: string;
  source: 'payments' | 'supplier' | 'internal';
  status: 'RECEIVED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  attempts: number;
  errorMessage: string | null;
  createdAt: Date;
  processedAt: Date | null;
  payload: unknown;
  headers: unknown;
};

const STATUS_OPTIONS = ['RECEIVED', 'PROCESSING', 'SUCCESS', 'FAILED'] as const;
const SOURCE_OPTIONS = ['payments', 'supplier', 'internal'] as const;

const sourceLabel: Record<WebhookDelivery['source'], string> = {
  payments: 'Pagos',
  supplier: 'Proveedor',
  internal: 'Interno',
};

const statusClass: Record<WebhookDelivery['status'], string> = {
  RECEIVED: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  SUCCESS: 'bg-green-500/10 text-green-300 border-green-500/20',
  FAILED: 'bg-red-500/10 text-red-300 border-red-500/20',
};

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function WebhooksLogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string }>;
}) {
  const sp = await searchParams;

  const status = STATUS_OPTIONS.includes(sp.status as (typeof STATUS_OPTIONS)[number])
    ? (sp.status as (typeof STATUS_OPTIONS)[number])
    : undefined;

  const source = SOURCE_OPTIONS.includes(sp.source as (typeof SOURCE_OPTIONS)[number])
    ? (sp.source as (typeof SOURCE_OPTIONS)[number])
    : undefined;

  const whereConditions = [];
  if (status) {
    whereConditions.push(eq(webhookLogs.status, status));
  }
  if (source) {
    whereConditions.push(eq(webhookLogs.source, source));
  }

  const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [deliveries, summary] = await Promise.all([
    db
      .select({
        id: webhookLogs.id,
        event: webhookLogs.event,
        source: webhookLogs.source,
        status: webhookLogs.status,
        attempts: webhookLogs.attempts,
        errorMessage: webhookLogs.errorMessage,
        createdAt: webhookLogs.createdAt,
        processedAt: webhookLogs.processedAt,
        payload: webhookLogs.payload,
        headers: webhookLogs.headers,
      })
      .from(webhookLogs)
      .where(where)
      .orderBy(desc(webhookLogs.createdAt))
      .limit(100),
    db
      .select({
        status: webhookLogs.status,
        total: sql<number>`count(*)`,
      })
      .from(webhookLogs)
      .groupBy(webhookLogs.status),
  ]);

  const stats = {
    total: deliveries.length,
    success: summary.find((item) => item.status === 'SUCCESS')?.total ?? 0,
    failed: summary.find((item) => item.status === 'FAILED')?.total ?? 0,
    processing: summary.find((item) => item.status === 'PROCESSING')?.total ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Webhook className="w-8 h-8 text-blue-500" />
            Registro de Webhooks
          </h1>
          <p className="text-zinc-400 mt-1">
            Eventos reales de integraciones entrantes y salientes.
          </p>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-white/8 bg-[#161616] p-4">
        <label className="text-xs text-gray-400 space-y-1">
          <span>Estado</span>
          <select
            name="status"
            defaultValue={status ?? ''}
            className="block rounded-lg bg-[#0f0f0f] border border-white/10 text-white px-3 py-2"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-gray-400 space-y-1">
          <span>Origen</span>
          <select
            name="source"
            defaultValue={source ?? ''}
            className="block rounded-lg bg-[#0f0f0f] border border-white/10 text-white px-3 py-2"
          >
            <option value="">Todos</option>
            {SOURCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
        >
          Aplicar filtros
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/8 bg-[#161616] p-4">
          <p className="text-xs text-gray-400">Eventos listados</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/8 p-4">
          <p className="text-xs text-green-300">Exitosos</p>
          <p className="text-2xl font-bold text-green-200">{stats.success}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4">
          <p className="text-xs text-red-300">Fallidos</p>
          <p className="text-2xl font-bold text-red-200">{stats.failed}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-4">
          <p className="text-xs text-blue-300">En proceso</p>
          <p className="text-2xl font-bold text-blue-200">{stats.processing}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-[#161616] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/2">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400">
                Evento
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400">
                Origen
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400">
                Estado
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400">
                Intentos
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400">
                Fecha
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-400">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-gray-500">
                  No hay entregas de webhook para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              (deliveries as WebhookDelivery[]).map((delivery) => (
                <tr key={delivery.id} className="border-b border-white/6 align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono text-white">{delivery.event}</p>
                    {delivery.errorMessage ? (
                      <p className="text-xs text-red-300 mt-1">{delivery.errorMessage}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{sourceLabel[delivery.source]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${statusClass[delivery.status]}`}
                    >
                      {delivery.status === 'SUCCESS' ? <CheckCircle2 className="h-3 w-3" /> : null}
                      {delivery.status === 'FAILED' ? <XCircle className="h-3 w-3" /> : null}
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{delivery.attempts}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(delivery.createdAt).toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    <details className="rounded-md border border-white/10 bg-black/20 p-2">
                      <summary className="cursor-pointer text-xs text-blue-300">
                        Ver payload
                      </summary>
                      <pre className="mt-2 max-h-56 overflow-auto text-xs text-gray-300 whitespace-pre-wrap break-all">
                        {safeJson(delivery.payload)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
