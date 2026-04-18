import { getArticles } from '@/lib/db';
import NewsFeed from '@/components/NewsFeed';

export const revalidate = 600; // Recache every 10 mins

export default async function Home() {
  // Fetch initial batch for ES Language and 'Todas' category
  const initialArticles = await getArticles(1, 12, [], 'es');

  return (
    <main className="container">
      <NewsFeed initialArticles={initialArticles} />
    </main>
  );
}
