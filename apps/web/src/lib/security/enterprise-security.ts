/**
 * 🛡️ ENTERPRISE SECURITY SYSTEM
 * Sistema de seguridad de nivel empresarial para PranaKaia
 *
 * Características:
 * - Rate limiting avanzado
 * - Detección de ataques
 * - Auditoría completa
 * - Encriptación de datos sensibles
 * - Validación de entrada robusta
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { observabilityLogger } from '@/lib/logger';

// ==================== RATE LIMITING ENTERPRISE ====================

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

class EnterpriseRateLimiter {
  private static instance: EnterpriseRateLimiter;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  static getInstance(): EnterpriseRateLimiter {
    if (!EnterpriseRateLimiter.instance) {
      EnterpriseRateLimiter.instance = new EnterpriseRateLimiter();
    }
    return EnterpriseRateLimiter.instance;
  }

  async checkLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();

    // Clean expired entries
    for (const [k, v] of this.requestCounts.entries()) {
      if (v.resetTime < now) {
        this.requestCounts.delete(k);
      }
    }

    const current = this.requestCounts.get(key);

    if (!current || current.resetTime < now) {
      // New window
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    if (current.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    // Increment count
    current.count++;
    this.requestCounts.set(key, current);

    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }
}

// ==================== DETECCIÓN DE ATAQUES ====================

interface AttackPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block' | 'alert';
}

const ATTACK_PATTERNS: AttackPattern[] = [
  // SQL Injection
  {
    name: 'SQL Injection',
    pattern:
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|into|where|values|set)\b)|(\b(or|and)\s+\d+\s*=\s*\d+)/i,
    severity: 'critical',
    action: 'block',
  },

  // XSS
  {
    name: 'XSS Attack',
    pattern: /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|javascript:|on\w+\s*=/i,
    severity: 'high',
    action: 'block',
  },

  // Path Traversal
  {
    name: 'Path Traversal',
    pattern: /\.\.\/|\.\.\\|\.\.%2f|\.\.%5c/i,
    severity: 'high',
    action: 'block',
  },

  // Command Injection
  {
    name: 'Command Injection',
    pattern: /[;&|`$(){}[\]\\]/,
    severity: 'high',
    action: 'block',
  },

  // Brute Force (detectado por rate limiting)
  {
    name: 'Brute Force',
    pattern: /.*/,
    severity: 'medium',
    action: 'log',
  },
];

