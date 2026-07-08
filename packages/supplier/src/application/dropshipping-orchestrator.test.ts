import { Result } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DropshippingOrchestrator } from './dropshipping-orchestrator';

// �� Mocks ���������������������������������������������������������������������
const mockDropshipRepo = {
  updateStatus: vi.fn().mockResolvedValue(Result.ok(undefined)),
  save: vi.fn().mockResolvedValue(Result.ok(undefined)),
  findById: vi.fn(),
  findByOrderId: vi.fn(),
  findPending: vi.fn(),
  findBySupplier: vi.fn(),
};

const mockProductRepo = {
  findById: vi.fn().mockResolvedValue(Result.ok(null)),
  search: vi.fn().mockResolvedValue(Result.ok([])),
  save: vi.fn().mockResolvedValue(Result.ok(undefined)),
  delete: vi.fn().mockResolvedValue(Result.ok(undefined)),
};

const mockAuditWriter = vi.fn().mockResolvedValue(undefined);

// Mock the fulfillment module
const mockProvider = {
  createOrder: vi.fn().mockResolvedValue(Result.ok({ providerOrderId: 'ext_123' })),
};

vi.mock('@pranakaia/logistics', () => ({
  resolveFulfillmentProvider: vi.fn(() => mockProvider),
}));

// ── Test Data ─────────────────────────────────────────────────────────────────

const testOrder = {
  id: 'order_123',
  orderNumber: 'PK-2024-001',
  customer: {
    fullName: 'Juan Perez',
    email: 'juan@example.com',
  },
  shippingAddress: {
    addressLine1: 'Avda Siempre Viva 123',
    city: 'Santiago',
    postalCode: '8320000',
    country: 'CL',
  },
  items: [
    { productId: 'prod_A', sku: 'SKU-A', quantity: 2, price: 1000 },
    { productId: 'prod_B', sku: 'SKU-B', quantity: 1, price: 500 },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DropshippingOrchestrator', () => {
  let orchestrator: DropshippingOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new DropshippingOrchestrator(
      mockDropshipRepo as any,
      mockProductRepo as any,
      mockAuditWriter,
    );
  });

  it('debe orquestar una orden dividiéndola por proveedor correctamente', async () => {
    mockProductRepo.findById.mockImplementation(async (id: string) => {
      if (id === 'prod_A') {
        return Result.ok({ id: 'prod_A', supplierId: 'BIGBUY' } as any);
      }
      if (id === 'prod_B') {
        return Result.ok({ id: 'prod_B', supplierId: 'BIGBUY' } as any);
      }
      return Result.ok(null);
    });

    await orchestrator.orchestrateOrder(testOrder);

    // Verificaciones
    expect(mockProductRepo.findById).toHaveBeenCalledTimes(2);
    expect(mockProvider.createOrder).toHaveBeenCalledOnce();
    const orderData = (mockProvider.createOrder as any).mock.calls[0][0];
    expect(orderData.lineItems).toHaveLength(2);
    expect(mockDropshipRepo.updateStatus).toHaveBeenCalledWith(
      'order_123',
      'SENT_TO_SUPPLIER',
      expect.anything(),
    );
    expect(mockAuditWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DROPSHIPPING_SUBMITTED_SUCCESSFULLY',
      }),
    );
  });

  it('debe saltar el fulfillment si el proveedor requiere intervención manual', async () => {
    // Escenario: prod_A no tiene supplierId
    mockProductRepo.findById.mockResolvedValue(
      Result.ok({ id: 'prod_A', supplierId: null } as any),
    );

    await orchestrator.orchestrateOrder({
      ...testOrder,
      items: [{ productId: 'prod_A', sku: 'SKU-A', quantity: 1, price: 1000 }],
    });

    expect(mockProvider.createOrder).not.toHaveBeenCalled();
    expect(mockAuditWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DROPSHIPPING_SKIPPED_MANUAL_REQUIRED',
      }),
    );
  });

  it('debe manejar errores críticos si un producto no existe', async () => {
    mockProductRepo.findById.mockResolvedValue(Result.ok(null));

    await expect(orchestrator.orchestrateOrder(testOrder)).rejects.toThrow();
    expect(mockAuditWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DROPSHIPPING_ORCHESTRATION_CRITICAL_FAILURE',
      }),
    );
  });

  it('debe marcar para reintento si la sumisión al proveedor falla', async () => {
    mockProductRepo.findById.mockResolvedValue(
      Result.ok({ id: 'prod_A', supplierId: 'BIGBUY' } as any),
    );
    mockProvider.createOrder.mockRejectedValue(new Error('API Timeout'));

    await orchestrator.orchestrateOrder({
      ...testOrder,
      items: [{ productId: 'prod_A', sku: 'SKU-A', quantity: 1, price: 1000 }],
    });

    expect(mockDropshipRepo.updateStatus).toHaveBeenCalledWith(
      'order_123',
      'RETRY_PENDING',
      expect.anything(),
    );
    expect(mockAuditWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DROPSHIPPING_SUBMISSION_FAILED',
      }),
    );
  });
});
