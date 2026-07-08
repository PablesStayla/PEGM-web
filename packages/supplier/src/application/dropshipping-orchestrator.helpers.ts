/**
 * Dropshipping Orchestrator — Domain Types
 *
 * Data shapes shared between the orchestrator and its infrastructure adapters.
 */

/** Represents a paid order ready for fulfillment routing. */
export interface PersistedOrder {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
}

/** Provider input shape built from a {@link PersistedOrder} for a single supplier. */
export interface ProviderOrderInput {
  orderId: string;
  idempotencyKey: string;
  lineItems: Array<{
    sku: string;
    supplierProductId: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
}

/** Builds the provider input from a persisted order and its supplier-scoped items. */
export function buildProviderOrderInput(
  order: PersistedOrder,
  supplierId: string,
  items: PersistedOrder['items'],
): ProviderOrderInput {
  return {
    orderId: order.id,
    idempotencyKey: `${order.id}-${supplierId}`,
    lineItems: items.map((i) => ({
      sku: i.sku,
      supplierProductId: i.sku,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
    shippingAddress: {
      fullName: order.customer.fullName,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2 || '',
      city: order.shippingAddress.city,
      state: order.shippingAddress.state || '',
      country: order.shippingAddress.country,
      postalCode: order.shippingAddress.postalCode,
      phone: order.customer.phone || '',
    },
  };
}
