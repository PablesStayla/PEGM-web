import { eq } from 'drizzle-orm';
import { db, webhookLogs } from '../db';

export type WebhookSource = 'payments' | 'supplier' | 'internal';
export type WebhookStatus = 'RECEIVED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface WebhookLog {
  id: string;
  source: WebhookSource;
  event: string;
  payload: Record<string, unknown>;
  headers?: Record<string, unknown> | null;
  status: WebhookStatus;
  attempts: number;
  errorMessage?: string | null;
  createdAt: Date;
  processedAt?: Date | null;
}

/**
 * DrizzleWebhookLogRepository
 * Gathers and manages external webhook event logs for observability and replayability.
 */
export class DrizzleWebhookLogRepository {
  async create(data: {
    source: WebhookSource;
    event: string;
    payload: Record<string, unknown>;
    headers?: Record<string, unknown>;
  }): Promise<WebhookLog> {
    const [row] = await db
      .insert(webhookLogs)
      .values({
        source: data.source as WebhookSource,
        event: data.event,
        payload: data.payload,
        headers: data.headers ?? null,
        status: 'RECEIVED',
        attempts: 0,
      } as typeof webhookLogs.$inferInsert)
      .returning();

    if (!row) {
      throw new Error('Failed to create webhook log: No row returned');
    }
    return this.toDomain(row);
  }

  async findById(id: string): Promise<WebhookLog | null> {
    const rows = await db.select().from(webhookLogs).where(eq(webhookLogs.id, id)).limit(1);
    if (rows.length === 0 || !rows[0]) {
      return null;
    }
    return this.toDomain(rows[0]);
  }

  async updateStatus(id: string, status: WebhookStatus, error?: string): Promise<void> {
    await db
      .update(webhookLogs)
      .set({
        status: status as WebhookStatus,
        errorMessage: error ?? null,
        processedAt: status === 'SUCCESS' ? new Date() : null,
      } as Partial<typeof webhookLogs.$inferInsert>)
      .where(eq(webhookLogs.id, id));
  }

  async incrementAttempts(id: string): Promise<void> {
    const log = await this.findById(id);
    if (!log) {
      return;
    }

    await db
      .update(webhookLogs)
      .set({
        attempts: log.attempts + 1,
      } as Partial<typeof webhookLogs.$inferInsert>)
      .where(eq(webhookLogs.id, id));
  }

  private toDomain(row: typeof webhookLogs.$inferSelect): WebhookLog {
    return {
      id: row.id,
      source: row.source as WebhookSource,
      event: row.event,
      payload: row.payload as Record<string, unknown>,
      headers: row.headers as Record<string, unknown> | null,
      status: row.status as WebhookStatus,
      attempts: row.attempts,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      processedAt: row.processedAt,
    };
  }
}
