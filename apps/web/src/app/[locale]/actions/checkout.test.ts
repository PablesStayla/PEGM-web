import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRateLimit = vi.hoisted(() => vi.fn());
const mockHeadersGet = vi.hoisted(() => vi.fn());
const mockCookiesGet = vi.hoisted(() => vi.fn());
const mockFindCartById = vi.hoisted(() => vi.fn());
const mockProcessCheckout = vi.hoisted(() => vi.fn());
const mockDbSelect = vi.hoisted(() => vi.fn());
const mockDbTransaction = vi.hoisted(() => vi.fn());
const mockDbUpdate = vi.hoisted(() => vi.fn());
const mockDbInsert = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerInfo = vi.hoisted(() => vi.fn());
const mockSendOrderConfirmation = vi.hoisted(() => vi.fn());

vi.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => ({ and: args }),
  eq: (...args: unknown[]) => ({ eq: args }),
  gte: (...args: unknown[]) => ({ gte: args }),
  inArray: (...args: unknown[]) => ({ inArray: args }),
  sql: (strings: unknown, ...values: unknown[]) => ({ strings, values }),
}));

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: mockHeadersGet,
  }),
  cookies: async () => ({
    get: mockCookiesGet,
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

vi.mock('../../../lib/redis/client', () => ({
  getRatelimitStrict: () => ({
    limit: mockRateLimit,
  }),
}));

vi.mock('../../../lib/di/checkout-container', () => ({
  createCheckoutDependencies: () => ({
    cartRepository: {
      findById: mockFindCartById,
    },
    checkoutService: {
      processCheckout: mockProcessCheckout,
    },
  }),
}));

vi.mock('../../../lib/logger', () => ({
  observabilityLogger: {
    error: mockLoggerError,
    warn: mockLoggerWarn,
    info: mockLoggerInfo,
  },
}));

vi.mock('../../../lib/email', () => ({
  sendOrderConfirmation: mockSendOrderConfirmation,
}));

vi.mock('../../../lib/env', () => ({
  env: {
    NODE_ENV: 'production',
    TURNSTILE_SECRET_KEY: 'test_turnstile_secret',
  },
}));

vi.mock('@pranakaia/db', () => ({
  addresses: {},
  orderItems: {},
  orders: {},
  payments: {},
  users: {},
  products: {
    id: 'id',
    name: 'name',
    stockQuantity: 'stockQuantity',
  },
  db: {
    select: mockDbSelect,
    transaction: mockDbTransaction,
    update: mockDbUpdate,
    insert: mockDbInsert,
  },
}));

import { env } from '../../../lib/env';
import { handlePaymentCompletion, processCheckout } from './checkout';

function makeValidCheckoutFormData() {
  const formData = new FormData();
  formData.set('email', 'cliente@pranakaia.test');
  formData.set('firstName', 'Pablo');
  formData.set('lastName', 'Rojas');
  formData.set('address', 'Calle Falsa 123');
  formData.set('city', 'Concepcion');
  formData.set('country', 'CL');
  formData.set('postalCode', '4030000');
  formData.set('turnstileToken', 'turnstile-token');
  formData.set('shippingAmount', '0');
  formData.set('shippingMethod', 'Standard');
  formData.set('shippingProviderId', 'INTERNAL');
  return formData;
}

function mockStockRows(rows: Array<{ id: string; name: string; stockQuantity: number }>) {
  mockDbSelect.mockReturnValueOnce({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(rows),
    }),
  });
}

