/**
 * Action Provider — central `next-safe-action` client used by every server
 * action in `resources/<dominio>/actions/`.
 *
 * Pipeline:
 *   1. Resolve admin session via `serverAuthProvider.requireAdmin()`.
 *   2. Validate `metadata.ability` against CASL policies.
 *   3. Run the handler.
 *   4. Audit log success / failure.
 *   5. Map `AdminUIError` -> stable `serverError` payload for the UI.
 */

import 'server-only';
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { type Action, defineAbilitiesFor, type Subject } from '@/providers/access-control';
import { AdminUIError } from '@/providers/data';
import { serverAuthProvider } from './auth/server-session';

// ---------- Metadata contract ----------------------------------------------

const adminActionMetadataSchema = z.object({
  actionName: z.string().min(1),
  ability: z
    .object({
      action: z.custom<Action>(),
      subject: z.custom<Subject>(),
    })
    .optional(),
});

export type AdminActionMetadata = z.infer<typeof adminActionMetadataSchema>;

// ---------- Server error formatter -----------------------------------------

interface FormattedServerError {
  readonly message: string;
  readonly code: string;
  readonly context?: Record<string, unknown> | undefined;
}

function formatServerError(e: unknown): FormattedServerError {
  if (e instanceof AdminUIError) {
    return { message: e.message, code: e.code, context: e.context };
  }
  if (e instanceof Error) {
    // Only expose non-internal errors to the UI
    const isPublicError = (e as any).isPublic || e.name === 'ValidationError';
    return {
      message: isPublicError ? e.message : DEFAULT_SERVER_ERROR_MESSAGE,
      code: (e as any).code || 'INTERNAL_ERROR',
    };
  }
  return { message: DEFAULT_SERVER_ERROR_MESSAGE, code: 'UNKNOWN_ERROR' };
}

// ---------- Admin action client --------------------------------------------

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => adminActionMetadataSchema,
  handleServerError(e) {
    return formatServerError(e);
  },
})
  // 1) Authentication & Authorization --------------------------------------
  .use(async ({ next, metadata }) => {
    const sessionUser = await serverAuthProvider.requireAdmin();

    if (metadata.ability) {
      const ability = defineAbilitiesFor(sessionUser);
      if (!ability.can(metadata.ability.action, metadata.ability.subject)) {
        logger.warn('[action-provider] forbidden', {
          actionName: metadata.actionName,
          userId: sessionUser.id,
          required: metadata.ability,
        });
        const err = new AdminUIError(
          `Forbidden: missing ${metadata.ability.action} on ${metadata.ability.subject}`,
        );
        (err as any).code = 'FORBIDDEN';
        throw err;
      }
    }

    return next({ ctx: { sessionUser } });
  })
  // 2) Telemetry & Audit --------------------------------------------------
  .use(async ({ next, metadata, ctx }) => {
    const start = Date.now();
    try {
      const result = await next();

      // Only log success for non-query actions (mutations) or keep it lightweight
      if (result.success) {
        logger.info('[action-provider] success', {
          actionName: metadata.actionName,
          userId: ctx.sessionUser.id,
          durationMs: Date.now() - start,
        });
      } else {
        logger.warn('[action-provider] server error', {
          actionName: metadata.actionName,
          userId: ctx.sessionUser.id,
          error: result.serverError,
          durationMs: Date.now() - start,
        });
      }

      return result;
    } catch (error) {
      logger.error('[action-provider] unexpected crash', {
        actionName: metadata.actionName,
        userId: ctx.sessionUser.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: Date.now() - start,
      });
      throw error;
    }
  });

export const publicActionClient = createSafeActionClient({
  handleServerError(e) {
    return formatServerError(e);
  },
});
