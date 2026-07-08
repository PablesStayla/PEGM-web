import type { Cart } from '@pranakaia/cart';
import type { CreateOrderParams } from '@pranakaia/checkout';
import type { Money } from '@pranakaia/shared-kernel';
import { GUEST_USER_ID, type OrderId, type ProductId } from '@pranakaia/shared-kernel';

export type CheckoutCustomerDetails = {
  email: string;
  address: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  shipping?: {
    amount: number;
    method: string;
    providerId: string;
  };
  isDiscreteShipping?: boolean;
};

export type CheckoutPricing = {
  subtotal: Money;
  tax: Money;
  shipping: Money;
  total: Money;
};

export class CheckoutBuilder {
  static buildOrderInput(
    cart: Cart,
    customerDetails: CheckoutCustomerDetails,
    pricing: CheckoutPricing,
  ): CreateOrderParams {
    return {
      subtotal: pricing.subtotal,
      taxAmount: pricing.tax,
      shippingAmount: pricing.shipping,
      totalAmount: pricing.total,
      items: cart.items.map(CheckoutBuilder.mapCartItem),
      currency: cart.currency,
      shippingAddress: customerDetails.address,
      billingAddress: customerDetails.billingAddress || customerDetails.address,
      metadata: { source: 'checkout_v2' },
      ...CheckoutBuilder.buildCustomerInfo(cart, customerDetails),
      ...CheckoutBuilder.buildShippingInfo(customerDetails),
    };
  }

  private static mapCartItem(item: Cart['items'][number]) {
    return {
      productId: item.productId as ProductId,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      ...(item.imageUrl ? { image: item.imageUrl } : {}),
    };
  }

  private static buildCustomerInfo(cart: Cart, details: CheckoutCustomerDetails) {
    const isGuest = cart.customerId === null || cart.customerId === GUEST_USER_ID;
    return isGuest ? { guestEmail: details.email } : { customerId: cart.customerId as string };
  }

  private static buildShippingInfo(details: CheckoutCustomerDetails) {
    return {
      ...(details.shipping?.method ? { shippingMethod: details.shipping.method } : {}),
      ...(details.shipping?.providerId ? { shippingProviderId: details.shipping.providerId } : {}),
      ...(details.isDiscreteShipping !== undefined
        ? { isDiscreteShipping: details.isDiscreteShipping }
        : {}),
    };
  }

  static buildPaymentSessionParams(
    orderId: OrderId,
    cart: Cart,
    customerDetails: CheckoutCustomerDetails,
    pricing: CheckoutPricing,
  ) {
    return {
      orderId,
      email: customerDetails.email,
      amount: pricing.total.amount,
      currency: cart.currency,
      items: cart.items.map((item) => ({
        name: item.name,
        price: item.unitPrice.amount,
        quantity: item.quantity,
        images: item.imageUrl ? [item.imageUrl] : [],
      })),
    };
  }
}
