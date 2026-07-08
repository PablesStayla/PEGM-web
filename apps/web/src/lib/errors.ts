/**
 * @file apps/web/src/lib/errors.ts
 *
 * RFC 7807 Problem Details for HTTP APIs.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 *
 * All API routes should use CommonErrors.* to return errors.
 * This ensures every error response has consistent structure,
 * a machine-readable type URL, and correct Content-Type header.
 */

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

interface ProblemDetails {
  /** URI that identifies the problem type */
  type: string;
  /** Short, human-readable summary */
  title: string;
  /** HTTP status code */
  status: number;
  /** Human-readable explanation specific to this occurrence */
  detail?: string;
  /** URI that identifies the specific occurrence */
  instance?: string;
  [key: string]: unknown;
}

/**
 * Build an RFC 7807 Problem Details object.
 */
export function problemDetails(
  status: number,
  title: string,
  detail?: string,
  type?: string,
  extensions?: Record<string, unknown>,
): ProblemDetails {
  return {
    type: type ?? `https://pranakaia.cl/errors/${status}`,
    title,
    status,
    ...(detail !== undefined ? { detail } : {}),
    // instance identifies this specific occurrence for support lookups
    // Use VERCEL_DEPLOYMENT_ID (immutable) not VERCEL_URL (preview-specific)
    instance: env.VERCEL_DEPLOYMENT_ID
      ? `https://pranakaia.cl/errors/instances/${env.VERCEL_DEPLOYMENT_ID}`
      : undefined,
    ...extensions,
  };
}

/**
 * Build a NextResponse with RFC 7807 body and correct Content-Type.
 */
export function problemResponse(
  status: number,
  title: string,
  detail?: string,
  type?: string,
  extensions?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(problemDetails(status, title, detail, type, extensions), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

/**
 * Pre-built error responses for common HTTP status codes.
 *
 * @example
 * return CommonErrors.NotFound('Product with slug "xyz" was not found.');
 * return CommonErrors.UnprocessableEntity('Validation failed', { fields });
 */
export const CommonErrors = {
  BadRequest: (detail?: string, extensions?: Record<string, unknown>) =>
    problemResponse(400, 'Bad Request', detail, undefined, extensions),

  Unauthorized: (detail?: string) => problemResponse(401, 'Unauthorized', detail),

  Forbidden: (detail?: string) => problemResponse(403, 'Forbidden', detail),

  NotFound: (detail?: string) => problemResponse(404, 'Not Found', detail),

  Conflict: (detail?: string) => problemResponse(409, 'Conflict', detail),

  UnprocessableEntity: (detail?: string, extensions?: Record<string, unknown>) =>
    problemResponse(422, 'Unprocessable Entity', detail, undefined, extensions),

  TooManyRequests: (detail?: string, retryAfterSeconds = 60) =>
    problemResponse(
      429,
      'Too Many Requests',
      detail ?? 'Rate limit exceeded. Please slow down and try again later.',
      undefined,
      { retryAfter: retryAfterSeconds },
    ),

  InternalServerError: (detail?: string) =>
    problemResponse(
      500,
      'Internal Server Error',
      env.NODE_ENV !== 'production'
        ? (detail ?? 'An unexpected error occurred.')
        : 'An unexpected error occurred. Our team has been notified.',
    ),

  ServiceUnavailable: (detail?: string) => problemResponse(503, 'Service Unavailable', detail),
} as const;