describe('processCheckout action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    env.NODE_ENV = 'production';

    mockHeadersGet.mockReturnValue('198.51.100.10');
    mockCookiesGet.mockReturnValue({ value: 'cart-1' });

    mockRateLimit.mockResolvedValue({ success: true });

    mockFindCartById.mockResolvedValue({
      items: [],
    });

    mockDbSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }),
    );
  });

  it('returns rate-limit message when strict limiter rejects', async () => {
    mockRateLimit.mockResolvedValueOnce({ success: false });

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toContain('Demasiados intentos');
  });

  it('returns validation message for invalid payload', async () => {
    const formData = makeValidCheckoutFormData();
    formData.set('email', 'invalid-email');

    const result = await processCheckout(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email inválido');
  });

  it.each([
    ['firstName', 'A', 'Nombre muy corto'],
    ['lastName', 'B', 'Apellido muy corto'],
    ['address', '1234', 'Dirección inválida'],
    ['city', 'C', 'Ciudad inválida'],
    ['postalCode', '12', 'Código postal inválido'],
    ['turnstileToken', '', 'Validación de seguridad requerida'],
  ])('returns validation message for invalid field %s', async (field, value, expectedMessage) => {
    const formData = makeValidCheckoutFormData();
    formData.set(field, value);

    const result = await processCheckout(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe(expectedMessage);
  });

  it('returns security guard message when rate-limit evaluation throws in production', async () => {
    mockRateLimit.mockRejectedValueOnce(new Error('redis unavailable'));

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toContain('No se pudo validar la seguridad del checkout');
  });

  it('continues checkout path in development when rate-limit evaluation throws', async () => {
    env.NODE_ENV = 'development';
    mockRateLimit.mockRejectedValueOnce(new Error('redis unavailable'));

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toBe('El carrito está vacío.');
    expect(mockLoggerError).toHaveBeenCalledWith('Rate limit evaluation failed', {
      error: 'Error: redis unavailable',
    });
  });

  it('returns security validation message when turnstile fails in production', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: false }),
      }),
    );

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toContain('Fallo en la validación de seguridad');
  });

  it('returns security validation message when turnstile verification throws in production', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('turnstile timeout')));

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toContain('No se pudo validar tu solicitud de checkout');
    expect(mockLoggerError).toHaveBeenCalledWith('Turnstile verification error', {
      error: 'turnstile timeout',
    });
  });

  it('uses localhost fallback ip for rate-limit key when x-forwarded-for is absent', async () => {
    mockHeadersGet.mockReturnValueOnce(null);

    await processCheckout(null, makeValidCheckoutFormData());

    expect(mockRateLimit).toHaveBeenCalledWith('checkout_127.0.0.1');
  });

  it('sends expected turnstile verification payload and fallback secret when env key is empty', async () => {
    env.TURNSTILE_SECRET_KEY = '';

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toBe('El carrito está vacío.');

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    );

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = requestInit.body as URLSearchParams;
    expect(body.get('secret')).toBe('1x0000000000000000000000000000000AA');
    expect(body.get('response')).toBe('turnstile-token');
  });

  it('returns cart not found when cookie is missing', async () => {
    mockCookiesGet.mockReturnValueOnce(undefined);

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Carrito no encontrado.');
  });

  it('returns empty cart when repository has no items', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [],
    });

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toBe('El carrito está vacío.');
  });

  it('returns unavailable product message when stock pre-check cannot find product', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([]);

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toContain('ya no está disponible');
  });

  it('returns insufficient stock message when requested quantity exceeds available stock', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 2 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 1 }]);

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toContain('Stock insuficiente');
  });

  it('returns success with orderId when checkout service completes without redirect', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 5 }]);
    mockProcessCheckout.mockResolvedValueOnce({
      sessionUrl: undefined,
      order: { id: 'order-123' },
    });

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result).toEqual({ success: true, orderId: 'order-123' });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('uses schema defaults for country and shipping fields when omitted', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 5 }]);
    mockProcessCheckout.mockResolvedValueOnce({
      sessionUrl: undefined,
      order: { id: 'order-defaults' },
    });

    const formData = makeValidCheckoutFormData();
    formData.delete('country');
    formData.delete('shippingAmount');
    formData.delete('shippingMethod');
    formData.delete('shippingProviderId');

    const result = await processCheckout(null, formData);

    expect(result).toEqual({ success: true, orderId: 'order-defaults' });
    expect(mockProcessCheckout).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        address: expect.objectContaining({ country: 'CL' }),
        shipping: {
          amount: 0,
          method: 'Standard',
          providerId: 'INTERNAL',
        },
      }),
    );
  });

  it('maps discrete shipping flag from form data', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 5 }]);
    mockProcessCheckout.mockResolvedValueOnce({
      sessionUrl: undefined,
      order: { id: 'order-discrete' },
    });

    const formData = makeValidCheckoutFormData();
    formData.set('isDiscreteShipping', 'on');

    await processCheckout(null, formData);

    expect(mockProcessCheckout).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isDiscreteShipping: true }),
    );
  });

  it('redirects when checkout service returns sessionUrl', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 5 }]);
    mockProcessCheckout.mockResolvedValueOnce({
      sessionUrl: 'https://checkout.stripe.test/session-ok',
      order: { id: 'order-redirect-ok' },
    });

    await processCheckout(null, makeValidCheckoutFormData());

    expect(mockRedirect).toHaveBeenCalledWith('https://checkout.stripe.test/session-ok');
  });

  it('rethrows NEXT_REDIRECT errors from redirect flow', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 5 }]);
    mockProcessCheckout.mockResolvedValueOnce({
      sessionUrl: 'https://checkout.stripe.test/session',
      order: { id: 'order-redirect' },
    });
    mockRedirect.mockImplementationOnce(() => {
      throw new Error('NEXT_REDIRECT');
    });

    await expect(processCheckout(null, makeValidCheckoutFormData())).rejects.toThrow(
      'NEXT_REDIRECT',
    );
  });

  it('returns domain error message when checkout service fails', async () => {
    mockFindCartById.mockResolvedValueOnce({
      items: [{ productId: 'prod-1', name: 'Producto A', quantity: 1 }],
    });
    mockStockRows([{ id: 'prod-1', name: 'Producto A', stockQuantity: 5 }]);
    mockProcessCheckout.mockRejectedValueOnce(new Error('Error de dominio checkout'));

    const result = await processCheckout(null, makeValidCheckoutFormData());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Error de dominio checkout');
  });
});

