import { createHmac } from 'node:crypto';
import { db } from '@pranakaia/infrastructure/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupplierWebhookService } from './supplier-webhook.service';

vi.mock('@pranakaia/infrastructure/db', () => ({
  db: {
    select: vi.fn(),
  },
  stores: { settings: 'stores.settings' },
}));

vi.mock('@/providers/container', () => ({
  container: {
    inventoryService: { bulkUpdateStock: vi.fn() },
    orderService: { updateOrderStatus: vi.fn() },
  },
}));

vi.mock('@/lib/security/supplier-secrets', () => ({
  decryptSupplierSecret: vi.fn().mockReturnValue('mock-secret'),
}));

describe('SupplierWebhookService', () => {
  let service: SupplierWebhookService;

  beforeEach(() => {
    service = new SupplierWebhookService();
    vi.clearAllMocks();
  });

  describe('handleWebhook', () => {
    it('debe procesar un webhook de stock válido', async () => {
      const payload = {
        event: 'stock.updated',
        data: { sku: 'SKU-1', quantity: 100 },
        timestamp: new Date().toISOString(),
      };

      const secret = 'mock-secret';
      const signature = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              settings: {
                suppliers: [{ id: 'sup-1', apiKey: 'enc:key' }],
              },
            },
          ]),
        }),
      });

      const result = await service.handleWebhook('sup-1', payload, signature);

      expect(result.success).toBe(true);
    });

    it('debe fallar con una firma inválida', async () => {
      const payload = { event: 'stock.updated', data: {}, timestamp: '' };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              settings: {
                suppliers: [{ id: 'sup-1', apiKey: 'enc:key' }],
              },
            },
          ]),
        }),
      });

      const result = await service.handleWebhook('sup-1', payload, 'wrong-signature');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid signature');
      }
    });
  });
});
