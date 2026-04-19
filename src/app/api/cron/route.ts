import { NextResponse } from 'next/server';
import { fetchAndUpdateFeeds } from '@/lib/rss';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    // In production, check for the secret to prevent abuse
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const addedCount = await fetchAndUpdateFeeds();
    
    return NextResponse.json({ success: true, added: addedCount, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
