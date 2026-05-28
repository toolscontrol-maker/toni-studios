import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, title, sizes, email, phone } = body;

    if (!email || !sizes?.length || !product) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('[Availability Request]', {
      timestamp: new Date().toISOString(),
      product,
      title,
      sizes,
      email,
      phone: phone ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
