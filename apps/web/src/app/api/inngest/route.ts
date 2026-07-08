import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { fulfillOrder } from '@/lib/inngest/functions/fulfill-order';
import { stripeWebhookReceived } from '@/lib/inngest/functions/stripe-webhook';

/**
 * 🦾 Staff Inngest Handler — Proyecto Lázaro & Core Orchestration
 *
 * ADR-016: Background Jobs & Event-Driven Architecture
 *
 * Todas las funciones de negocio críticas se sirven desde un único punto
 * de entrada orquestado.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [fulfillOrder, stripeWebhookReceived],
});
