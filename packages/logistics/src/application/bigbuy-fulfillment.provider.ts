import { CircuitBreaker, Result, withExponentialBackoff } from '@pranakaia/shared-kernel';
import type {
  CreateFulfillmentOrderInput,
  FulfillmentOrderResult,
  FulfillmentProvider,
  FulfillmentStatus,
} from './fulfillment.types';

/**
 * BigBuyFulfillmentProvider — Implementación real para el proveedor BigBuy.
 *
 * Usa Circuit Breaker + Retry exponencial para resiliencia.
 * API Docs: https://api.bigbuy.eu/
 */
export class BigBuyFulfillmentProvider implements FulfillmentProvider {
  public readonly name = 'bigbuy';
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly breaker: CircuitBreaker;

  constructor(config: { apiUrl: string; apiKey: string }) {
    if (!config.apiUrl || !config.apiKey) {
      throw new Error('[BigBuyFulfillmentProvider] apiUrl and apiKey are required');
    }
    this.apiUrl = config.apiUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.breaker = new CircuitBreaker({
      name: 'bigbuy-api',
      failureThreshold: 5,
      recoveryTimeMs: 30_000,
      timeoutMs: 15_000,
    });
  }

  private async request<T>(
    path: string,
    options: RequestInit & { idempotencyKey?: string },
  ): Promise<Result<T, Error>> {
    const { idempotencyKey, ...fetchOptions } = options;

    try {
      const result = await withExponentialBackoff(
        () =>
          this.breaker.call(async () => {
            const res = await fetch(`${this.apiUrl}${path}`, {
              ...fetchOptions,
              headers: this.buildHeaders(idempotencyKey, fetchOptions.headers),
            });
            if (!res.ok) {
              await this.handleResponseError(res);
            }
            return res.json() as Promise<T>;
          }),
        {
          maxAttempts: 3,
          baseDelayMs: 1_000,
          maxDelayMs: 8_000,
          isRetriable: (err: unknown) =>
            !(err instanceof Error && err.message.startsWith('BigBuy API 4')),
        },
      );
      return Result.ok(result);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private buildHeaders(
    idempotencyKey?: string,
    fetchHeaders?: unknown,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
      ...((fetchHeaders as Record<string, string> | undefined) ?? {}),
    };
  }

  private async handleResponseError(res: Response): Promise<never> {
    const errorText = await res.text().catch(() => 'No error body');
    throw new Error(`BigBuy API ${res.status}: ${errorText}`);
  }

  async createOrder(
    input: CreateFulfillmentOrderInput,
  ): Promise<Result<FulfillmentOrderResult, Error>> {
    const body = this.buildRequestBody(input);

    const res = await this.request<{ orderId: string; status: string }>('/rest/catalog/orders', {
      method: 'POST',
      body: JSON.stringify(body),
      idempotencyKey: input.idempotencyKey,
    });

    if (!res.success) {
      return Result.err(res.errorValue);
    }

    const value = res.getValue();
    return Result.ok({
      providerOrderId: value.orderId,
      status: 'FULFILLING',
    });
  }

  private buildRequestBody(input: CreateFulfillmentOrderInput) {
    const [firstName, ...lastNameParts] = input.shippingAddress.fullName.split(' ');

    return {
      externalReferenceId: input.orderId,
      shippingAddress: {
        firstName: firstName ?? '',
        lastName: lastNameParts.join(' ') ?? '',
        addressLine1: input.shippingAddress.addressLine1,
        addressLine2: input.shippingAddress.addressLine2 ?? '',
        city: input.shippingAddress.city,
        postcode: input.shippingAddress.postalCode,
        country: input.shippingAddress.country,
        phone: input.shippingAddress.phone ?? '',
      },
      products: input.lineItems.map((item) => ({
        sku: item.supplierProductId,
        quantity: item.quantity,
      })),
      comments: input.notes ?? '',
    };
  }

  async getOrderStatus(providerOrderId: string): Promise<Result<FulfillmentOrderResult, Error>> {
    const res = await this.request<{
      orderId: string;
      status: string;
      trackingNumber?: string;
      carrier?: string;
    }>(`/rest/catalog/orders/${providerOrderId}`, { method: 'GET' });

    if (!res.success) {
      return Result.err(res.errorValue);
    }

    return Result.ok(this.mapResponseToResult(res.getValue()));
  }

  private mapResponseToResult(response: {
    orderId: string;
    status: string;
    trackingNumber?: string;
    carrier?: string;
  }): FulfillmentOrderResult {
    const statusMap: Record<string, FulfillmentStatus> = {
      pending: 'PENDING',
      processing: 'FULFILLING',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
    };

    const result: FulfillmentOrderResult = {
      providerOrderId: response.orderId,
      status: statusMap[response.status.toLowerCase()] ?? 'FULFILLING',
    };

    if (response.trackingNumber) {
      result.trackingNumber = response.trackingNumber;
    }
    if (response.carrier) {
      result.carrier = response.carrier;
    }

    return result;
  }

  async cancelOrder(providerOrderId: string, reason?: string): Promise<Result<void, Error>> {
    const res = await this.request(`/rest/catalog/orders/${providerOrderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason ?? 'Customer request' }),
    });

    if (!res.success) {
      return Result.err(res.errorValue);
    }
    return Result.ok(undefined);
  }
}
