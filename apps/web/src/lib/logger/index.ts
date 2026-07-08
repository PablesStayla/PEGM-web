/**
 * Structured Logger using console
 * ENTERPRISE implementation for observability
 */

import { env } from '@/lib/env';

const isDevelopment = env.NODE_ENV === 'development';

// Simple logger implementation using console
interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private context: Record<string, unknown> = {};

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      level,
      message,
      timestamp,
      context: { ...this.context, ...context },
    };

    if (isDevelopment) {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    }

    return JSON.stringify(entry);
  }

  info(_context: Record<string, unknown>, _message?: string) {}

  warn(context: Record<string, unknown>, message?: string) {
    console.warn(this.formatMessage('warn', message || '', context));
  }

  error(context: Record<string, unknown>, message?: string) {
    console.error(this.formatMessage('error', message || '', context));
  }

  debug(_context: Record<string, unknown>, _message?: string) {
    if (isDevelopment) {
    }
  }

  child(additionalContext: Record<string, unknown>) {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

// Create logger instance
export const logger = new Logger({
  env: env.NODE_ENV,
  revision: env.VERCEL_GIT_COMMIT_SHA,
});

/**
 * Child logger with additional context
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Logger for specific modules
 */
export const loggers = {
  auth: createLogger({ module: 'auth' }),
  payment: createLogger({ module: 'payment' }),
  order: createLogger({ module: 'order' }),
  api: createLogger({ module: 'api' }),
  database: createLogger({ module: 'database' }),
  cache: createLogger({ module: 'cache' }),
};

/**
 * Request logger middleware
 */
export function logRequest(
  method: string,
  url: string,
  duration: number,
  statusCode: number,
  userId?: string,
) {
  logger.info(
    {
      type: 'http_request',
      method,
      url,
      duration_ms: duration,
      status_code: statusCode,
      user_id: userId,
    },
    `${method} ${url} ${statusCode} ${duration}ms`,
  );
}

/**
 * Error logger
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error(
    {
      type: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    },
    error.message,
  );
}

/**
 * Business event logger
 */
export function logEvent(eventName: string, data?: Record<string, unknown>) {
  logger.info(
    {
      type: 'business_event',
      event_name: eventName,
      ...data,
    },
    eventName,
  );
}

/**
 * Performance logger
 */
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>,
) {
  logger.info(
    {
      type: 'performance',
      operation,
      duration_ms: duration,
      ...metadata,
    },
    `${operation} took ${duration}ms`,
  );
}

/**
 * Helper to time async operations
 */
export async function timeOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logPerformance(operation, duration, { success: true });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logPerformance(operation, duration, { success: false });
    throw error;
  }
}

export default logger;