describe('handlePaymentCompletion action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns no-order-id error when webhook payload lacks metadata and client reference', async () => {
    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_123',
        },
      },
    });

    expect(result).toEqual({ success: false, error: 'No orderId' });
    expect(mockLoggerWarn).toHaveBeenCalled();
  });

  it('returns alreadyProcessed when order is already paid', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ paymentStatus: 'PAID' }]),
      }),
    });

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_paid',
          metadata: { orderId: 'ord-paid' },
        },
      },
    });

    expect(result).toEqual({ success: true, alreadyProcessed: true });
  });

  it('completes payment flow and sends confirmation email when order is valid', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  orderNumber: 'ORD-1001',
                  total: '10000',
                  subtotal: '9000',
                  shipping: '1000',
                  tax: '0',
                  guestEmail: null,
                  userEmail: 'cliente@pranakaia.test',
                  shippingAddress: {
                    address: 'Calle Falsa 123',
                    city: 'Concepcion',
                    country: 'CL',
                    postalCode: '4030000',
                  },
                },
              ]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ name: 'Producto A', quantity: 1, price: '10000' }]),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-1', quantity: 1 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-1' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const txInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_success',
          payment_intent: 'pi_123',
          amount_total: 1000000,
          currency: 'clp',
          metadata: { orderId: 'ord-success' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockSendOrderConfirmation).toHaveBeenCalled();
    expect(mockSendOrderConfirmation).toHaveBeenCalledWith('cliente@pranakaia.test', {
      orderNumber: 'ORD-1001',
      total: 10000,
      subtotal: 9000,
      shipping: 1000,
      tax: 0,
      items: [
        {
          name: 'Producto A',
          quantity: 1,
          price: 10000,
        },
      ],
      shippingAddress: {
        address: 'Calle Falsa 123',
        city: 'Concepcion',
        country: 'CL',
        postalCode: '4030000',
      },
    });
    expect(mockLoggerInfo).toHaveBeenCalledWith('Order completed successfully', {
      orderId: 'ord-success',
    });
  });

  it('persists STRIPE payment fields with normalized currency and amount_total conversion', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-1', quantity: 1 }]),
      }),
    });
    const updateProductSet = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'prod-1' }]),
      }),
    });
    const updateOrderSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    const txUpdate = vi.fn().mockReturnValueOnce({ set: updateProductSet }).mockReturnValueOnce({
      set: updateOrderSet,
    });
    const paymentValues = vi.fn().mockResolvedValue(undefined);
    const txInsert = vi.fn().mockReturnValue({ values: paymentValues });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_currency',
          payment_intent: 'pi_currency',
          amount_total: 123456,
          currency: 'clp',
          metadata: { orderId: 'ord-currency' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(updateOrderSet).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentStatus: 'PAID',
        status: 'PAID',
        externalPaymentId: 'pi_currency',
        updatedAt: expect.any(Date),
      }),
    );
    expect(paymentValues).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'ord-currency',
        amount: '1234.56',
        currency: 'CLP',
        provider: 'STRIPE',
        providerId: 'pi_currency',
        status: 'PAID',
      }),
    );
  });

  it('uses FLOW provider and token fallback when payment_intent is missing', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-flow', quantity: 1 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-flow' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const paymentValues = vi.fn().mockResolvedValue(undefined);
    const txInsert = vi.fn().mockReturnValue({ values: paymentValues });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'flow.payment.confirmed',
      data: {
        object: {
          id: 'flow_sess_provider',
          token: 'flow_token_provider',
          amount: 10990,
          metadata: { orderId: 'ord-flow-provider' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(paymentValues).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'ord-flow-provider',
        amount: '10990',
        currency: 'CLP',
        provider: 'FLOW',
        providerId: 'flow_token_provider',
      }),
    );
  });

  it('falls back to session id as providerId when intent and token are missing', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-fallback', quantity: 1 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-fallback' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const paymentValues = vi.fn().mockResolvedValue(undefined);
    const txInsert = vi.fn().mockReturnValue({ values: paymentValues });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_provider_fallback',
          amount: 2500,
          metadata: { orderId: 'ord-provider-fallback' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(paymentValues).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'STRIPE',
        providerId: 'sess_provider_fallback',
      }),
    );
  });

  it('uses fallback empty strings for shipping address fields in email payload', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  orderNumber: 'ORD-ADDR-1',
                  total: '10990',
                  subtotal: '9990',
                  shipping: '1000',
                  tax: '0',
                  guestEmail: 'guest@pranakaia.test',
                  userEmail: null,
                  shippingAddress: undefined,
                },
              ]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ name: 'Producto B', quantity: 2, price: '5495' }]),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-2', quantity: 2 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-2' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const txInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_addr_fallback',
          metadata: { orderId: 'ord-addr-fallback' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockSendOrderConfirmation).toHaveBeenCalledWith('guest@pranakaia.test', {
      orderNumber: 'ORD-ADDR-1',
      total: 10990,
      subtotal: 9990,
      shipping: 1000,
      tax: 0,
      items: [
        {
          name: 'Producto B',
          quantity: 2,
          price: 5495,
        },
      ],
      shippingAddress: {
        address: '',
        city: '',
        country: '',
        postalCode: '',
      },
    });
  });

  it('logs email failure but still resolves payment completion', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  orderNumber: 'ORD-EMAIL-FAIL',
                  total: '7990',
                  subtotal: '6990',
                  shipping: '1000',
                  tax: '0',
                  guestEmail: null,
                  userEmail: 'cliente@pranakaia.test',
                  shippingAddress: {
                    address: 'Pasaje 1',
                    city: 'Santiago',
                    country: 'CL',
                    postalCode: '8320000',
                  },
                },
              ]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ name: 'Producto C', quantity: 1, price: '7990' }]),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-3', quantity: 1 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-3' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const txInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    mockSendOrderConfirmation.mockRejectedValueOnce(new Error('smtp down'));

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_email_fail',
          metadata: { orderId: 'ord-email-fail' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockLoggerError).toHaveBeenCalledWith('Failed to send order confirmation email', {
      error: 'smtp down',
    });
  });

  it('skips email lookup side effects when order lookup returns no rows', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-no-order', quantity: 1 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-no-order' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const txInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'sess_no_order_data',
          metadata: { orderId: 'ord-no-order-data' },
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockSendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('completes FLOW-like payment using token/client reference and skips email when no recipient exists', async () => {
    mockDbSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  orderNumber: 'ORD-FLOW-1',
                  total: '10990',
                  subtotal: '10990',
                  shipping: '0',
                  tax: '0',
                  guestEmail: null,
                  userEmail: null,
                  shippingAddress: {
                    address: 'Sin correo 1',
                    city: 'Concepcion',
                    country: 'CL',
                    postalCode: '4030000',
                  },
                },
              ]),
            }),
          }),
        }),
      });

    const txSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ productId: 'prod-flow', quantity: 1 }]),
      }),
    });
    const txUpdateProduct = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'prod-flow' }]),
        }),
      }),
    };
    const txUpdateOrder = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    const txUpdate = vi
      .fn()
      .mockReturnValueOnce(txUpdateProduct)
      .mockReturnValueOnce(txUpdateOrder);
    const txInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    mockDbTransaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<void>) => {
      await callback({
        select: txSelect,
        update: txUpdate,
        insert: txInsert,
      });
    });

    const result = await handlePaymentCompletion({
      type: 'flow.payment.confirmed',
      data: {
        object: {
          id: 'flow_sess_1',
          token: 'flow_token_1',
          amount: 10990,
          client_reference_id: 'ord-flow-1',
        },
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockSendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('marks order as FAILED when stock conflict occurs and rethrows', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
      }),
    });

    mockDbTransaction.mockRejectedValueOnce(
      new Error('Insufficient stock while finalizing payment for product prod-1'),
    );

    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn().mockReturnValue({
      where: updateWhere,
    });
    mockDbUpdate.mockReturnValueOnce({
      set: updateSet,
    });

    await expect(
      handlePaymentCompletion({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'sess_stock_conflict',
            metadata: { orderId: 'ord-conflict' },
          },
        },
      }),
    ).rejects.toThrow('Insufficient stock while finalizing payment for product prod-1');

    expect(mockDbUpdate).toHaveBeenCalled();
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILED',
        paymentStatus: 'FAILED',
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('does not downgrade order status for non-stock errors', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
      }),
    });

    mockDbTransaction.mockRejectedValueOnce(new Error('unexpected processing failure'));

    await expect(
      handlePaymentCompletion({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'sess_generic_error',
            metadata: { orderId: 'ord-generic-error' },
          },
        },
      }),
    ).rejects.toThrow('unexpected processing failure');

    expect(mockDbUpdate).not.toHaveBeenCalled();
    expect(mockLoggerError).toHaveBeenCalledWith('Payment completion handler failed', {
      error: 'unexpected processing failure',
    });
  });

  it('logs when status update fails after stock conflict without masking the original error', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ paymentStatus: 'PENDING' }]),
      }),
    });

    mockDbTransaction.mockRejectedValueOnce(
      new Error('Insufficient stock while finalizing payment for product prod-9'),
    );

    const statusUpdateFailure = new Error('status update write failed');
    mockDbUpdate.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(statusUpdateFailure),
      }),
    });

    await expect(
      handlePaymentCompletion({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'sess_status_update_fail',
            metadata: { orderId: 'ord-status-update-fail' },
          },
        },
      }),
    ).rejects.toThrow('Insufficient stock while finalizing payment for product prod-9');

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to update order status after stock conflict',
      {
        error: 'status update write failed',
      },
    );
    expect(mockLoggerError).toHaveBeenCalledWith('Payment completion handler failed', {
      error: 'Insufficient stock while finalizing payment for product prod-9',
    });
  });
});
