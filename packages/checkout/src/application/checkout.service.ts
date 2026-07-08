import type { Cart } from '@pranakaia/cart';
import type { InventoryService, ReserveStockItem } from '@pranakaia/inventory';
import { extractIvaFromPrice } from '@pranakaia/pricing';
import {
  AuditService,
  type CurrencyCode,
  DomainError,
  Money,
  ProductIdHelper,
  Result,
} from '@pranakaia/shared-kernel';
import {
  CheckoutBuilder,
  type CheckoutCustomerDetails,
  type CheckoutPricing,
} from './checkout.builders';
import type { CheckoutPaymentService, CheckoutResult } from './checkout-payment.service';
import type { CheckoutValidator } from './checkout-validator.service';
import type { OrderService } from './orders/order.service';

export class CheckoutService {
  private readonly validator: CheckoutValidator;
  private readonly paymentService: CheckoutPaymentService;

  constructor(
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
    checkoutValidator: CheckoutValidator,
    checkoutPaymentService: CheckoutPaymentService,
  ) {
    this.validator = checkoutValidator;
    this.paymentService = checkoutPaymentService;
  }

  async processCheckout(
    cart: Cart,
    customerDetails: CheckoutCustomerDetails,
  ): Promise<Result<CheckoutResult, DomainError>> {
    await this.logCheckoutStarted(cart);

    const validation = await this.validator.validateCartContents(cart);
    if (validation.isFailure) {
      return Result.err(validation.errorValue);
    }

    const reserveRes = await this.reserveStock(cart);
    if (reserveRes.isFailure) {
      return Result.err(reserveRes.errorValue);
    }
    const reservedItems = reserveRes.getValue();

    const pricing = this.calculatePricing(cart, customerDetails);
    const result = await this.executeOrderFlow(cart, customerDetails, pricing);

    if (!result.success) {
      await this.inventoryService.releaseStockForOrder(reservedItems);
    }

    return result;
  }

  private async executeOrderFlow(
    cart: Cart,
    details: CheckoutCustomerDetails,
    pricing: CheckoutPricing,
  ): Promise<Result<CheckoutResult, DomainError>> {
    const orderRes = await this.orderService.createOrder(
      CheckoutBuilder.buildOrderInput(cart, details, pricing),
    );
    if (orderRes.isFailure) {
      return orderRes as Result<never, DomainError>;
    }

    return this.paymentService.initiatePayment(orderRes.getValue(), cart, details, pricing);
  }

  private async reserveStock(cart: Cart): Promise<Result<ReserveStockItem[], DomainError>> {
    const items: ReserveStockItem[] = cart.items.map((item) => ({
      productId: ProductIdHelper.from(item.productId),
      quantity: item.quantity,
      name: item.name,
    }));

    const res = await this.inventoryService.reserveStockForOrder(items);
    if (!res.success) {
      const msg = res.error instanceof Error ? res.error.message : String(res.error);
      return Result.err(new DomainError(msg, 'RESERVE_STOCK_FAILED'));
    }

    return Result.ok(items);
  }

  private calculatePricing(cart: Cart, details: CheckoutCustomerDetails): CheckoutPricing {
    const subtotal = cart.subtotal;
    const shippingAmount =
      this.resolveShippingAmount(cart.currency, details.shipping?.amount) ||
      Money.zero(cart.currency as unknown as CurrencyCode);

    // In PranaKaia, subtotal (sum of unitPrices) already includes IVA (19%)
    const taxAmountValue = extractIvaFromPrice(subtotal.amount).getValue();
    const currencyCode = cart.currency as unknown as CurrencyCode;
    const taxResult = Money.create(taxAmountValue, currencyCode);
    if (taxResult.isFailure) {
      return this.fallbackPricing(subtotal, shippingAmount, currencyCode);
    }
    const netSubtotalResult = Money.create(subtotal.amount - taxAmountValue, currencyCode);
    if (netSubtotalResult.isFailure) {
      return this.fallbackPricing(subtotal, shippingAmount, currencyCode);
    }
    const totalResult = Money.create(subtotal.amount + shippingAmount.amount, currencyCode);
    if (totalResult.isFailure) {
      return this.fallbackPricing(subtotal, shippingAmount, currencyCode);
    }
    const tax = taxResult.getValue();
    const netSubtotal = netSubtotalResult.getValue();
    const total = totalResult.getValue();

    return {
      subtotal: netSubtotal,
      tax,
      shipping: shippingAmount,
      total,
    };
  }

  /** Fallback pricing when Money.create fails — uses zero-safe defaults. */
  private fallbackPricing(
    _subtotal: Money,
    shipping: Money,
    currency: CurrencyCode,
  ): CheckoutPricing {
    return {
      subtotal: Money.zero(currency),
      tax: Money.zero(currency),
      shipping,
      total: Money.zero(currency),
    };
  }

  private resolveShippingAmount(currency: string, amount?: number): Money | undefined {
    if (amount === undefined) {
      return undefined;
    }
    const res = Money.create(amount, currency as unknown as CurrencyCode);
    return res.success ? res.getValue() : undefined;
  }

  private async logCheckoutStarted(cart: Cart) {
    await AuditService.log({
      action: 'checkout_started',
      entityType: 'cart',
      entityId: cart.customerId ?? 'guest',
      metadata: { itemCount: cart.items.length, currency: cart.currency },
    });
  }
}
