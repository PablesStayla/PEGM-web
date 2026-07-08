import { db } from '@pranakaia/infrastructure/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportingService } from './reporting.service';

vi.mock('@pranakaia/infrastructure/db', () => ({
  db: {
    select: vi.fn(),
  },
  orders: {
    id: 'orders.id',
    total: 'orders.total',
    createdAt: 'orders.createdAt',
    status: 'orders.status',
  },
  orderItems: {
    productId: 'order_items.product_id',
    quantity: 'order_items.quantity',
    subtotal: 'order_items.subtotal',
  },
  products: {
    id: 'products.id',
    name: 'products.name',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(() => {
    service = new ReportingService();
    vi.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('debe retornar métricas correctas para un rango de fechas', async () => {
      const mockResult = [{ totalRevenue: 100000, orderCount: 10 }];
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockResult),
        }),
      });

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');
      const result = await service.getDashboardMetrics(startDate, endDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.totalRevenue).toBe(100000);
        expect(result.value.orderCount).toBe(10);
        expect(result.value.averageOrderValue).toBe(10000);
      }
    });

    it('debe manejar errores de base de datos', async () => {
      (db.select as any).mockImplementation(() => {
        throw new Error('DB Error');
      });

      const result = await service.getDashboardMetrics(new Date(), new Date());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('DB Error');
      }
    });
  });

  describe('getTopProducts', () => {
    it('debe retornar los productos más vendidos', async () => {
      const mockProducts = [
        { productId: 'p1', name: 'Product 1', totalRevenue: 50000 },
        { productId: 'p2', name: 'Product 2', totalRevenue: 30000 },
      ];

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockProducts),
              }),
            }),
          }),
        }),
      });

      const result = await service.getTopProducts(2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].name).toBe('Product 1');
      }
    });
  });
});
