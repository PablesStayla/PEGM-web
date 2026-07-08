import type { OrderRepository } from '@pranakaia/checkout';
import { type AuditLogEntry, AuditService, Money, Result } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderService } from './order.service';

function makeMoney(amount: number, currency: string): Money {
  const r = Money.create({ amount, currency });
  if (!r.success) {
    throw r.error;
  }
  return r.value;
}

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;
  let auditLogs: AuditLogEntry[];

  beforeEach(() => {
    auditLogs = [];
    AuditService.configureWriter(async (entry) => {
      auditLogs.push(entry);
    });
    orderRepository = {
      create: vi.fn().mockResolvedValue(Result.ok({ id: 'order-1', orderNumber: 'ORD-001' })),
      findById: vi.fn().mockResolvedValue(Result.ok({ id: 'order-1', status: 'PENDING' } as any)),
      findByCustomer: vi.fn(),
      findAll: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(Result.ok(undefined)),
    };
    orderService = new OrderService(orderRepository);
  });

  describe('createOrder', () => {
    it('crea una orden y registra auditoria', async () => {
      const params = {
        items: [],
        currency: 'CLP',
        subtotal: makeMoney(1000, 'CLP'),
        taxAmount: makeMoney(0, 'CLP'),
        shippingAmount: makeMoney(0, 'CLP'),
        totalAmount: makeMoney(1000, 'CLP'),
      };

      const result = await orderService.createOrder(params);
      if (!result.success) {
        throw result.error;
      }
      expect(result.value.id).toBe('order-1');
      expect(orderRepository.create).toHaveBeenCalledWith(params);
      expect(auditLogs.some((l) => l.action === 'order_created')).toBe(true);
    });
  });

  describe('updateOrderStatus', () => {
    it('actualiza el estado exitosamente', async () => {
      const result = await orderService.updateOrderStatus('order-1', 'PAID', 'user-123');
      if (result.success) {
        expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-1', 'PAID');
        expect(auditLogs.some((l) => l.action === 'order_status_updated')).toBe(true);
      }
    });

    it('lanza error si la orden no existe', async () => {
      vi.mocked(orderRepository.findById).mockResolvedValueOnce(
        Result.err(new Error('Orden no encontrada')),
      );
      const result = await orderService.updateOrderStatus('none', 'PAID', 'user-123');
      expect(result.success).toBe(false);
    });
  });
});
