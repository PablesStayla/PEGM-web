/**
 * Customer By ID API — Implementado con Drizzle ORM usando la tabla `users`.
 */

import { db, users } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin();
    const result = await db.select().from(users).where(eq(users.id, params.id));
    const user = result[0];
    if (!user) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ customer: user });
  } catch (_error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin();
    const body: Record<string, unknown> = await request.json();
    const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
    if (body.firstName) {
      updateData.firstName = body.firstName as string;
    }
    if (body.lastName) {
      updateData.lastName = body.lastName as string;
    }
    if (body.phone) {
      updateData.phone = body.phone as string;
    }
    await db.update(users).set(updateData).where(eq(users.id, params.id));
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
