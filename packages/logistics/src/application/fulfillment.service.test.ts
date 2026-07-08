import { Result } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BigBuyFulfillmentProvider,
  FulfillmentService,
  registerFulfillmentProvider,
  resolveFulfillmentProvider,
} from './fulfillment.service';

vi.stubGlobal('fetch', vi.fn());

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

describe('Fulfillment', () => {
  describe('BigBuyFulfillmentProvider', () => {
    const config = { apiUrl: 'https://api.test', apiKey: 'test-key' };
    let provider: BigBuyFulfillmentProvider;

    beforeEach(() => {
      provider = new BigBuyFulfillmentProvider(config);
      vi.mocked(fetch).mockClear();
    });

    it('should throw if config is missing', () => {
      expect(() => new BigBuyFulfillmentProvider({ apiUrl: '', apiKey: '' })).toThrow(
        '[BigBuyFulfillmentProvider] apiUrl and apiKey are required',
      );
    });

    it('should normalize API URL by removing trailing slash', () => {
      const p = new BigBuyFulfillmentProvider({
        apiUrl: 'https://api.test/',
        apiKey: 'test-key',
      });
      // @ts-expect-error - accessing private property for test verification
      expect(p.apiUrl).toBe('https://api.test');
    });

    it('should create order successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderId: 'prov_123', status: 'pending' }),
      } as Response);

      const result = await provider.createOrder({
        orderId: 'my_order_1',
        idempotencyKey: 'key_1',
        lineItems: [{ sku: 'sku1', supplierProductId: 'sup1', quantity: 2, unitPrice: 10 }],
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: 'Street 1',
          city: 'City',
          postalCode: '12345',
          country: 'ES',
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue().providerOrderId).toBe('prov_123');
        expect(result.getValue().status).toBe('FULFILLING');
      }
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test/rest/catalog/orders',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
            'X-Idempotency-Key': 'key_1',
          }),
        }),
      );
    });

    it('should get order status successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orderId: 'prov_123',
          status: 'shipped',
          trackingNumber: 'TRK123',
          carrier: 'UPS',
        }),
      } as Response);

      const result = await provider.getOrderStatus('prov_123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue().providerOrderId).toBe('prov_123');
        expect(result.getValue().status).toBe('SHIPPED');
        expect(result.getValue().trackingNumber).toBe('TRK123');
        expect(result.getValue().carrier).toBe('UPS');
      }
    });

    it('should handle API errors by rejecting', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      const result = await provider.getOrderStatus('prov_123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorValue.message).toContain('BigBuy API 500');
      }
    });

    it('should return success: false when cancelOrder fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Too late to cancel',
      } as Response);

      const result = await provider.cancelOrder('prov_123');
      expect(result.success).toBe(false);
    });
  });

  describe('Provider Registry', () => {
    it('should register and resolve a provider', () => {
      const mockProvider = { name: 'custom', createOrder: vi.fn() } as any;
      registerFulfillmentProvider(mockProvider);
      expect(resolveFulfillmentProvider('custom')).toBe(mockProvider);
    });

    it('should throw if provider is not registered', () => {
      expect(() => resolveFulfillmentProvider('non-existent')).toThrow(
        'Provider "non-existent" not registered',
      );
    });
  });

  describe('FulfillmentService', () => {
    it('should use the resolved provider to create orders', async () => {
      const mockProvider = {
        name: 'mock-p',
        createOrder: vi
          .fn()
          .mockResolvedValue(Result.ok({ providerOrderId: '123', status: 'SHIPPED' as any })),
      } as any;
      registerFulfillmentProvider(mockProvider);

      const service = new FulfillmentService('mock-p');
      const result = await service.createOrder('order_1', [], { fullName: 'Test' } as any);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue().providerOrderId).toBe('123');
      }
      expect(mockProvider.createOrder).toHaveBeenCalled();
    });
  });
});
