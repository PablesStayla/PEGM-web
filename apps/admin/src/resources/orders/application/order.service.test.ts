import { withRLS } from '@pranakaia/infrastructure/db';
import { sendEmail } from '@pranakaia/infrastructure/email';
import { NotFoundError } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logAdminAuditEvent } from '@/lib/security/audit';
import { OrderService } from './order.service';

// Mocks
vi.mock('@pranakaia/infrastructure/db', () => ({
  db: {
    transaction: vi.fn(),
  },
  withRLS: vi.fn(),
  orders: { id: 'id', orderNumber: 'orderNumber', status: 'status' },
  users: { id: 'id', email: 'email' },
  orderItems: { id: 'id' },
  products: { id: 'id' },
  orderStatusEnum: { enumValues: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] },
}));

vi.mock('@pranakaia/infrastructure/email', () => ({
  sendEmail: vi.fn(),
  OrderStatusUpdateEmail: () => null,
}));

vi.mock('@/lib/security/audit', () => ({
  logAdminAuditEvent: vi.fn(),
  ADMIN_AUDIT_EVENTS: { ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED' },
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OrderService();
  });

  describe('updateOrderStatus', () => {
    it('debe actualizar el estado y enviar email si el usuario existe', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'PK-123',
        customerEmail: 'customer@test.com',
        customerFirstName: 'John',
      };

      // Mock withRLS to return our order and simulate DB call
      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                where: () => ({
                  limit: vi.fn().mockResolvedValue([mockOrder]),
                }),
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

      const result = await service.updateOrderStatus({
        orderId: 'order-1',
        status: 'SHIPPED',
        adminId: 'admin-1',
        trackingNumber: 'TRK-999',
      });

      expect(result.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@test.com',
          subject: expect.stringContaining('Enviada'),
        }),
      );
      expect(logAdminAuditEvent).toHaveBeenCalled();
    });

    it('debe retornar NotFoundError si la orden no existe', async () => {
      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                where: () => ({
                  limit: vi.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        });
      });

      const result = await service.updateOrderStatus({
        orderId: 'non-existent',
        status: 'PAID',
        adminId: 'admin-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('cancelOrder', () => {
    it('debe cancelar una orden si no ha sido enviada', async () => {
      const mockOrder = { id: 'order-1', status: 'PAID', orderNumber: 'PK-123' };

      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                where: () => ({
                  limit: vi.fn().mockResolvedValue([mockOrder]),
                }),
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

      const result = await service.cancelOrder('order-1', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.value.status).toBe('CANCELLED');
    });

    it('debe fallar al cancelar si la orden ya fue enviada', async () => {
      const mockOrder = { id: 'order-1', status: 'SHIPPED', orderNumber: 'PK-123' };

      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                where: () => ({
                  limit: vi.fn().mockResolvedValue([mockOrder]),
                }),
              }),
            }),
          }),
        });
      });

      const result = await service.cancelOrder('order-1', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Cannot cancel a shipped or delivered order');
    });
  });

  describe('refundOrder', () => {
    it('debe reembolsar una orden exitosamente', async () => {
      (withRLS as any).mockImplementation(async (_userId: string, _role: string, cb: any) => {
        return cb({
          select: () => ({
            from: () => ({
              where: () => ({
                limit: vi.fn().mockResolvedValue([{ id: 'order-1' }]),
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

      const result = await service.refundOrder('order-1', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.value.status).toBe('REFUNDED');
    });
  });
});
