import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(_request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();
  return response;
}

export async function getSession(_request: NextRequest) {
  return null;
}
