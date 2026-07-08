/**
 * @file apps/web/src/app/api/shipping/calculate/route.ts
 *
 * POST /api/shipping/calculate
 *
 * Calculates available shipping rates for a given Chilean destination.
 * Returns all applicable rates including free-shipping threshold logic.
 *
 * Rate limit: 30 req / min per IP (checkout-adjacent endpoint).
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DrizzleShippingRepository } from '@/infrastructure/repositories/drizzle-shipping-repository';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:shipping:calculate' });

// Lazily initialised to avoid module-level DB connections in test/build environments
let _shippingRepo: DrizzleShippingRepository | null = null;
function getShippingRepo(): DrizzleShippingRepository {
  _shippingRepo ??= new DrizzleShippingRepository();
  return _shippingRepo;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const calculateSchema = z.object({
  /** ISO 3166-1 alpha-2 country code (e.g. 'CL') */
  country: z.string().length(2).toUpperCase(),
  postalCode: z.string().min(5).max(10),
  /** Region name (e.g. 'Región Metropolitana') */
  region: z.string().min(2).max(100).optional(),
  /** Product weight in kg */
  weight: z.number().positive().max(1000).optional(),
  /** Cart subtotal in CLP (used for free-shipping threshold) */
  orderTotal: z.number().int().nonnegative(),
});

// ── POST /api/shipping/calculate ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const start = performance.now();

  const rl = await rateLimit(request, 'shipping:calculate:POST', 30, 60);
  if (!rl.allowed) {
    const res = CommonErrors.TooManyRequests('Too many shipping calculation requests.');
    applyRateLimitHeaders(res, rl);
    return res;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return CommonErrors.BadRequest('Request body must be valid JSON.');
  }

  const parsed = calculateSchema.safeParse(body);
  if (!parsed.success) {
    return CommonErrors.UnprocessableEntity(
      `Validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      { fields: parsed.error.flatten().fieldErrors },
    );
  }

  const { country, postalCode, orderTotal, region } = parsed.data;

  try {
    const repo = getShippingRepo();
    const zone = await repo.findZoneByRegion(region ?? '', country);

    if (!zone) {
      log.info('No shipping zone found for location', { country, region, postalCode });
      return CommonErrors.NotFound(
        `Shipping is not available for ${region ?? country} (${postalCode}). ` +
          'Please contact support for custom shipping arrangements.',
      );
    }

    const rates = await repo.getRatesForZone(zone.id);

    const availableRates = rates.map((rate) => {
      const isFree =
        typeof rate.freeOver === 'number' && rate.freeOver > 0 && orderTotal >= rate.freeOver;
      return {
        id: rate.id,
        name: rate.name,
        /** Price the customer pays in CLP */
        price: isFree ? 0 : rate.price,
        /** Original price before free-shipping discount */
        originalPrice: rate.price,
        estimatedDays: {
          min: rate.minDays ?? 1,
          max: rate.maxDays ?? 7,
        },
        isFree,
        freeOver: rate.freeOver ?? null,
        zone: zone.name,
      };
    });

    const durationMs = Math.round(performance.now() - start);
    log.info('Shipping rates calculated', {
      country,
      region,
      zoneId: zone.id,
      ratesCount: availableRates.length,
      durationMs,
    });

    const res = NextResponse.json({
      data: availableRates,
      meta: { country, postalCode, zone: zone.name },
    });
    applyRateLimitHeaders(res, rl);
    return res;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Shipping calculation failed', {
      country,
      region,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    return CommonErrors.InternalServerError(
      'Unable to calculate shipping rates at this time. Please try again.',
    );
  }
}
