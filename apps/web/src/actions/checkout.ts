'use server';

import { Cart, CartItem } from '@pranakaia/cart';
import { createCartId, MoneyVO } from '@pranakaia/domain';
import { BackendModule } from '@pranakaia/infrastructure';
import { z } from 'zod';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import { actionClient, authActionClient } from '@/lib/safe-action';
import { getSiteUrl } from '@/lib/site-url';

const log = createLogger({ module: 'checkout' });

// ── Configuration (One-time check) ──────────────────────────────────────────

BackendModule.configure({
  stripe: { secretKey: env.STRIPE_SECRET_KEY || '' },
  flow: {
    apiKey: env.FLOW_API_KEY || '',
    secretKey: env.FLOW_SECRET_KEY || '',
    sandbox: env.FLOW_SANDBOX || env.NODE_ENV !== 'production',
  },
  siteUrl: getSiteUrl(),
});

// ── Schemas ───────────────────────────────────────────────────────────────

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
  images: z.array(z.string().url()).max(10),
});

const addressSchema = z.object({
  street: z.string().min(3),
  city: z.string().min(2),
  region: z.string().min(2),
  country: z.string().length(2).default('CL'),
  postalCode: z.string().optional(),
});

const checkoutSchema = z.object({
  cartData: z.object({
    id: z.string().min(1),
    customerId: z.string().min(1),
    items: z.array(checkoutItemSchema).min(1),
    currency: z.enum(['CLP', 'USD', 'EUR']),
  }),
  customerDetails: z.object({
    email: z.string().email(),
    address: addressSchema,
    shipping: z
      .object({
        amount: z.number().int().nonnegative(),
        method: z.string().min(1),
        providerId: z.string().min(1),
      })
      .optional(),
  }),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;
type CheckoutCartData = CheckoutInput['cartData'];
type CheckoutCustomerDetails = CheckoutInput['customerDetails'];

// ── Helper ────────────────────────────────────────────────────────────────

async function runCheckoutFlow(
  cartData: CheckoutCartData,
  customerDetails: CheckoutCustomerDetails,
  userId: string,
) {
  const checkoutService = BackendModule.getCheckoutService(cartData.currency);

  const cartItems: CartItem[] = cartData.items.map((i) => {
    const moneyResult = MoneyVO.create(i.price, cartData.currency);
    if (moneyResult.isFailure) {
      throw new Error(`Invalid price for item ${i.name}: ${moneyResult.errorValue.message}`);
    }
    const itemResult = CartItem.create({
      productId: i.productId,
      name: i.name,
      unitPrice: moneyResult.getValue(),
      quantity: i.quantity,
      imageUrl: i.images[0],
    });
    if (itemResult.isFailure) {
      throw new Error(`Failed to create cart item ${i.name}: ${itemResult.errorValue.message}`);
    }
    return itemResult.getValue();
  });

  const cartIdResult = createCartId(cartData.id);
  if (cartIdResult.isFailure) {
    throw new Error(`Invalid cart ID: ${cartIdResult.errorValue.message}`);
  }
  const cartId = cartIdResult.getValue();

  const cartResult = Cart.create({
    id: cartId,
    customerId: userId,
    items: cartItems,
    currency: cartData.currency,
  });

  if (cartResult.isFailure) {
    throw new Error(`Failed to create cart: ${cartResult.errorValue.message}`);
  }
  const cart = cartResult.getValue();

  const result = await checkoutService.processCheckout(cart, {
    email: customerDetails.email,
    address: customerDetails.address as any,
    shipping: customerDetails.shipping,
  });

  if (result.isFailure) {
    throw new Error(`Checkout processing failed: ${result.errorValue.message}`);
  }

  return { success: true as const, url: result.getValue().sessionUrl };
}

// ── Actions ────────────────────────────────────────────────────────────────

export const handleCheckout = actionClient
  .schema(checkoutSchema)
  .action(async ({ parsedInput: { cartData, customerDetails } }) => {
    log.info('Public checkout initiated', { cartId: cartData.id });
    return runCheckoutFlow(cartData, customerDetails, 'guest');
  });

export const handleAuthenticatedCheckout = authActionClient
  .schema(checkoutSchema)
  .action(async ({ parsedInput: { cartData, customerDetails }, ctx: { user } }) => {
    log.info('Auth checkout initiated', { cartId: cartData.id, userId: user.id });
    return runCheckoutFlow(cartData, customerDetails, user.id);
  });
