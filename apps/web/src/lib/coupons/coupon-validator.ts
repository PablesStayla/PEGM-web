/**
 * Coupon Validation Service - Fellow Level Architecture
 *
 * Implements Strategy Pattern for coupon types and Chain of Responsibility
 * for validation rules. Extensible, testable, and maintainable.
 *
 * @module lib/coupons/coupon-validator
 * @version 2.0
 * @since 2026-09-04
 */

import { and, count, couponRedemptions, db, eq } from '@pranakaia/infrastructure/db';

// ============================================================================
// Domain Types
// ============================================================================

export const CouponType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_SHIPPING: 'free_shipping',
} as const;

export type CouponTypeValue = (typeof CouponType)[keyof typeof CouponType];

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: CouponTypeValue;
  value: number | string | null;
  minAmount: number | string | null;
  maxDiscount: number | string | null;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  startsAt: Date | string;
  expiresAt: Date | string | null;
  isActive: boolean;
}

export interface ValidationContext {
  code: string;
  customerId?: string;
  orderTotal: number;
  currency: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: ValidationFailureReason;
  coupon?: ValidatedCoupon;
  order?: OrderDiscount;
  metadata?: Record<string, unknown>;
}

export interface ValidatedCoupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: CouponTypeValue;
  value: number;
  minAmount: number | null;
  maxDiscount: number | null;
  startsAt: Date | string;
  expiresAt: Date | string | null;
  usage: CouponUsage;
}

export interface CouponUsage {
  used: number;
  limit: number | null;
  remaining: number | null;
}

export interface OrderDiscount {
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
  freeShipping: boolean;
}

export type ValidationFailureReason =
  | 'COUPON_NOT_FOUND'
  | 'COUPON_INACTIVE'
  | 'COUPON_NOT_STARTED'
  | 'COUPON_EXPIRED'
  | 'MIN_AMOUNT_NOT_MET'
  | 'USAGE_LIMIT_REACHED'
  | 'PER_CUSTOMER_LIMIT_REACHED';

// ============================================================================
// Strategy Pattern: Discount Calculation Strategies
// ============================================================================

/**
 * Strategy interface for discount calculation
 */
interface DiscountStrategy {
  readonly type: CouponTypeValue;
  calculate(orderTotal: number, couponValue: number, maxDiscount: number | null): number;
}

/**
 * Percentage discount strategy
 */
class PercentageDiscountStrategy implements DiscountStrategy {
  readonly type = CouponType.PERCENTAGE;

