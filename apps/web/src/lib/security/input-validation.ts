/**
 * Input Validation Utilities
 *
 * Utilities for validating and sanitizing user input
 * to prevent security vulnerabilities.
 */

import { z } from 'zod';
import { env } from '@/lib/env';

// Explicit sanitized data types
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  imageUrl: string;
}

export interface UserInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export class InputValidator {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .substring(0, 1000);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Only allow https in production for stronger guarantees
      const allowed = env.NODE_ENV === 'production' ? ['https:'] : ['http:', 'https:'];
      return allowed.includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate and sanitize product data
   */
  static validateProductData(data: unknown): {
    isValid: boolean;
    sanitizedData?: ProductInput;
    errors: string[];
  } {
    const productSchema = z.object({
      name: z
        .string()
        .min(1)
        .max(100)
        .transform((val) => InputValidator.sanitizeString(val)),
      description: z
        .string()
        .min(1)
        .max(1000)
        .transform((val) => InputValidator.sanitizeString(val)),
      price: z.number().positive(),
      stock: z.number().int().min(0),
      category: z
        .string()
        .min(1)
        .max(50)
        .transform((val) => InputValidator.sanitizeString(val)),
      sku: z.string().regex(/^[A-Z0-9-]+$/),
      imageUrl: z.string().url(),
    });

    try {
      const sanitizedData = productSchema.parse(data);
      return {
        isValid: true,
        sanitizedData,
        errors: [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors:
          error instanceof z.ZodError
            ? error.errors.map((e) => e.message)
            : ['Invalid data format'],
      };
    }
  }

  /**
   * Validate and sanitize user input
   */
  static validateUserInput(data: unknown): {
    isValid: boolean;
    sanitizedData?: UserInput;
    errors: string[];
  } {
    const userSchema = z.object({
      name: z
        .string()
        .min(1)
        .max(100)
        .transform((val) => InputValidator.sanitizeString(val)),
      email: z
        .string()
        .email()
        .transform((val) => val.toLowerCase().trim()),
      phone: z
        .string()
        .optional()
        .transform((val) => (val ? InputValidator.sanitizeString(val) : undefined)),
      address: z
        .string()
        .optional()
        .transform((val) => (val ? InputValidator.sanitizeString(val) : undefined)),
    });

    try {
      const sanitizedData = userSchema.parse(data);
      return {
        isValid: true,
        sanitizedData,
        errors: [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors:
          error instanceof z.ZodError
            ? error.errors.map((e) => e.message)
            : ['Invalid data format'],
      };
    }
  }
}

export default InputValidator;
