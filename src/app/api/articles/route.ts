import { NextResponse } from 'next/server';
import { getArticles, getLastUpdate } from '@/lib/db';
import { fetchAndUpdateFeeds } from '@/lib/rss';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const lang = searchParams.get('lang') || 'es';
  const categoriesParam = searchParams.get('categories');
  const categories = categoriesParam ? categoriesParam.split(',') : [];

  // SELF-HEALING UPDATE PULSE:
  // If last update was more than 15 minutes ago, trigger ingestion in background
  const lastUpdate = await getLastUpdate();
  const fifteenMinutes = 15 * 60 * 1000;
  
  if (Date.now() - lastUpdate > fifteenMinutes) {
    console.log('--- AUTO-PULSE: Triggering background RSS update ---');
    // We don't await this to avoid blocking the response
    fetchAndUpdateFeeds().catch(console.error);
  }

  try {
    const userId = (session?.user as any)?.id;
    const search = searchParams.get('search') || undefined;
    const articles = await getArticles(page, limit, categories, lang, userId, search);
    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
