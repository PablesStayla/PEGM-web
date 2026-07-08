import { withRLS } from '@pranakaia/infrastructure/db';
import { NotFoundError } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logAdminAuditEvent } from '@/lib/security/audit';
import { AdminProductService } from './product.service';

// Mocks
vi.mock('@pranakaia/infrastructure/db', () => ({
  db: {
    transaction: vi.fn(),
    select: vi.fn(),
  },
  withRLS: vi.fn(),
  products: { id: 'id', name: 'name', status: 'status', sku: 'sku' },
  categories: { id: 'id', name: 'name' },
  productImages: { id: 'id' },
}));

vi.mock('@/lib/security/audit', () => ({
  logAdminAuditEvent: vi.fn(),
  ADMIN_AUDIT_EVENTS: { PRODUCT_UPDATED: 'PRODUCT_UPDATED' },
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

describe('AdminProductService', () => {
  let service: AdminProductService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminProductService();
  });

  describe('toggleProductActive', () => {
    it('debe cambiar el estado del producto exitosamente', async () => {
      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              where: () => ({
                limit: vi.fn().mockResolvedValue([{ id: 'prod-1' }]),
              }),
            }),
          }),
          update: () => ({
            set: () => ({
              where: vi.fn().mockResolvedValue(true),
            }),
          }),
        });
      });

      const result = await service.toggleProductActive('prod-1', true, 'admin-1');

      expect(result.success).toBe(true);
      expect(result.value.status).toBe('PUBLISHED');
      expect(logAdminAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'toggle_active',
          metadata: { productId: 'prod-1', status: 'PUBLISHED' },
        }),
      );
    });

    it('debe fallar si el producto no existe', async () => {
      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              where: () => ({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        });
      });

      const result = await service.toggleProductActive('unknown', false, 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(NotFoundError);
    });
  });
});
