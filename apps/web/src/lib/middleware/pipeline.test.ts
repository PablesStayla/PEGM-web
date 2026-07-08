/**
 * @fileoverview Tests for Middleware Pipeline Pattern
 *
 * @module @pranakaia/web/middleware/tests
 * @author Claude Code Fellow Engineer
 * @since 2026-09-04
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import {
  createPipeline,
  type MiddlewareContext,
  MiddlewarePipeline,
  withAuth,
  withCORS,
  withErrorHandler,
  withLogging,
  withRateLimit,
  withValidation,
} from './pipeline';

// =============================================================================
// Test Fixtures
// =============================================================================

type MockRequestInit = Omit<RequestInit, 'signal'> & {
  signal?: AbortSignal;
};

const createMockRequest = (overrides?: MockRequestInit): NextRequest => {
  const { signal, ...rest } = overrides ?? {};

  return new NextRequest('http://localhost/api/test', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...rest,
    ...(signal ? { signal } : {}),
  });
};

const createMockContext = (overrides?: Partial<MiddlewareContext>): MiddlewareContext => ({
  request: createMockRequest(),
  startTime: performance.now(),
  metadata: {},
  ...overrides,
});

// =============================================================================
// Middleware Pipeline Tests
// =============================================================================

describe('MiddlewarePipeline', () => {
  describe('Basic Operations', () => {
    it('should execute middlewares in order and call final handler', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      const executionOrder: string[] = [];

      pipeline.use(async (_ctx) => {
        executionOrder.push('middleware-1');
        return { success: true, continue: true };
      });

      pipeline.use(async (_ctx) => {
        executionOrder.push('middleware-2');
        return { success: true, continue: true };
      });

      const handler = vi.fn(async () => {
        executionOrder.push('handler');
        return NextResponse.json({ success: true });
      });

      const composed = pipeline.compose(handler);
      const request = createMockRequest();

      // Act
      await composed(request);

      // Assert
      expect(executionOrder).toEqual(['middleware-1', 'middleware-2', 'handler']);
      expect(handler).toHaveBeenCalled();
    });

    it('should support method chaining with use()', () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();

      // Act
      const result = pipeline
        .use(async () => ({ success: true, continue: true }))
        .use(async () => ({ success: true, continue: true }));

      // Assert
      expect(result).toBe(pipeline);
    });

    it('should execute handler with correct context', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      const handler = vi.fn(async (_ctx: MiddlewareContext) => NextResponse.json({}));

      pipeline.use(async (ctx) => {
        ctx.metadata.test = 'value';
        return { success: true, continue: true };
      });

      const composed = pipeline.compose(handler);
      const request = createMockRequest();

      // Act
      await composed(request);

      // Assert
      const contextArg = handler.mock.calls[0]?.[0];
      expect(contextArg).toBeDefined();
      if (!contextArg) {
        throw new Error('Expected handler to receive middleware context');
      }
      expect(contextArg.metadata.test).toBe('value');
      expect(contextArg.request).toBe(request);
      expect(contextArg.startTime).toBeDefined();
    });
  });

  describe('Middleware Chain Control', () => {
    it('should stop chain when middleware returns success: false', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      const errorResponse = NextResponse.json({ error: 'Blocked' }, { status: 403 });

      pipeline.use(async () => ({
        success: false,
        response: errorResponse,
      }));

      pipeline.use(async () => ({
        success: true,
        continue: true,
      }));

      const handler = vi.fn(async () => NextResponse.json({}));
      const composed = pipeline.compose(handler);

      // Act
      const result = await composed(createMockRequest());

      // Assert
      expect(result.status).toBe(403);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should stop chain when middleware returns continue: false with response', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      const cachedResponse = NextResponse.json({ cached: true });

      pipeline.use(async () => ({
        success: true,
        continue: false,
        response: cachedResponse,
      }));

      const handler = vi.fn(async () => NextResponse.json({}));
      const composed = pipeline.compose(handler);

      // Act
      const result = await composed(createMockRequest());

      // Assert
      expect(result).toBe(cachedResponse);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should continue chain when middleware returns continue: true', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      const handler = vi.fn(async () => NextResponse.json({ success: true }));

      pipeline.use(async () => ({
        success: true,
        continue: true,
      }));

      const composed = pipeline.compose(handler);

      // Act
      await composed(createMockRequest());

      // Assert
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Empty Pipeline', () => {
    it('should execute handler directly with empty pipeline', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      const handler = vi.fn(async () => NextResponse.json({ data: 'test' }));
      const composed = pipeline.compose(handler);

      // Act
      const result = await composed(createMockRequest());

      // Assert
      expect(handler).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });
  });
});

// =============================================================================
// Built-in Middleware Tests
// =============================================================================

describe('Built-in Middlewares', () => {
  describe('withRateLimit', () => {
    it('should allow request when under limit', async () => {
      // Arrange
      const middleware = withRateLimit('test', 100, 60000);
      const context = createMockContext();

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected middleware success');
      }
      expect(result.continue).toBe(true);
      expect(context.rateLimitInfo).toBeDefined();
      expect(context.rateLimitInfo?.allowed).toBe(true);
    });

    it('should set rate limit info in context', async () => {
      // Arrange
      const middleware = withRateLimit('test', 10, 60000);
      const context = createMockContext();

      // Act
      await middleware(context);

      // Assert
      expect(context.rateLimitInfo).toMatchObject({
        allowed: true,
        remaining: 9,
        resetTime: expect.any(Number),
      });
    });
  });

  describe('withAuth', () => {
    it('should reject request without authorization header', async () => {
      // Arrange
      const middleware = withAuth();
      const context = createMockContext();

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(401);
      }
    });

    it('should allow request with authorization header', async () => {
      // Arrange
      const middleware = withAuth();
      const request = createMockRequest({
        headers: {
          Authorization: 'Bearer token123',
        },
      });
      const context = createMockContext({ request });

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected middleware success');
      }
      expect(result.continue).toBe(true);
      expect(context.user).toBeDefined();
    });

    it('should check required roles', async () => {
      // Arrange
      const middleware = withAuth(['admin']);
      const request = createMockRequest({
        headers: {
          Authorization: 'Bearer token123',
        },
      });
      const context = createMockContext({ request });

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(403);
      }
    });
  });

  describe('withLogging', () => {
    it('should attach logging metadata to context', async () => {
      // Arrange
      const middleware = withLogging();
      const context = createMockContext();

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(true);
      expect(context.metadata.logBody).toBe(false);
    });
  });

  describe('withErrorHandler', () => {
    it('should behave as pass-through middleware', async () => {
      // Arrange
      const middleware = withErrorHandler();
      const context = createMockContext();

      // Act
      const result = await middleware(context);

      // Assert
      expect(result).toEqual({ success: true, continue: true });
    });

    it('should allow successful requests to pass through', async () => {
      // Arrange
      const pipeline = new MiddlewarePipeline();
      pipeline.use(withErrorHandler());

      const handler = vi.fn(async () => NextResponse.json({ success: true }));
      const composed = pipeline.compose(handler);

      // Act
      const result = await composed(createMockRequest());

      // Assert
      expect(result.status).toBe(200);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('withCORS', () => {
    it('should add CORS headers to context metadata', async () => {
      // Arrange
      const middleware = withCORS(['https://example.com']);
      const request = createMockRequest({
        headers: {
          Origin: 'https://example.com',
        },
      });
      const context = createMockContext({ request });

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected middleware success');
      }
      expect(result.continue).toBe(true);

      const corsHeaders = context.metadata.corsHeaders as Record<string, string>;
      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('https://example.com');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('GET');
    });

    it('should handle preflight requests', async () => {
      // Arrange
      const middleware = withCORS(['*']);
      const request = createMockRequest({ method: 'OPTIONS' });
      const context = createMockContext({ request });

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.continue).toBe(false);
        expect(result.response?.status).toBe(204);
      }
    });
  });

  describe('withValidation', () => {
    it('should validate request body successfully', async () => {
      // Arrange
      const schema = {
        parse: vi.fn().mockReturnValue({ name: 'test' }),
      };
      const middleware = withValidation(schema as unknown as Parameters<typeof withValidation>[0]);

      const request = createMockRequest({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      });
      const context = createMockContext({ request });

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(true);
      expect(context.metadata.validatedBody).toEqual({ name: 'test' });
    });

    it('should reject invalid request body', async () => {
      // Arrange
      const schema = {
        parse: vi.fn().mockImplementation(() => {
          throw new Error('Validation failed');
        }),
      };
      const middleware = withValidation(schema as unknown as Parameters<typeof withValidation>[0]);

      const request = createMockRequest({
        method: 'POST',
        body: JSON.stringify({}),
      });
      const context = createMockContext({ request });

      // Act
      const result = await middleware(context);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
      }
    });
  });
});

// =============================================================================
// Pipeline Factory Tests
// =============================================================================

describe('createPipeline', () => {
  it('should create a pipeline with provided middlewares', async () => {
    // Arrange
    const middleware1 = vi.fn().mockResolvedValue({ success: true, continue: true });
    const middleware2 = vi.fn().mockResolvedValue({ success: true, continue: true });
    const handler = vi.fn().mockResolvedValue(NextResponse.json({}));

    // Act
    const composed = createPipeline(middleware1, middleware2).compose(handler);
    await composed(createMockRequest());

    // Assert
    expect(middleware1).toHaveBeenCalled();
    expect(middleware2).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('should create an empty pipeline when no middlewares provided', async () => {
    // Arrange
    const handler = vi.fn().mockResolvedValue(NextResponse.json({}));

    // Act
    const composed = createPipeline().compose(handler);
    await composed(createMockRequest());

    // Assert
    expect(handler).toHaveBeenCalled();
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Pipeline Integration', () => {
  it('should handle complete request lifecycle', async () => {
    // Arrange
    const pipeline = new MiddlewarePipeline();
    const executionLog: string[] = [];

    // Add logging middleware
    pipeline.use(async (ctx) => {
      executionLog.push('logging');
      ctx.metadata.startedAt = Date.now();
      return { success: true, continue: true };
    });

    // Add auth middleware
    pipeline.use(async (ctx) => {
      executionLog.push('auth');
      ctx.user = { id: '123', email: 'test@test.com', roles: ['user'] };
      return { success: true, continue: true };
    });

    // Add rate limiting
    pipeline.use(async (ctx) => {
      executionLog.push('rate-limit');
      ctx.rateLimitInfo = { allowed: true, remaining: 99, resetTime: Date.now() + 60000 };
      return { success: true, continue: true };
    });

    const handler = vi.fn(async (ctx) => {
      executionLog.push('handler');
      return NextResponse.json({
        user: ctx.user,
        rateLimit: ctx.rateLimitInfo,
      });
    });

    const composed = pipeline.compose(handler);

    // Act
    const result = await composed(createMockRequest());

    // Assert
    expect(executionLog).toEqual(['logging', 'auth', 'rate-limit', 'handler']);
    expect(result.status).toBe(200);

    const body = await result.json();
    expect(body.user).toBeDefined();
    expect(body.rateLimit).toBeDefined();
  });

  it('should handle error in middleware chain', async () => {
    // Arrange
    const pipeline = new MiddlewarePipeline();

    pipeline.use(async (_ctx) => {
      throw new Error('Middleware error');
    });

    const handler = vi.fn(async () => NextResponse.json({}));
    const composed = pipeline.compose(handler);

    // Act
    await expect(composed(createMockRequest())).rejects.toThrow('Middleware error');

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('should preserve context across middleware chain', async () => {
    // Arrange
    const pipeline = new MiddlewarePipeline();

    pipeline.use(async (ctx) => {
      ctx.metadata.step1 = 'complete';
      return { success: true, continue: true };
    });

    pipeline.use(async (ctx) => {
      ctx.metadata.step2 = 'complete';
      ctx.metadata.previousStep = ctx.metadata.step1;
      return { success: true, continue: true };
    });

    const handler = vi.fn(async (ctx) => {
      return NextResponse.json({
        step1: ctx.metadata.step1,
        step2: ctx.metadata.step2,
        previousStep: ctx.metadata.previousStep,
      });
    });

    const composed = pipeline.compose(handler);

    // Act
    const result = await composed(createMockRequest());

    // Assert
    const body = await result.json();
    expect(body.step1).toBe('complete');
    expect(body.step2).toBe('complete');
    expect(body.previousStep).toBe('complete');
  });
});
