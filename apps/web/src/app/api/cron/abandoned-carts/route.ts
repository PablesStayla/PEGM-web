/**
 * GET /api/cron/abandoned-carts
 *
 * Cron endpoint for abandoned cart recovery.
 * Fellow-level implementation using Command and Strategy patterns.
 *
 * @module api/cron/abandoned-carts
 * @version 2.0
 * @since 2026-09-04
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAbandonedCartService, type RecoveryOptions } from '@/lib/carts/abandoned-cart-service';
import { env } from '@/lib/env';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

// ============================================================================
// Configuration
// ============================================================================

export const maxDuration = 300;

// ============================================================================
// Request Schema
// ============================================================================

const cronQuerySchema = z.object({
  hoursInactive: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30)
    .default(24),
  batchSize: z.coerce.number().int().min(1).max(1000).default(200),
  dryRun: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .default('false'),
});

// ============================================================================
// Logger
// ============================================================================

const log = createLogger({ module: 'api:cron:abandoned-carts' });

// ============================================================================
// Authentication
// ============================================================================

/**
 * Validates cron job authentication
 */
function validateAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret) {
    return true; // No secret configured, allow request
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// ============================================================================
// Request Parsing
// ============================================================================

/**
 * Parses and validates query parameters
 */
function parseQueryParams(
  request: Request,
): { success: true; data: z.infer<typeof cronQuerySchema> } | { success: false; error: string } {
  const url = new URL(request.url);

  const parsed = cronQuerySchema.safeParse({
    hoursInactive: url.searchParams.get('hoursInactive') ?? undefined,
    batchSize: url.searchParams.get('batchSize') ?? undefined,
    dryRun: url.searchParams.get('dryRun') ?? undefined,
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map((issue) => issue.message).join(', ');
    return { success: false, error: errorMessage };
  }

  return { success: true, data: parsed.data };
}

// ============================================================================
// Main Handler
// ============================================================================

const service = getAbandonedCartService();

/**
 * GET handler for abandoned cart recovery cron
 *
 * Complexity reduced from 19 to <15 using:
 * - Command Pattern for cart operations
 * - Strategy Pattern for tier classification
 * - Separation of concerns into dedicated service
 */
export async function GET(request: Request): Promise<NextResponse> {
  const start = performance.now();

  // Validate authentication
  if (!validateAuth(request)) {
    return CommonErrors.Unauthorized('Invalid cron authorization token.');
  }

  // Parse query parameters
  const parseResult = parseQueryParams(request);
  if (!parseResult.success) {
    return CommonErrors.BadRequest(parseResult.error);
  }

  const { batchSize, dryRun, hoursInactive } = parseResult.data;

  try {
    // Execute recovery using service
    const options: RecoveryOptions = {
      hoursInactive,
      batchSize,
      dryRun,
    };

    const result = await service.recover(options);

    // Log execution
    const durationMs = Math.round(performance.now() - start);
    log.info('Abandoned carts cron executed', {
      dryRun,
      hoursInactive,
      batchSize,
      processedCount: result.processedCount,
      stats: result.stats,
      durationMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    // Log error and return generic error response
    const durationMs = Math.round(performance.now() - start);
    log.error('Abandoned carts cron failed', {
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });

    return CommonErrors.InternalServerError('Failed to process abandoned carts.');
  }
}
