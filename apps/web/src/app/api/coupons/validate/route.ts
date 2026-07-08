/**
 * POST /api/coupons/validate
 *
 * Validates a coupon code against order context.
 * Fellow-level implementation using Strategy and Chain of Responsibility patterns.
 *
 * @module api/coupons/validate
 * @version 2.0
 * @since 2026-09-04
 */

import { coupons, db, eq } from '@pranakaia/infrastructure/db';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  type Coupon,
  getCouponValidator,
  type ValidationContext,
} from '@/lib/coupons/coupon-validator';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';

// ============================================================================
// Request Schema
// ============================================================================

const validateRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .transform((value) => value.toUpperCase()),
  customerId: z.string().uuid().optional(),
  orderTotal: z.number().positive(),
  currency: z.string().trim().length(3).optional().default('CLP'),
});

// ============================================================================
// Logger
// ============================================================================

const log = createLogger({ module: 'api:coupons:validate' });

// ============================================================================
// Database Queries
// ============================================================================

/**
 * Fetches coupon by code from database
 */
async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const [coupon] = await db
    .select({
      id: coupons.id,
      code: coupons.code,
      name: coupons.name,
      description: coupons.description,
      type: coupons.type,
      value: coupons.value,
      minAmount: coupons.minAmount,
      maxDiscount: coupons.maxDiscount,
      usageLimit: coupons.usageLimit,
      usageCount: coupons.usageCount,
      perCustomerLimit: coupons.perCustomerLimit,
      startsAt: coupons.startsAt,
      expiresAt: coupons.expiresAt,
      isActive: coupons.isActive,
    })
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);

  return coupon ?? null;
}

// ============================================================================
// Request Parsing
// ============================================================================

/**
 * Parses and validates request body
 */
async function parseRequestBody(
  request: NextRequest,
): Promise<
  { success: true; data: z.infer<typeof validateRequestSchema> } | { success: false; error: string }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { success: false, error: 'Request body must be valid JSON.' };
  }

  const parsed = validateRequestSchema.safeParse(body);

  if (!parsed.success) {
    const errorMessage = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    return { success: false, error: errorMessage };
  }

  return { success: true, data: parsed.data };
}

// ============================================================================
// Response Builders
// ============================================================================

interface SuccessValidationResult {
  valid: true;
  coupon: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: string;
    value: number;
    minAmount: number | null;
    maxDiscount: number | null;
    startsAt: Date | string;
    expiresAt: Date | string | null;
    usage: {
      used: number;
      limit: number | null;
      remaining: number | null;
    };
  };
  order: {
    originalTotal: number;
    discountAmount: number;
    finalTotal: number;
    currency: string;
    freeShipping: boolean;
  };
}

interface FailureValidationResult {
  valid: false;
  reason: string;
  metadata?: { minAmount?: number };
}

type ValidationResult = SuccessValidationResult | FailureValidationResult;

/**
 * Builds success response with rate limit headers
 */
function buildSuccessResponse(
  result: SuccessValidationResult,
  rateLimitInfo: Awaited<ReturnType<typeof rateLimit>>,
): NextResponse {
  const response = NextResponse.json({
    valid: true,
    coupon: result.coupon,
    order: result.order,
  });

  applyRateLimitHeaders(response, rateLimitInfo);
  return response;
}

/**
 * Builds validation failure response
 */
function buildValidationFailureResponse(
  result: FailureValidationResult,
  rateLimitInfo: Awaited<ReturnType<typeof rateLimit>>,
): NextResponse {
  const responseBody: Record<string, unknown> = {
    valid: false,
    reason: result.reason,
  };

  if (result.metadata?.minAmount !== undefined) {
    responseBody.minAmount = result.metadata.minAmount;
  }

  const response = NextResponse.json(responseBody);
  applyRateLimitHeaders(response, rateLimitInfo);
  return response;
}

// ============================================================================
// Main Handler
// ============================================================================

const validator = getCouponValidator();

/**
 * POST handler for coupon validation
 *
 * Complexity reduced from 28 to <15 using:
 * - Strategy Pattern for discount calculation
 * - Chain of Responsibility for validation rules
 * - Separation of concerns into focused functions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const start = performance.now();

  try {
    // Apply rate limiting
    const rateLimitInfo = await rateLimit(request, 'coupons:validate:POST', 60, 60);
    if (!rateLimitInfo.allowed) {
      const response = CommonErrors.TooManyRequests(
        'Too many coupon validation attempts. Please wait.',
      );
      applyRateLimitHeaders(response, rateLimitInfo);
      return response;
    }

    // Parse request body
    const parseResult = await parseRequestBody(request);
    if (!parseResult.success) {
      const response = CommonErrors.BadRequest(parseResult.error);
      applyRateLimitHeaders(response, rateLimitInfo);
      return response;
    }

    // Fetch coupon from database
    const coupon = await fetchCouponByCode(parseResult.data.code);

    // Build validation context
    const validationContext: ValidationContext = {
      code: parseResult.data.code,
      customerId: parseResult.data.customerId,
      orderTotal: parseResult.data.orderTotal,
      currency: parseResult.data.currency.toUpperCase(),
    };

    // Validate coupon
    const validationResult = (await validator.validate(
      coupon,
      validationContext,
    )) as ValidationResult;

    // Build response based on validation result
    const response = validationResult.valid
      ? buildSuccessResponse(validationResult, rateLimitInfo)
      : buildValidationFailureResponse(validationResult, rateLimitInfo);

    // Log success
    log.info('Coupon validated', {
      code: parseResult.data.code,
      customerId: parseResult.data.customerId ?? null,
      couponType: coupon?.type ?? null,
      valid: validationResult.valid,
      reason: !validationResult.valid ? validationResult.reason : null,
      durationMs: Math.round(performance.now() - start),
    });

    return response;
  } catch (error) {
    // Log error and return generic error response
    log.error('Error validating coupon', {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - start),
    });

    return CommonErrors.InternalServerError('Failed to validate coupon at this time.');
  }
}