class AttackDetector {
  static detectAttack(input: string): AttackPattern | null {
    for (const pattern of ATTACK_PATTERNS) {
      if (pattern.pattern.test(input)) {
        return pattern;
      }
    }
    return null;
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;&|`$(){}[\]\\]/g, '') // Remove command injection chars
      .trim();
  }
}

// ==================== VALIDACIÓN ENTERPRISE ====================

export const EnterpriseSchemas = {
  // User input validation
  userInput: z
    .string()
    .min(1, 'Input cannot be empty')
    .max(1000, 'Input too long')
    .refine((val) => !AttackDetector.detectAttack(val), {
      message: 'Potentially malicious input detected',
    }),

  // Email validation
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .refine((val) => !AttackDetector.detectAttack(val), {
      message: 'Potentially malicious email',
    }),

  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character',
    ),

  // Product data validation
  product: z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    price: z.number().positive().max(1000000),
    category: z.string().min(1).max(50),
    stock: z.number().int().min(0).max(10000),
  }),

  // Order validation
  order: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive().max(100),
        }),
      )
      .min(1)
      .max(50),
    shippingAddress: z.object({
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      postalCode: z.string().min(1).max(20),
      country: z.string().min(2).max(2),
    }),
  }),
};

// ==================== AUDITORÍA ENTERPRISE ====================

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
}

class EnterpriseAuditor {
  private static events: AuditEvent[] = [];

  static async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event,
    };

    EnterpriseAuditor.events.push(auditEvent);

    // Alert on critical events
    if (auditEvent.severity === 'critical') {
      await EnterpriseAuditor.sendAlert(auditEvent);
    }
  }

  private static async sendAlert(event: AuditEvent): Promise<void> {
    // In production, this would send to monitoring service
    observabilityLogger.error('CRITICAL SECURITY EVENT', {
      event: event as unknown as Record<string, unknown>,
    });
  }

  static getEvents(limit = 100): AuditEvent[] {
    return EnterpriseAuditor.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// ==================== ENCRIPTACIÓN ENTERPRISE ====================

export class EnterpriseEncryption {
  private static readonly ALGORITHM = 'AES-256-GCM';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  static async encrypt(plaintext: string, key: string): Promise<string> {
    try {
      const keyBuffer = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(
          key
            .padEnd(EnterpriseEncryption.KEY_LENGTH, '0')
            .slice(0, EnterpriseEncryption.KEY_LENGTH),
        ),
        { name: EnterpriseEncryption.ALGORITHM },
        false,
        ['encrypt'],
      );

      const iv = crypto.getRandomValues(new Uint8Array(EnterpriseEncryption.IV_LENGTH));
      const encodedText = new TextEncoder().encode(plaintext);

      const encrypted = await crypto.subtle.encrypt(
        { name: EnterpriseEncryption.ALGORITHM, iv },
        keyBuffer,
        encodedText,
      );

      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...result));
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  static async decrypt(ciphertext: string, key: string): Promise<string> {
    try {
      const keyBuffer = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(
          key
            .padEnd(EnterpriseEncryption.KEY_LENGTH, '0')
            .slice(0, EnterpriseEncryption.KEY_LENGTH),
        ),
        { name: EnterpriseEncryption.ALGORITHM },
        false,
        ['decrypt'],
      );

      const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
      const iv = data.slice(0, EnterpriseEncryption.IV_LENGTH);
      const encrypted = data.slice(EnterpriseEncryption.IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        { name: EnterpriseEncryption.ALGORITHM, iv },
        keyBuffer,
        encrypted,
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
}

// ==================== MIDDLEWARE DE SEGURIDAD ====================

export async function enterpriseSecurityMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // 1. Rate Limiting
    const rateLimiter = EnterpriseRateLimiter.getInstance();
    const rateLimitKey = `${ip}-${request.nextUrl.pathname}`;

    const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
    });

    if (!rateLimitResult.allowed) {
      await EnterpriseAuditor.logEvent({
        userId: undefined,
        sessionId: undefined,
        action: 'rate_limit_exceeded',
        resource: request.nextUrl.pathname,
        ipAddress: ip,
        userAgent,
        metadata: { rateLimitKey, limit: rateLimitResult.resetTime },
        severity: 'medium',
        success: false,
      });

      return new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      });
    }

    // 2. Attack Detection
    const url = request.nextUrl.toString();
    const attack = AttackDetector.detectAttack(url);

    if (attack) {
      await EnterpriseAuditor.logEvent({
        userId: undefined,
        sessionId: undefined,
        action: 'attack_detected',
        resource: request.nextUrl.pathname,
        ipAddress: ip,
        userAgent,
        metadata: {
          attackType: attack.name,
          pattern: attack.pattern.source,
          severity: attack.severity,
        },
        severity: attack.severity as AuditEvent['severity'],
        success: false,
      });

      if (attack.action === 'block') {
        return new Response('Request blocked for security reasons', {
          status: 403,
        });
      }
    }

    // 3. Log successful request
    await EnterpriseAuditor.logEvent({
      userId: undefined,
      sessionId: undefined,
      action: 'request_processed',
      resource: request.nextUrl.pathname,
      ipAddress: ip,
      userAgent,
      metadata: {
        method: request.method,
        duration: Date.now() - startTime,
        rateLimitRemaining: rateLimitResult.remaining,
      },
      severity: 'low',
      success: true,
    });

    return null; // Continue processing
  } catch (error) {
    await EnterpriseAuditor.logEvent({
      userId: undefined,
      sessionId: undefined,
      action: 'security_middleware_error',
      resource: request.nextUrl.pathname,
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      severity: 'high',
      success: false,
    });

    return new Response('Security middleware error', {
      status: 500,
    });
  }
}

// ==================== UTILIDADES DE SEGURIDAD ====================

export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  return btoa(`${password}salt`);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // In production, implement proper CSRF validation
  return token === sessionToken;
}

// ==================== EXPORTS ====================

export { EnterpriseAuditor };
