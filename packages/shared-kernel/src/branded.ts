import { BrandedIdError, OrderIdHelper, ProductIdHelper } from './branded.helpers';
import { Result } from './domain/result';

// ---------------------------------------------------------------------------
// Brand primitive
// ---------------------------------------------------------------------------

export type Brand<K, T extends string> = K & { readonly __brand: T };

// ---------------------------------------------------------------------------
// Branded ID types — one per bounded context entity
// ---------------------------------------------------------------------------

export type UserId = Brand<string, 'UserId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type CartId = Brand<string, 'CartId'>;
export type SupplierId = Brand<string, 'SupplierId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type InventoryId = Brand<string, 'InventoryId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type DropshipOrderId = Brand<string, 'DropshipOrderId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type ShippingZoneId = Brand<string, 'ShippingZoneId'>;
export type CarrierId = Brand<string, 'CarrierId'>;
export type FulfillmentOrderId = Brand<string, 'FulfillmentOrderId'>;
export type NotificationId = Brand<string, 'NotificationId'>;
export type PaymentIntentId = Brand<string, 'PaymentIntentId'>;
export type ShippingRateId = Brand<string, 'ShippingRateId'>;
export type TenantId = Brand<string, 'TenantId'>;
export type StoreId = Brand<string, 'StoreId'>;

export type Currency = Brand<string, 'Currency'>;

// ---------------------------------------------------------------------------
// Generic branded-ID factory
// ---------------------------------------------------------------------------

const createBrandedId = <T extends Brand<string, string>>(
  entity: string,
  raw: string,
  _prefix?: string,
): Result<T, BrandedIdError> => {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length === 0) {
    return Result.err(new BrandedIdError(entity, raw));
  }
  return Result.ok(trimmed as T);
};

// ---------------------------------------------------------------------------
// Typed factory functions per ID
// ---------------------------------------------------------------------------

export const createUserId = (raw: string) => createBrandedId<UserId>('UserId', raw, 'user_');
export const createCartId = (raw: string) => createBrandedId<CartId>('CartId', raw, 'cart_');
export const createSupplierId = (raw: string) =>
  createBrandedId<SupplierId>('SupplierId', raw, 'supplier_');
export const createCustomerId = (raw: string) =>
  createBrandedId<CustomerId>('CustomerId', raw, 'customer_');
export const createCategoryId = (raw: string) =>
  createBrandedId<CategoryId>('CategoryId', raw, 'category_');
export const createSessionId = (raw: string) =>
  createBrandedId<SessionId>('SessionId', raw, 'session_');
export const createPaymentId = (raw: string) =>
  createBrandedId<PaymentId>('PaymentId', raw, 'payment_');
export const createInventoryId = (raw: string) =>
  createBrandedId<InventoryId>('InventoryId', raw, 'inventory_');
export const createDropshipOrderId = (raw: string) =>
  createBrandedId<DropshipOrderId>('DropshipOrderId', raw, 'dropship_');
export const createShippingZoneId = (raw: string) =>
  createBrandedId<ShippingZoneId>('ShippingZoneId', raw, 'sz_');
export const createCarrierId = (raw: string) =>
  createBrandedId<CarrierId>('CarrierId', raw, 'carrier_');
export const createFulfillmentOrderId = (raw: string) =>
  createBrandedId<FulfillmentOrderId>('FulfillmentOrderId', raw, 'fulfill_');
export const createNotificationId = (raw: string) =>
  createBrandedId<NotificationId>('NotificationId', raw, 'notif_');
export const createPaymentIntentId = (raw: string) =>
  createBrandedId<PaymentIntentId>('PaymentIntentId', raw, 'pi_');
export const createShippingRateId = (raw: string) =>
  createBrandedId<ShippingRateId>('ShippingRateId', raw, 'sr_');
export const createTenantId = (raw: string) =>
  createBrandedId<TenantId>('TenantId', raw, 'tenant_');
export const createStoreId = (raw: string) => createBrandedId<StoreId>('StoreId', raw, 'store_');

export const createCurrency = (raw: string): Result<Currency, BrandedIdError> => {
  const trimmed = raw?.trim().toUpperCase();
  if (!trimmed || trimmed.length !== 3 || !/^[A-Z]{3}$/.test(trimmed)) {
    return Result.err(
      new BrandedIdError(
        'Currency',
        raw,
        `Invalid currency code: "${String(raw)}". Must be a 3-letter ISO 4217 code.`,
      ),
    );
  }
  return Result.ok(trimmed as Currency);
};

// Re-exports & compatibility aliases
export { BrandedIdError, OrderIdHelper, ProductIdError, ProductIdHelper } from './branded.helpers';
export const createProductId = (raw: string) => ProductIdHelper.create(raw);
export const createOrderId = (raw: string) => OrderIdHelper.create(raw);
