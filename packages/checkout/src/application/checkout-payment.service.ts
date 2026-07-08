import type { Cart } from '@pranakaia/cart';
import type { OrderId } from '@pranakaia/checkout';
import type { PaymentGateway } from '@pranakaia/payments';
import { AuditService, DomainError, Result } from '@pranakaia/shared-kernel';
import {
  CheckoutBuilder,
  type CheckoutCustomerDetails,
  type CheckoutPricing,
} from './checkout.builders';

export interface CircuitBreakerPort {
  call<T>(fn: () => Promise<T>): Promise<T>;
  readonly currentState: string;
}

export type CheckoutResult = {
  order: { id: OrderId; orderNumber: string };
  sessionUrl: string;
};

export class CheckoutPaymentService {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentCircuit?: CircuitBreakerPort,
  ) {}

  async initiatePayment(
    order: { id: OrderId },
    cart: Cart,
    details: CheckoutCustomerDetails,
    pricing: CheckoutPricing,
  ): Promise<Result<CheckoutResult, DomainError>> {
    const params = CheckoutBuilder.buildPaymentSessionParams(order.id, cart, details, pricing);

    const sessionRes = await this.callGateway(params);
    if (sessionRes.isFailure) {
      return Result.err(await this.handlePaymentError(order.id, sessionRes.errorValue));
    }

    const session = sessionRes.getValue();
    await this.logPaymentInitiation(order.id, session.url);

    return Result.ok({
      order: order as { id: OrderId; orderNumber: string },
      sessionUrl: session.url,
    });
  }

  private async callGateway(
    params: Parameters<PaymentGateway['createSession']>[0],
  ): Promise<Result<{ url: string; sessionId: string }, DomainError>> {
    try {
      if (this.paymentCircuit) {
        return await this.paymentCircuit.call(() => this.paymentGateway.createSession(params));
      }
      return await this.paymentGateway.createSession(params);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return Result.err(new DomainError(message || 'Payment gateway call failed', 'GATEWAY_ERROR'));
    }
  }

  private async handlePaymentError(orderId: OrderId, error: unknown): Promise<DomainError> {
    const message =
      error instanceof DomainError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);

    await AuditService.log({
      action: 'checkout_failed',
      entityType: 'order',
      entityId: orderId,
      severity: 'critical',
      metadata: {
        error: message,
        circuitState: this.paymentCircuit?.currentState ?? 'closed',
      },
    });

    return new DomainError(`No se pudo procesar el pago: ${message}`, 'PAYMENT_FAILED');
  }

  private async logPaymentInitiation(orderId: OrderId, url: string) {
    await AuditService.log({
      action: 'payment_initiated',
      entityType: 'order',
      entityId: orderId,
      metadata: { gateway: 'default', sessionUrl: url },
    });
  }
}
