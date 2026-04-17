import { NextResponse } from 'next/server';
import { incrementViews } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    
    await incrementViews(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
