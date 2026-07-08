'use server';

import { createCartId } from '@pranakaia/domain';
import {
  addresses,
  db,
  orderItems,
  orders,
  payments,
  products as productsTable,
  users,
} from '@pranakaia/infrastructure/db';
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createCheckoutDependencies } from '../../../lib/di/checkout-container';
import { env } from '../../../lib/env';
import { observabilityLogger } from '../../../lib/logger';
import { getRatelimitStrict } from '../../../lib/redis/client';

// Validation Schema
const CheckoutSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  address: z.string().min(5, 'Dirección inválida'),
  city: z.string().min(2, 'Ciudad inválida'),
  country: z.string().length(2).default('CL'),
  postalCode: z.string().min(3, 'Código postal inválido'),
  turnstileToken: z.string().min(1, 'Validación de seguridad requerida'),
  shippingAmount: z.coerce.number().default(0),
  shippingMethod: z.string().default('Standard'),
  shippingProviderId: z.string().default('INTERNAL'),
});

// ── Checkout dependencies (lazy por request — A-03)
// Instanciadas con createCheckoutDependencies() para permitir overrides en tests.
// Ver: apps/web/src/lib/di/checkout-container.ts

/**
 * Handles the main checkout process from the frontend form.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: esta acción orquesta validación, antifraude y checkout transaccional en un único boundary server.
export async function processCheckout(
  _prevState: { success?: boolean; message?: string } | null,
  formData: FormData,
) {
  // Crear dependencias por request — inyectables en tests (A-03)
  const { cartRepository, checkoutService } = createCheckoutDependencies();
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';

  try {
    const { success } = await getRatelimitStrict().limit(`checkout_${ip}`);
    if (!success) {
      return { success: false, message: 'Demasiados intentos. Por favor espera un minuto.' };
    }
  } catch (error) {
    observabilityLogger.error('Rate limit evaluation failed', {
      error: String(error),
    });

    if (env.NODE_ENV === 'production') {
      return {
        success: false,
        message: 'No se pudo validar la seguridad del checkout. Intenta nuevamente.',
      };
    }
  }

  // 2. Validate Form Data
  const rawData = Object.fromEntries(formData.entries());
  const validation = CheckoutSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0]?.message || 'Datos de formulario inválidos.',
    };
  }

  const data = validation.data;

  // 3. Turnstile Verification
  try {
    const cfFormData = new URLSearchParams();
    cfFormData.append('secret', env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA');
    cfFormData.append('response', data.turnstileToken);

    const cfVerification = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: cfFormData,
      },
    );
    const cfData = await cfVerification.json();

    if (!cfData.success && env.NODE_ENV === 'production') {
      return { success: false, message: 'Fallo en la validación de seguridad.' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    observabilityLogger.error('Turnstile verification error', { error: message });

    if (env.NODE_ENV === 'production') {
      return { success: false, message: 'No se pudo validar tu solicitud de checkout.' };
    }
  }

  // 4. Load Cart
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return { success: false, message: 'Carrito no encontrado.' };
  }

  const cartResult = await cartRepository.findById(createCartId(cartId).getValue());
  if (cartResult.isFailure) {
    return { success: false, message: 'Error al cargar el carrito.' };
  }

  const cart = cartResult.getValue();
  if (!cart || cart.items.length === 0) {
    return { success: false, message: 'El carrito está vacío.' };
  }

  type CartItemForStockCheck = {
    productId: string;
    name: string;
    quantity: number;
  };

  const cartItems: readonly CartItemForStockCheck[] = cart.items;

  // 4.1 Fast stock check at action boundary to prevent overselling before payment flow.
  const productIds = [...new Set(cartItems.map((item) => item.productId))] as string[];
  const stockRows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      stockQuantity: productsTable.stockQuantity,
    })
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));

  const stockById = new Map(
    stockRows.map((row) => [
      row.id,
      {
        name: row.name,
        stockQuantity: row.stockQuantity,
      },
    ]),
  );

  for (const item of cartItems) {
    const stockInfo = stockById.get(item.productId);

    if (!stockInfo) {
      return {
        success: false,
        message: `El producto ${item.name} ya no está disponible.`,
      };
    }

    if (stockInfo.stockQuantity < item.quantity) {
      return {
        success: false,
        message: `Stock insuficiente para ${stockInfo.name}. Disponible: ${stockInfo.stockQuantity}.`,
      };
    }
  }

  try {
    // 5. Execute Domain Logic
    const result = await checkoutService.processCheckout(cart, {
      email: data.email,
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
      },
      shipping: {
        amount: data.shippingAmount,
        method: data.shippingMethod,
        providerId: data.shippingProviderId,
      },
      isDiscreteShipping: formData.get('isDiscreteShipping') === 'on',
    });

    if (result.isFailure) {
      return {
        success: false,
        message: result.errorValue.message || 'Error al procesar el pago.',
      };
    }

    const checkoutVal = result.getValue();

    // 6. Handle Redirect
    if (checkoutVal.sessionUrl) {
      redirect(checkoutVal.sessionUrl);
    }

    return { success: true, orderId: checkoutVal.order.id };
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    observabilityLogger.error('Checkout error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al procesar el pago.',
    };
  }
}

// Stripe webhook event type definition
interface StripeSession extends Record<string, unknown> {
  id: string;
  amount_total?: number;
  amount?: number;
  currency?: string;
  payment_intent?: string;
  token?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
}

interface StripeWebhookEvent {
  type: string;
  data?: {
    object?: StripeSession;
  };
}

/**
 * Handles payment completion webhooks (Stripe/Flow).
 * This is the "Zero Mock" implementation replacing the old checkout-real logic.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: el handler unifica idempotencia, transacción de stock/pago y side-effects post-pago.
export async function handlePaymentCompletion(event: StripeWebhookEvent) {
  let orderId: string | undefined;

  try {
    const session = (event?.data?.object as StripeSession) ?? {};
    const metadata = session.metadata ?? {};
    orderId =
      (metadata.orderId as string | undefined) ||
      (session.client_reference_id as string | undefined);

    if (!orderId) {
      observabilityLogger.warn('No orderId found in webhook event', { type: event?.type });
      return { success: false, error: 'No orderId' };
    }

    const resolvedOrderId = orderId;

    // 1. Idempotency Check (DB Level)
    const existingOrder = await db
      .select({ paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, resolvedOrderId));
    if (existingOrder[0]?.paymentStatus === 'PAID') {
      return { success: true, alreadyProcessed: true };
    }

    // 2. Atomic Transaction for Order Completion
    await db.transaction(async (tx) => {
      // Payment ID: prefer payment_intent, fall back to session id or flow token
      const externalPaymentId =
        (session.payment_intent as string | undefined) ||
        (session.token as string | undefined) ||
        (session.id as string | undefined) ||
        null;

      // Update stock atomically. If another checkout consumed stock, this transaction fails.
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, resolvedOrderId));
      for (const item of items) {
        const updated = await tx
          .update(productsTable)
          .set({
            stockQuantity: sql`${productsTable.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productsTable.id, item.productId),
              gte(productsTable.stockQuantity, item.quantity),
            ),
          )
          .returning({ id: productsTable.id });

        if (updated.length === 0) {
          throw new Error(
            `Insufficient stock while finalizing payment for product ${item.productId}`,
          );
        }
      }

      // Update Order Status → PAID triggers the fulfill-order Edge Function
      await tx
        .update(orders)
        .set({
          paymentStatus: 'PAID',
          status: 'PAID',
          externalPaymentId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, resolvedOrderId));

      // Record Payment
      await tx.insert(payments).values({
        orderId: resolvedOrderId,
        amount: String(
          (session.amount_total as number)
            ? (session.amount_total as number) / 100
            : (session.amount as number),
        ),
        currency: ((session.currency as string) || 'CLP').toUpperCase(),
        provider: event.type.startsWith('checkout') ? 'STRIPE' : 'FLOW',
        providerId: externalPaymentId ?? (session.id as string),
        status: 'PAID',
        providerData: session,
      });
    });

    observabilityLogger.info('Order completed successfully', { orderId: resolvedOrderId });

    // 3. Trigger Transactional Email
    try {
      const { sendOrderConfirmation } = await import('../../../lib/email');
      const orderData = await db
        .select({
          orderNumber: orders.orderNumber,
          total: orders.total,
          subtotal: orders.subtotal,
          shipping: orders.shippingTotal,
          tax: orders.taxTotal,
          guestEmail: orders.guestEmail,
          userEmail: users.email,
          shippingAddress: {
            address: addresses.street,
            city: addresses.city,
            country: addresses.country,
            postalCode: addresses.postalCode,
          },
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
        .where(eq(orders.id, resolvedOrderId))
        .then((rows) => rows[0]);

      if (orderData) {
        const recipientEmail = orderData.userEmail || orderData.guestEmail;
        if (recipientEmail) {
          // Fetch order items for the email joining with products to get names
          const items = await db
            .select({
              name: productsTable.name,
              quantity: orderItems.quantity,
              price: orderItems.unitPrice,
            })
            .from(orderItems)
            .innerJoin(productsTable, eq(orderItems.productId, productsTable.id))
            .where(eq(orderItems.orderId, resolvedOrderId));

          await sendOrderConfirmation(recipientEmail, {
            orderNumber: orderData.orderNumber,
            total: Number(orderData.total),
            subtotal: Number(orderData.subtotal),
            shipping: Number(orderData.shipping),
            tax: Number(orderData.tax),
            items: items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: Number(i.price),
            })),
            shippingAddress: {
              address: orderData.shippingAddress?.address ?? '',
              city: orderData.shippingAddress?.city ?? '',
              country: orderData.shippingAddress?.country ?? '',
              postalCode: orderData.shippingAddress?.postalCode ?? '',
            },
          });
        }
      }
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : String(emailError);
      observabilityLogger.error('Failed to send order confirmation email', { error: message });
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Insufficient stock while finalizing payment') && orderId) {
      try {
        await db
          .update(orders)
          .set({
            status: 'FAILED',
            paymentStatus: 'FAILED',
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));
      } catch (statusError) {
        observabilityLogger.error('Failed to update order status after stock conflict', {
          error: statusError instanceof Error ? statusError.message : String(statusError),
        });
      }
    }

    observabilityLogger.error('Payment completion handler failed', { error: message });
    throw error;
  }
}
