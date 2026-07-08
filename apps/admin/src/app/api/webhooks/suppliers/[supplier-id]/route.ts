import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { container } from '@/providers/container';

/**
 * API Route Handler for Supplier Webhooks
 * Path: /api/webhooks/suppliers/:supplierId
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> },
) {
  const { supplierId } = await params;

  try {
    const signature = req.headers.get('x-supplier-signature') || '';
    const payload = await req.json();

    const result = await container.supplierWebhookService.handleWebhook(
      supplierId,
      payload,
      signature,
    );

    if (!result.success) {
      logger.error('Webhook processing failed', { supplierId, error: result.error! });
      return NextResponse.json(
        { error: result.error!.message },
        { status: result.error!.message === 'Invalid signature' ? 401 : 400 },
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook route error', { supplierId, error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
