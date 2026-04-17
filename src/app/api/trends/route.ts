import { NextResponse } from 'next/server';
import { getTrends } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'es';
    const trends = await getTrends(7, lang);
    return NextResponse.json(trends);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
