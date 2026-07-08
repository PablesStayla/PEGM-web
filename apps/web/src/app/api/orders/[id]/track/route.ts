/**
 * Order Tracking API — Implementado con Drizzle ORM.
 */
import { db, orders } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        trackingNumber: orders.trackingNumber,
        trackingUrl: orders.trackingUrl,
      })
      .from(orders)
      .where(eq(orders.id, params.id));

    const order = result[0];
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
