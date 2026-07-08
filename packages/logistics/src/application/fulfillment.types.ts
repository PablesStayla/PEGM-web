import type { Result } from '@pranakaia/shared-kernel';

/**
 * Fulfillment Service Types
 */

export type FulfillmentStatus =
  | 'PENDING'
  | 'FULFILLING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export interface FulfillmentAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | undefined;
  city: string;
  state?: string | undefined;
  postalCode: string;
  country: string;
  phone?: string | undefined;
}

export interface FulfillmentLineItem {
  sku: string;
  supplierProductId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateFulfillmentOrderInput {
  orderId: string;
  idempotencyKey: string;
  lineItems: FulfillmentLineItem[];
  shippingAddress: FulfillmentAddress;
  notes?: string | undefined;
}

export interface FulfillmentOrderResult {
  providerOrderId: string;
  status: FulfillmentStatus;
  estimatedShippingDate?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface FulfillmentProvider {
  name: string;
  createOrder(input: CreateFulfillmentOrderInput): Promise<Result<FulfillmentOrderResult, Error>>;
  getOrderStatus(providerOrderId: string): Promise<Result<FulfillmentOrderResult, Error>>;
  cancelOrder(providerOrderId: string, reason?: string): Promise<Result<void, Error>>;
}
