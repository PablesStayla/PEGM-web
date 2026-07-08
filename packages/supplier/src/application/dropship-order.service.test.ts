import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DropshipOrderService,
  type IDropshipOrderRepository,
  type INotificationService,
  type ISupplierGateway,
} from '../index';

describe('DropshipOrderService', () => {
  let service: DropshipOrderService;
  let mockRepo: vi.Mocked<IDropshipOrderRepository>;
  let mockGateway: vi.Mocked<ISupplierGateway>;
  let mockNotifications: vi.Mocked<INotificationService>;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByOrderId: vi.fn(),
      findBySupplier: vi.fn(),
      findPending: vi.fn(),
      save: vi.fn(),
      updateStatus: vi.fn(),
    } as any;

    mockGateway = {
      submitOrder: vi.fn().mockResolvedValue({ externalOrderId: 'EXT-123', status: 'SUBMITTED' }),
      getOrderStatus: vi.fn(),
    } as any;

    mockNotifications = {
      notifyNewDropshipOrder: vi.fn().mockResolvedValue(undefined),
      notifyDropshipOrderShipped: vi.fn().mockResolvedValue(undefined),
      notifyDropshipOrderFailed: vi.fn().mockResolvedValue(undefined),
    } as any;

    service = new DropshipOrderService(mockRepo, mockGateway, mockNotifications);
  });

  it('should create dropship orders and submit them to supplier', async () => {
    const items = [
      {
        tenantId: 'tenant-1',
        orderId: 'order-1',
        orderItemId: 'item-1',
        supplierId: 'supplier-1',
        supplierProductId: 'sp-1',
        productId: 'p-1',
        quantity: 2,
        unitCost: 100,
        shippingAddress: { city: 'Santiago' },
      },
    ];

    const result = await service.createFromCheckout(items);

    expect(result.isSuccess).toBe(true);
    const orders = result.getValue();
    expect(orders).toHaveLength(1);
    expect(orders[0].status).toBe('SUBMITTED');
    expect(orders[0].supplierOrderId).toBe('EXT-123');
    expect(mockGateway.submitOrder).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockNotifications.notifyNewDropshipOrder).toHaveBeenCalled();
  });

  it('should mark as failed if supplier submission fails', async () => {
    mockGateway.submitOrder.mockRejectedValue(new Error('API Down'));

    const items = [
      {
        tenantId: 'tenant-1',
        orderId: 'order-1',
        orderItemId: 'item-1',
        supplierId: 'supplier-1',
        supplierProductId: 'sp-1',
        productId: 'p-1',
        quantity: 2,
        unitCost: 100,
        shippingAddress: { city: 'Santiago' },
      },
    ];

    const result = await service.createFromCheckout(items);

    expect(result.isSuccess).toBe(true); // The service handles the error and returns ok with failed items
    const orders = result.getValue();
    expect(orders[0].status).toBe('FAILED');
    expect(orders[0].errors).toContain('Auto-submit failed: API Down');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
