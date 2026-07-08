/**
 * PranaKaia Notification Service
 * Level: Senior Enterprise
 *
 * Handles multi-channel notifications (Discord, Email, etc.)
 * with consistent branding, error handling, Sentry integration,
 * and Redis-backed idempotency to prevent duplicate notifications.
 */
import { env } from '@/lib/env';
import { redis } from '@/lib/redis/client';

interface DiscordEmbed {
  title: string;
  description: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

const DISCORD_COLORS = {
  SUCCESS: 0x1a4d2e, // PranaKaia Forest Green
  ERROR: 0xff4b2b, // Error Red
  INFO: 0x3498db, // Info Blue
  WARNING: 0xf1c40f, // Warning Yellow
};

type NotificationChannel = 'SALES' | 'ERRORS' | 'SYSTEM';

export class NotificationService {
  /**
   * Enterprise Level: Multi-channel Webhook Resolver
   */
  private static getWebhookUrl(channel: NotificationChannel) {
    switch (channel) {
      case 'SALES':
        return env.DISCORD_WEBHOOK_SALES || env.DISCORD_WEBHOOK_URL;
      case 'ERRORS':
        return env.DISCORD_WEBHOOK_ERRORS || env.DISCORD_WEBHOOK_URL;
      default:
        return env.DISCORD_WEBHOOK_URL;
    }
  }

  /**
   * Sends a high-quality rich embed to Discord.
   * Optional idempotencyKey prevents duplicate sends for the same event.
   */
  static async sendDiscordNotification(
    embed: DiscordEmbed,
    channel: NotificationChannel = 'SYSTEM',
    idempotencyKey?: string,
  ): Promise<boolean> {
    // ── Idempotency check via Redis (TTL: 24 h) ──
    if (idempotencyKey) {
      const redisKey = `notif:idem:${channel}:${idempotencyKey}`;
      const already = await redis.get(redisKey);
      if (already) {
        return true;
      }
      await redis.setex(redisKey, 86400, '1');
    }

    const url = NotificationService.getWebhookUrl(channel);
    if (!url) {
      console.warn(`[NotificationService] Missing Discord Webhook for channel: ${channel}`);
      return false;
    }

    const payload = {
      username:
        channel === 'SALES'
          ? 'PranaKaia Ventas'
          : channel === 'ERRORS'
            ? 'PranaKaia Alertas'
            : 'PranaKaia Monitor',
      avatar_url: 'https://www.pranakaia.com/logos/pranakaia-icon-new.png',
      embeds: [
        {
          ...embed,
          color: embed.color ?? DISCORD_COLORS.INFO,
          timestamp: new Date().toISOString(),
          footer: embed.footer ?? { text: `PranaKaia ${channel} — Concepción, Chile` },
        },
      ],
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Discord returned ${res.status}: ${await res.text()}`);
      }
      return true;
    } catch (error) {
      console.error(`[NotificationService] Failed to send to ${channel}:`, error);
      // Bridge to Sentry if available (set by instrumentation-client.ts)
      const sentryBridge = (globalThis as Record<string, unknown>)['__sentry_error__'] as
        | ((msg: string, ctx?: unknown) => void)
        | undefined;
      sentryBridge?.(`NotificationService.${channel} failed`, { error, embed });
      return false;
    }
  }

  /**
   * Specialist: Notify new order created.
   * Idempotent — uses orderNumber as key (safe to call multiple times).
   */
  static async notifyOrderCreated(order: {
    orderNumber: string;
    customerName: string;
    amount: number;
    itemsCount: number;
  }) {
    return NotificationService.sendDiscordNotification(
      {
        title: '💰 Nueva Venta Realizada',
        description: `El cliente **${order.customerName}** ha completado un pedido.`,
        color: DISCORD_COLORS.SUCCESS,
        fields: [
          { name: 'Orden', value: `#${order.orderNumber}`, inline: true },
          { name: 'Total', value: `$${order.amount.toLocaleString('es-CL')}`, inline: true },
          { name: 'Productos', value: `${order.itemsCount} items`, inline: true },
        ],
      },
      'SALES',
      `order:${order.orderNumber}`, // ← idempotency key
    );
  }

  /**
   * Specialist: Notify critical error.
   * Also forwards to Sentry for full traceability.
   */
  static async notifyError(error: Error, context: string) {
    // Forward to Sentry immediately (server-side bridge)
    if (typeof globalThis !== 'undefined') {
      const sentryBridge = (globalThis as Record<string, unknown>)['__sentry_error__'] as
        | ((msg: string, ctx?: unknown) => void)
        | undefined;
      sentryBridge?.(`[${context}] ${error.message}`, {
        stack: error.stack,
        context,
      });
    }

    // Also try to capture via @sentry/nextjs if available server-side
    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureException(error, { tags: { context }, extra: { context } });
    } catch {
      // Sentry no está configurado: se omite el reporte adicional.
    }

    return NotificationService.sendDiscordNotification(
      {
        title: '🚨 Error Crítico Detectado',
        description: `Error en **${context}**`,
        color: DISCORD_COLORS.ERROR,
        fields: [
          { name: 'Mensaje', value: `\`\`\`${error.message}\`\`\``, inline: false },
          {
            name: 'Stack',
            value: `\`\`\`${error.stack?.substring(0, 500) ?? 'No stack'}\`\`\``,
            inline: false,
          },
        ],
      },
      'ERRORS',
    );
  }
}
