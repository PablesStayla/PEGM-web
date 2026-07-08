/**
 * DI Container — Checkout
 *
 * Centraliza la creación de repositorios, gateways de pago y el CheckoutService.
 * Al usar factory functions (no singletons de módulo), las dependencias son
 * reemplazables en tests sin necesidad de monkeypatching global.
 *
 * Uso en producción:
 *   const deps = createCheckoutDependencies();
 *   const result = await deps.checkoutService.processCheckout(cart, details);
 *
 * Uso en tests:
 *   const deps = createCheckoutDependencies({
 *     orderRepository: testOrderRepo,
 *     paymentGateway: testGateway,
 *   });
 *
 * @module apps/web/src/lib/di/checkout-container
 */

import type { IProductRepository } from '@pranakaia/catalog';
import type { OrderRepository } from '@pranakaia/checkout';
import {
  CheckoutPaymentService,
  CheckoutService,
  CheckoutValidator,
  OrderService,
} from '@pranakaia/checkout';
import { db } from '@pranakaia/infrastructure/db';
import { InventoryService } from '@pranakaia/inventory';
import type { PaymentGateway } from '@pranakaia/payments';
import { FlowPaymentGateway } from '../../infrastructure/gateways/flow-payment-gateway';
import { PayPalPaymentGateway } from '../../infrastructure/gateways/paypal-payment-gateway';
import { StripePaymentGateway } from '../../infrastructure/gateways/stripe-payment-gateway';
import { DrizzleCartRepository } from '../../infrastructure/repositories/drizzle-cart-repository';
import { DrizzleInventoryRepository } from '../../infrastructure/repositories/drizzle-inventory-repository';
import { DrizzleOrderRepository } from '../../infrastructure/repositories/drizzle-order-repository';
import { DrizzleProductRepository } from '../../infrastructure/repositories/drizzle-product-repository';
import { env } from '../env';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CheckoutDependencies {
  orderRepository: OrderRepository;
  productRepository: IProductRepository;
  cartRepository: DrizzleCartRepository;
  inventoryRepository: DrizzleInventoryRepository;
  paymentGateway: PaymentGateway;
  checkoutService: CheckoutService;
  orderService: OrderService;
  inventoryService: InventoryService;
}

type CheckoutOverrides = {
  orderRepository?: OrderRepository;
  productRepository?: IProductRepository;
  cartRepository?: DrizzleCartRepository;
  inventoryRepository?: DrizzleInventoryRepository;
  paymentGateway?: PaymentGateway;
};

// ── Gateway factory ───────────────────────────────────────────────────────────
/**
 * Selecciona la pasarela de pago según variables de entorno.
 * CLP → Flow | USD/EUR → Stripe | fallback configurable → PayPal
 */
function resolvePaymentGateway(): PaymentGateway {
  const preferred = env.NEXT_PUBLIC_PAYMENT_GATEWAY;

  if (preferred === 'PAYPAL' && (env.PAYPAL_CLIENT_ID || env.PAYPAL_CLIENT_SECRET)) {
    return new PayPalPaymentGateway();
  }

  if (preferred === 'STRIPE' && env.STRIPE_SECRET_KEY) {
    return new StripePaymentGateway();
  }

  if (env.FLOW_API_KEY) {
    return new FlowPaymentGateway();
  }

  if (env.STRIPE_SECRET_KEY) {
    return new StripePaymentGateway();
  }

  if (env.PAYPAL_CLIENT_ID || env.PAYPAL_CLIENT_SECRET) {
    return new PayPalPaymentGateway();
  }

  // Sin credenciales válidas no permitimos fallback inseguro en runtime.
  throw new Error(
    '[checkout-container] No payment gateway configured for production. ' +
      'Set FLOW_API_KEY/FLOW_SECRET_KEY, STRIPE_SECRET_KEY, or PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET.',
  );
}

// ── Container factory ─────────────────────────────────────────────────────────

/**
 * Crea todas las dependencias del checkout.
 * Acepta overrides para inyectar dobles de prueba en tests.
 *
 * IMPORTANTE: Cada llamada crea nuevas instancias.
 * El singleton de módulo quedó eliminado — A-03 fix.
 */
export function createCheckoutDependencies(
  overrides: CheckoutOverrides = {},
): CheckoutDependencies {
  const orderRepository = overrides.orderRepository ?? new DrizzleOrderRepository();
  const productRepository = overrides.productRepository ?? new DrizzleProductRepository();
  const cartRepository = overrides.cartRepository ?? new DrizzleCartRepository(db);
  const inventoryRepository = overrides.inventoryRepository ?? new DrizzleInventoryRepository();
  const paymentGateway = overrides.paymentGateway ?? resolvePaymentGateway();

  const orderService = new OrderService(orderRepository);
  const inventoryService = new InventoryService(inventoryRepository);
  const checkoutValidator = new CheckoutValidator(productRepository);
  const checkoutPaymentService = new CheckoutPaymentService(paymentGateway);

  const checkoutService = new CheckoutService(
    orderService,
    inventoryService,
    checkoutValidator,
    checkoutPaymentService,
  );

  return {
    orderRepository,
    productRepository,
    cartRepository,
    inventoryRepository,
    paymentGateway,
    checkoutService,
    orderService,
    inventoryService,
  };
}
