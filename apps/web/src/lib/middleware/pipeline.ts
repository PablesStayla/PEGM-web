/**
 * Middleware Pipeline Pattern - Fellow Level
 *
 * Composable middleware for API routes with type safety.
 * Enables clean separation of concerns: auth, rate limiting, logging, etc.
 *
 * @module lib/middleware/pipeline
 * @version 1.0
 * @since 2026-09-04
 */

import { type NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Types
// ============================================================================

export type MiddlewareContext = {
  request: NextRequest;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  rateLimitInfo?: {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  };
  startTime: number;
  metadata: Record<string, unknown>;
};

export type MiddlewareResult =
  | { success: true; response?: NextResponse; continue: boolean }
  | { success: false; response: NextResponse };

export type MiddlewareFunction = (context: MiddlewareContext) => Promise<MiddlewareResult>;

export type ApiHandler = (context: MiddlewareContext) => Promise<NextResponse>;

// ============================================================================
// Pipeline Builder
// ============================================================================

export class MiddlewarePipeline {
  private middlewares: MiddlewareFunction[] = [];

  /**
   * Add middleware to pipeline
   */
  use(middleware: MiddlewareFunction): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Compose all middlewares into a single handler
   */
  compose(handler: ApiHandler): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest): Promise<NextResponse> => {
      const context: MiddlewareContext = {
        request,
        startTime: performance.now(),
        metadata: {},
      };

      // Execute middlewares in sequence
      for (const middleware of this.middlewares) {
        const result = await middleware(context);

        if (!result.success) {
          return result.response;
        }

        if (!result.continue && result.response) {
          return result.response;
        }
      }

      // Execute final handler
      return handler(context);
    };
  }
}

// ============================================================================
// Built-in Middlewares
// ============================================================================

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  _identifier: string,
  maxRequests: number,
  windowMs: number,
): MiddlewareFunction {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    // Simplified rate limiting logic
    // In production, use Redis or similar
    context.request.headers.get('x-forwarded-for') ?? 'unknown';

    // Mock implementation - replace with actual rate limiter
    context.rateLimitInfo = {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: Date.now() + windowMs,
    };

    if (!context.rateLimitInfo.allowed) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Too many requests' }, { status: 429 }),
      };
    }

    return { success: true, continue: true };
  };
}

/**
 * Authentication middleware
 */
export function withAuth(roles?: string[]): MiddlewareFunction {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    const authHeader = context.request.headers.get('authorization');

    if (!authHeader) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    // Mock auth - replace with actual JWT verification
    context.user = {
      id: 'user-123',
      email: 'user@example.com',
      roles: ['user'],
    };

    if (roles && !roles.some((role) => context.user?.roles.includes(role))) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      };
    }

    return { success: true, continue: true };
  };
}

/**
 * Logging middleware
 */
export function withLogging(logBody: boolean = false): MiddlewareFunction {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    const { request } = context;

    request.headers.get('x-forwarded-for') ?? 'unknown';

    context.metadata.logBody = logBody;

    return { success: true, continue: true };
  };
}

/**
 * Request validation middleware
 */
export function withValidation<T>(schema: { parse: (data: unknown) => T }): MiddlewareFunction {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    try {
      let body: unknown;

      if (context.request.method !== 'GET') {
        body = await context.request.json();
      } else {
        const url = new URL(context.request.url);
        body = Object.fromEntries(url.searchParams);
      }

      const validated = schema.parse(body);
      context.metadata.validatedBody = validated;

      return { success: true, continue: true };
    } catch (error) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation failed', details: error },
          { status: 400 },
        ),
      };
    }
  };
}

/**
 * Error handling middleware
 */
export function withErrorHandler(): MiddlewareFunction {
  return async (_context: MiddlewareContext): Promise<MiddlewareResult> => {
    // This middleware runs at the end to catch errors
    return { success: true, continue: true };
  };
}

/**
 * CORS middleware
 */
export function withCORS(allowedOrigins: string[] = ['*']): MiddlewareFunction {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    const origin = context.request.headers.get('origin') ?? '*';

    context.metadata.corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (context.request.method === 'OPTIONS') {
      return {
        success: true,
        continue: false,
        response: new NextResponse(null, {
          status: 204,
          headers: context.metadata.corsHeaders as Record<string, string>,
        }),
      };
    }

    return { success: true, continue: true };
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a pipeline with common middlewares
 */
export function createPipeline(...middlewares: MiddlewareFunction[]): MiddlewarePipeline {
  const pipeline = new MiddlewarePipeline();

  for (const middleware of middlewares) {
    pipeline.use(middleware);
  }

  return pipeline;
}

/**
 * Compose multiple middlewares into one
 */
export function composeMiddleware(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return async (context: MiddlewareContext): Promise<MiddlewareResult> => {
    for (const middleware of middlewares) {
      const result = await middleware(context);
      if (!result.success || !result.continue) {
        return result;
      }
    }
    return { success: true, continue: true };
  };
}
