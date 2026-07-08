import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PranaKaia Health Check',
    timestamp: new Date().toISOString(),
  });
}
