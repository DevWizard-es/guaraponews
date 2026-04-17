import { NextResponse } from 'next/server';
import { fetchAndUpdateFeeds } from '@/lib/rss';

export async function GET(req: Request) {
  try {
    // In production, you would check an authorization header here to prevent abuse
    // e.g. if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
    
    const addedCount = await fetchAndUpdateFeeds();
    
    return NextResponse.json({ success: true, added: addedCount, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