  calculate(orderTotal: number, couponValue: number, maxDiscount: number | null): number {
    const discountAmount = this.roundMoney((orderTotal * couponValue) / 100);
    return maxDiscount !== null ? Math.min(discountAmount, maxDiscount) : discountAmount;
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

/**
 * Fixed amount discount strategy
 */
class FixedDiscountStrategy implements DiscountStrategy {
  readonly type = CouponType.FIXED;

  calculate(orderTotal: number, couponValue: number): number {
    return Math.min(orderTotal, this.roundMoney(couponValue));
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

/**
 * Free shipping discount strategy
 */
class FreeShippingDiscountStrategy implements DiscountStrategy {
  readonly type = CouponType.FREE_SHIPPING;

  calculate(): number {
    return 0;
  }
}

/**
 * Strategy registry for discount calculations
 */
class DiscountStrategyRegistry {
  private readonly strategies = new Map<CouponTypeValue, DiscountStrategy>();

  constructor() {
    this.register(new PercentageDiscountStrategy());
    this.register(new FixedDiscountStrategy());
    this.register(new FreeShippingDiscountStrategy());
  }

  private register(strategy: DiscountStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  get(type: CouponTypeValue): DiscountStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No discount strategy registered for type: ${type}`);
    }
    return strategy;
  }
}

// ============================================================================
// Chain of Responsibility: Validation Rules
// ============================================================================

/**
 * Base class for validation rules
 */
abstract class ValidationRule {
  private next: ValidationRule | null = null;

  setNext(rule: ValidationRule): ValidationRule {
    this.next = rule;
    return rule;
  }

  async validate(coupon: Coupon, context: ValidationContext): Promise<ValidationResult | null> {
    const result = await this.check(coupon, context);
    if (result !== null) {
      return result;
    }
    return this.next?.validate(coupon, context) ?? null;
  }

  protected abstract check(
    coupon: Coupon,
    context: ValidationContext,
  ): Promise<ValidationResult | null>;
}

/**
 * Validates coupon existence and active status
 */
class CouponStatusRule extends ValidationRule {
  protected async check(coupon: Coupon): Promise<ValidationResult | null> {
    if (!coupon.isActive) {
      return { valid: false, reason: 'COUPON_INACTIVE' };
    }
    return null;
  }
}

/**
 * Validates coupon date constraints
 */
class CouponDateRule extends ValidationRule {
  protected async check(coupon: Coupon): Promise<ValidationResult | null> {
    const now = new Date();
    const startDate = new Date(coupon.startsAt);

    if (startDate.getTime() > now.getTime()) {
      return { valid: false, reason: 'COUPON_NOT_STARTED' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= now.getTime()) {
      return { valid: false, reason: 'COUPON_EXPIRED' };
    }

    return null;
  }
}

/**
 * Validates minimum order amount requirement
 */
class MinAmountRule extends ValidationRule {
  protected async check(
    coupon: Coupon,
    context: ValidationContext,
  ): Promise<ValidationResult | null> {
    if (coupon.minAmount === null) {
      return null;
    }

    const minAmount = this.toNumber(coupon.minAmount);
    if (context.orderTotal < minAmount) {
      return {
        valid: false,
        reason: 'MIN_AMOUNT_NOT_MET',
        metadata: { minAmount },
      };
    }
    return null;
  }

  private toNumber(value: string | number): number {
    return typeof value === 'number' ? value : Number(value);
  }
}

/**
 * Validates global usage limit
 */
class UsageLimitRule extends ValidationRule {
  protected async check(coupon: Coupon): Promise<ValidationResult | null> {
    if (coupon.usageLimit === null) {
      return null;
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, reason: 'USAGE_LIMIT_REACHED' };
    }
    return null;
  }
}

/**
 * Validates per-customer usage limit
 */
class PerCustomerLimitRule extends ValidationRule {
  protected async check(
    coupon: Coupon,
    context: ValidationContext,
  ): Promise<ValidationResult | null> {
    if (coupon.perCustomerLimit === null || !context.customerId) {
      return null;
    }

    const [customerUsage] = await db
      .select({ total: count(couponRedemptions.id) })
      .from(couponRedemptions)
      .where(
        and(
          eq(couponRedemptions.couponId, coupon.id),
          eq(couponRedemptions.userId, context.customerId),
        ),
      );

    if (Number(customerUsage?.total ?? 0) >= coupon.perCustomerLimit) {
      return { valid: false, reason: 'PER_CUSTOMER_LIMIT_REACHED' };
    }

    return null;
  }
}

// ============================================================================
// Main Service
// ============================================================================

/**
 * Coupon validation service implementing Strategy and Chain of Responsibility patterns
 */
export class CouponValidator {
  private readonly strategyRegistry: DiscountStrategyRegistry;
  private readonly validationChain: ValidationRule;

  constructor() {
    this.strategyRegistry = new DiscountStrategyRegistry();
    this.validationChain = this.buildValidationChain();
  }

  /**
   * Builds the validation chain
   */
  private buildValidationChain(): ValidationRule {
    const statusRule = new CouponStatusRule();
    const dateRule = new CouponDateRule();
    const minAmountRule = new MinAmountRule();
    const usageLimitRule = new UsageLimitRule();
    const perCustomerRule = new PerCustomerLimitRule();

    statusRule
      .setNext(dateRule)
      .setNext(minAmountRule)
      .setNext(usageLimitRule)
      .setNext(perCustomerRule);

    return statusRule;
  }

  /**
   * Validates a coupon against the provided context
   */
  async validate(coupon: Coupon | null, context: ValidationContext): Promise<ValidationResult> {
    // Check existence
    if (!coupon) {
      return { valid: false, reason: 'COUPON_NOT_FOUND' };
    }

    // Run validation chain
    const validationFailure = await this.validationChain.validate(coupon, context);
    if (validationFailure) {
      return validationFailure;
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(coupon, context.orderTotal);
    const finalTotal = Math.max(0, this.roundMoney(context.orderTotal - discountAmount));

    return {
      valid: true,
      coupon: this.buildValidatedCoupon(coupon),
      order: {
        originalTotal: context.orderTotal,
        discountAmount,
        finalTotal,
        currency: context.currency.toUpperCase(),
        freeShipping: coupon.type === CouponType.FREE_SHIPPING,
      },
    };
  }

  /**
   * Calculates discount amount using appropriate strategy
   */
  private calculateDiscount(coupon: Coupon, orderTotal: number): number {
    const strategy = this.strategyRegistry.get(coupon.type);
    const couponValue = this.toNumber(coupon.value ?? 0);
    const maxDiscount = coupon.maxDiscount === null ? null : this.toNumber(coupon.maxDiscount);

    return strategy.calculate(orderTotal, couponValue, maxDiscount);
  }

  /**
   * Builds validated coupon response
   */
  private buildValidatedCoupon(coupon: Coupon): ValidatedCoupon {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: this.toNumber(coupon.value ?? 0),
      minAmount: coupon.minAmount === null ? null : this.toNumber(coupon.minAmount),
      maxDiscount: coupon.maxDiscount === null ? null : this.toNumber(coupon.maxDiscount),
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      usage: {
        used: coupon.usageCount,
        limit: coupon.usageLimit,
        remaining:
          coupon.usageLimit === null ? null : Math.max(0, coupon.usageLimit - coupon.usageCount),
      },
    };
  }

  private toNumber(value: string | number): number {
    return typeof value === 'number' ? value : Number(value);
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let validatorInstance: CouponValidator | null = null;

/**
 * Gets singleton instance of CouponValidator
 */
export function getCouponValidator(): CouponValidator {
  if (!validatorInstance) {
    validatorInstance = new CouponValidator();
  }
  return validatorInstance;
}

/**
 * Resets validator instance (useful for testing)
 */
export function resetCouponValidator(): void {
  validatorInstance = null;
}
