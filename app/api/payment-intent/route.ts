import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  void req;
  return NextResponse.json(
    { error: 'Deprecated endpoint. Use /api/create-payment-intent with server-side pricing.' },
    { status: 410 }
  );
}
