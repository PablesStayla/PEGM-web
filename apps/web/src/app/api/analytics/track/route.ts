import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { observabilityLogger } from '@/lib/logger';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';

const trackEventSchema = z.object({
  event: z.string().min(1).max(100),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimit(request, 'analytics:track:POST', 120, 60);
    if (!rl.allowed) {
      const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      applyRateLimitHeaders(res, rl);
      return res;
    }

    const body = await request.json();
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.errors },
        { status: 400 },
      );
    }

    observabilityLogger.info('Analytics event tracked', {
      event: parsed.data.event,
      userId: parsed.data.userId,
    });

    const res = NextResponse.json({ success: true });
    applyRateLimitHeaders(res, rl);
    return res;
  } catch (error) {
    observabilityLogger.error('Failed to track analytics event', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
