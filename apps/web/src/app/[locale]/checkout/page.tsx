import { getCurrentUser } from '@pranakaia/infrastructure/auth';
import {
  and,
  cartItems,
  carts,
  customers,
  db,
  eq,
  or,
  products,
  stores,
  users,
} from '@pranakaia/infrastructure/db';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { env } from '@/lib/env';

interface CheckoutPageProps {
  searchParams: Promise<{ recoverCartId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { recoverCartId } = await searchParams;
  const sanitizedRecoverCartId = recoverCartId?.trim();
  const user = await getCurrentUser();

  if (!user?.email) {
    redirect('/login?callbackUrl=/checkout');
  }

  // Get user from database
  const [dbUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

  if (!dbUser) {
    redirect('/login?callbackUrl=/checkout');
  }

  // Get or create customer record
  let [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.email, user.email),
        dbUser.tenantId ? eq(customers.tenantId, dbUser.tenantId) : undefined,
      ),
    )
    .limit(1);

  if (!customer) {
    // Auto-create customer from user data — don't block first-time buyers
    const [store] = await db
      .select()
      .from(stores)
      .where(dbUser.tenantId ? eq(stores.tenantId, dbUser.tenantId) : undefined)
      .limit(1);

    if (store) {
      [customer] = await db
        .insert(customers)
        .values({
          email: user.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          tenantId: dbUser.tenantId,
          storeId: store.id,
        })
        .returning();
    } else {
      redirect('/login?callbackUrl=/checkout');
    }
  }

  // Type-safety guard: ensure customer is definitely defined
  if (!customer) {
    redirect('/login?callbackUrl=/checkout');
  }

  let cartRecord: typeof carts.$inferSelect | undefined;

  // Recover a specific cart when the user opens /checkout/recover/[checkoutId].
  if (sanitizedRecoverCartId) {
    const [recoverableCart] = await db
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.id, sanitizedRecoverCartId),
          eq(carts.userId, dbUser.id),
          or(eq(carts.status, 'active'), eq(carts.status, 'abandoned')),
        ),
      )
      .limit(1);

    if (recoverableCart) {
      cartRecord = recoverableCart;

      if (recoverableCart.status === 'abandoned') {
        await db
          .update(carts)
          .set({
            status: 'active',
            updatedAt: new Date(),
          })
          .where(eq(carts.id, recoverableCart.id));
      }
    }
  }

  // Fallback to the current active cart linked to the user.
  if (!cartRecord) {
    const [activeCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, dbUser.id), eq(carts.status, 'active')))
      .limit(1);
    cartRecord = activeCart;
  }

  // Get cart items with product info (innerJoin ensures product always exists)
  const cartItemsWithProducts = cartRecord
    ? await db
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          unitPrice: cartItems.unitPrice,
          product: {
            id: products.id,
            name: products.name,
            basePrice: products.basePrice,
            salePrice: products.salePrice,
          },
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartRecord.id))
    : [];

  const cart = cartRecord
    ? {
        id: cartRecord.id,
        items: cartItemsWithProducts,
      }
    : null;

  if (!cart || cart.items.length === 0) {
    // Cart empty — redirect to cart page
    redirect('/cart');
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum: number, item) => {
    const price = Number(item.product.salePrice || item.product.basePrice);
    return sum + price * item.quantity;
  }, 0);

  // Use centralized shipping config
  const { calculateShipping, calculateIVA } = await import('@/config/shipping');
  const tax = calculateIVA(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Order Summary */}
        <div className="lg:col-span-7">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-medium text-gray-900">Resumen de la Orden</h2>

            <ul className="mt-6 divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        $
                        {(
                          Number(item.product.salePrice || item.product.basePrice) * item.quantity
                        ).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${subtotal.toLocaleString('es-CL')}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Envío</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    `$${shipping.toLocaleString('es-CL')}`
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">IVA (19%)</dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${tax.toLocaleString('es-CL')}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-gray-900">
                  ${total.toLocaleString('es-CL')} CLP
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="mt-10 lg:col-span-5 lg:mt-0">
          <CheckoutForm
            cartId={cart.id}
            cartTotal={subtotal}
            turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            customer={{
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
            }}
          />
        </div>
      </div>
    </div>
  );
}
