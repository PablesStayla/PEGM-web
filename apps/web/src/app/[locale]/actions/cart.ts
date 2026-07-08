'use server';

import { CartItem, CartService } from '@pranakaia/cart';
import { Money } from '@pranakaia/catalog';
import { createCartId } from '@pranakaia/domain';
import { db } from '@pranakaia/infrastructure/db';
import { cookies } from 'next/headers';
import { DrizzleCartRepository } from '@/infrastructure/repositories/drizzle-cart-repository';
import { getAllProducts } from '@/lib/products';

const cartService = new CartService(new DrizzleCartRepository(db));

async function getCartId(): Promise<string> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    cartId = `guest_${crypto.randomUUID()}`;
    cookieStore.set('cartId', cartId);
  }

  return cartId;
}

export async function addToCart(productId: string, quantity: number) {
  const cartId = await getCartId();

  const products = await getAllProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return { success: false, message: 'Producto no encontrado' };
  }

  const priceRes = Money.create(product.price, 'CLP');
  if (!priceRes.success) {
    return { success: false, message: 'Precio inválido' };
  }

  const itemRes = CartItem.create({
    productId: product.id,
    name: product.name,
    unitPrice: priceRes.getValue(),
    quantity: quantity,
    imageUrl: product.images?.[0],
  });

  if (!itemRes.success) {
    return { success: false, message: 'Error al crear el item' };
  }

  await cartService.addItem(createCartId(cartId).getValue(), itemRes.getValue());

  return { success: true, cartId };
}

export async function removeFromCart(productId: string) {
  try {
    const cartId = await getCartId();
    const cartRes = await cartService.getCart(createCartId(cartId).getValue());
    if (cartRes.isSuccess && cartRes.getValue()) {
      const cart = cartRes.getValue()!;
      const item = cart.items.find((i) => i.productId === productId);
      if (item) {
        await cartService.removeItem(createCartId(cartId).getValue(), item.id);
      }
    }
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Error al eliminar del carrito' };
  }
}

export async function updateCartQuantity(productId: string, quantity: number) {
  try {
    const cartId = await getCartId();
    const cartRes = await cartService.getCart(createCartId(cartId).getValue());
    if (cartRes.isSuccess && cartRes.getValue()) {
      const cart = cartRes.getValue()!;
      const item = cart.items.find((i) => i.productId === productId);
      if (item) {
        if (quantity <= 0) {
          await cartService.removeItem(createCartId(cartId).getValue(), item.id);
        } else {
          await cartService.updateQuantity(createCartId(cartId).getValue(), item.id, quantity);
        }
      }
    }
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Error al actualizar cantidad' };
  }
}

export async function clearServerCart() {
  try {
    const cartId = await getCartId();
    await cartService.clearCart(createCartId(cartId).getValue());
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Error al vaciar el carrito' };
  }
}
