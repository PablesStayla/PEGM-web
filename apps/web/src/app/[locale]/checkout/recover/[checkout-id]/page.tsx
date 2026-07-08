/**
 * /checkout/recover/[checkoutId]
 * Reenvia al checkout principal con la referencia del carrito a recuperar.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Recuperar carrito — PranaKaia',
  robots: 'noindex',
};

export default async function RecoverCheckoutPage({
  params,
}: {
  params: Promise<{ checkoutId: string }>;
}) {
  const { checkoutId } = await params;
  redirect(`/checkout?recoverCartId=${encodeURIComponent(checkoutId)}`);
}
