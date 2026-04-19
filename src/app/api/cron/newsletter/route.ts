import { NextResponse } from 'next/server';
import { getArticles, getSubscribers } from '@/lib/db';
import { sendDailyNewsletter } from '@/lib/email';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch top news for the summary (Home / Portada)
    const articles = await getArticles(1, 6, ['Todas'], 'es');
    
    if (articles.length === 0) {
      return NextResponse.json({ message: 'No articles found for today.' });
    }

    // 2. Fetch all subscribers
    const subscribers = await getSubscribers();
    
    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers found.' });
    }

    // 3. Send emails
    const results = await Promise.allSettled(
      subscribers.map(sub => sendDailyNewsletter(sub.email, sub.name, articles))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`[Newsletter] Sent: ${successCount}, Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount
    });
  } catch (error: any) {
    console.error('[Newsletter Cron Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
