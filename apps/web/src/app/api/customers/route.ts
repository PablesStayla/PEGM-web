import { db, users } from '@pranakaia/infrastructure/db';
import { desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { observabilityLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';
import { requireAdmin } from '@/lib/supabase/server';

const listCustomersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimit(request, 'customers:GET', 60, 60);
    if (!rl.allowed) {
      const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      applyRateLimitHeaders(res, rl);
      return res;
    }

    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryResult = listCustomersSchema.safeParse({
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
      role: searchParams.get('role') ?? undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query params', details: queryResult.error.errors },
        { status: 400 },
      );
    }

    const { role } = queryResult.data;

    const customerList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(role ? eq(users.role, role) : undefined)
      .orderBy(desc(users.createdAt));

    observabilityLogger.info('Customers fetched', { count: customerList.length });

    const res = NextResponse.json({ customers: customerList, total: customerList.length });
    applyRateLimitHeaders(res, rl);
    return res;
  } catch (error) {
    observabilityLogger.error('Failed to fetch customers', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
