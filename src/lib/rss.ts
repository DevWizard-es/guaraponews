import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import { saveArticle, Article, deleteOldArticles, setLastUpdate } from './db';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['media:group', 'group'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded']
    ],
  }
});

interface FeedConfig {
  url: string;
  source: string;
  category: string;
  lang: 'es' | 'en';
}

const FEEDS: FeedConfig[] = [
  // --- MUNDO / GLOBAL (Top Tier Agencies) ---
  { url: 'https://feeds.reuters.com/Reuters/worldNews', source: 'Reuters', category: 'Mundo', lang: 'en' },
  { url: 'https://feeds.apnews.com/rss/apf-topnews', source: 'Associated Press', category: 'Mundo', lang: 'en' },
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', category: 'Mundo', lang: 'en' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times', category: 'Mundo', lang: 'en' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', category: 'Mundo', lang: 'en' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'Mundo', lang: 'en' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', source: 'Deutsche Welle', category: 'Mundo', lang: 'en' },
  { url: 'https://www.france24.com/en/rss', source: 'France 24', category: 'Mundo', lang: 'en' },
  { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada.xml', source: 'El País', category: 'Mundo', lang: 'es' },
  { url: 'https://www.rtve.es/api/noticias/noticias_mundo.rss', source: 'RTVE Mundo', category: 'Mundo', lang: 'es' },

  // --- FINANZAS / NEGOCIOS (Top Tier) ---
  { url: 'https://feeds.bloomberg.com/business/news.rss', source: 'Bloomberg', category: 'Finanzas', lang: 'en' },
  { url: 'https://www.ft.com/?format=rss', source: 'Financial Times', category: 'Finanzas', lang: 'en' },
  { url: 'https://feeds.a.dj.com/rss/RSSBusiness.xml', source: 'WSJ Business', category: 'Finanzas', lang: 'en' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', category: 'Finanzas', lang: 'en' },
  { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch', category: 'Finanzas', lang: 'en' },
  { url: 'https://www.eleconomista.es/rss/', source: 'elEconomista', category: 'Finanzas', lang: 'es' },
  { url: 'https://cincodias.elpais.com/rss/', source: 'Cinco Días', category: 'Finanzas', lang: 'es' },
  { url: 'https://www.expansion.com/rss/portada.xml', source: 'Expansión', category: 'Finanzas', lang: 'es' },

  // --- TECNOLOGÍA (Diversified) ---
  { url: 'https://feeds.reuters.com/reuters/technologyNews', source: 'Reuters Tech', category: 'Tecnología', lang: 'en' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', category: 'Tecnología', lang: 'en' },
  { url: 'https://feeds.weblogssl.com/xataka2', source: 'Xataka', category: 'Tecnología', lang: 'es' },
  { url: 'https://es.gizmodo.com/rss', source: 'Gizmodo ES', category: 'Tecnología', lang: 'es' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired', category: 'Tecnología', lang: 'en' },
  { url: 'https://www.techradar.com/rss', source: 'TechRadar', category: 'Tecnología', lang: 'en' },
  { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', category: 'Tecnología', lang: 'en' },
  { url: 'https://www.engadget.com/rss.xml', source: 'Engadget', category: 'Tecnología', lang: 'en' },

  // --- INTELIGENCIA ARTIFICIAL (IA) ---
  { url: 'https://www.genbeta.com/categoria/inteligencia-artificial/rss', source: 'Genbeta IA', category: 'IA', lang: 'es' },
  { url: 'https://www.xataka.com/tag/inteligencia-artificial/rss', source: 'Xataka IA', category: 'IA', lang: 'es' },
  { url: 'https://elpais.com/noticias/inteligencia-artificial/rss/', source: 'El País IA', category: 'IA', lang: 'es' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI', category: 'IA', lang: 'en' },
  { url: 'https://www.wired.com/category/science/ai/feed/rss', source: 'Wired AI', category: 'IA', lang: 'en' },
  { url: 'https://openai.com/news/rss.xml', source: 'OpenAI', category: 'IA', lang: 'en' },
  { url: 'https://deepmind.google/blog/rss.xml', source: 'Google DeepMind', category: 'IA', lang: 'en' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', source: 'MIT Tech AI', category: 'IA', lang: 'en' },

  // --- APPLE ---
  { url: 'https://www.applesfera.com/index.xml', source: 'Applesfera', category: 'Apple', lang: 'es' },
  { url: 'https://9to5mac.com/feed/', source: '9to5Mac', category: 'Apple', lang: 'en' },
  { url: 'https://www.macrumors.com/macrumors.xml', source: 'MacRumors', category: 'Apple', lang: 'en' },
  { url: 'https://www.cultofmac.com/feed/', source: 'Cult of Mac', category: 'Apple', lang: 'en' },
  { url: 'https://appleinsider.com/rss/news/', source: 'Appleinsider', category: 'Apple', lang: 'en' },

  // --- ANDROID ---
  { url: 'https://www.xatakandroid.com/index.xml', source: 'Xatakandroid', category: 'Android', lang: 'es' },
  { url: 'https://9to5google.com/feed/', source: '9to5Google', category: 'Android', lang: 'en' },
  { url: 'https://www.androidauthority.com/feed/', source: 'Android Authority', category: 'Android', lang: 'en' },
  { url: 'https://www.androidcentral.com/feed', source: 'Android Central', category: 'Android', lang: 'en' },
  { url: 'https://www.androidpolice.com/feed/', source: 'Android Police', category: 'Android', lang: 'en' },

  // --- FOTOGRAFÍA ---
  { url: 'https://www.photolari.com/feed/', source: 'Photolari', category: 'Fotografía', lang: 'es' },
  { url: 'https://www.xatakafoto.com/index.xml', source: 'Xataka Foto', category: 'Fotografía', lang: 'es' },
  { url: 'https://www.albedomedia.com/feed/', source: 'Albedo Media', category: 'Fotografía', lang: 'es' },
  { url: 'https://www.casanovafoto.com/blog/feed/', source: 'Casanova Blog', category: 'Fotografía', lang: 'es' },
  { url: 'https://www.dpreview.com/feeds/news.rss', source: 'DPReview', category: 'Fotografía', lang: 'en' },
  { url: 'https://fstoppers.com/rss', source: 'Fstoppers', category: 'Fotografía', lang: 'en' },
  { url: 'https://petapixel.com/feed/', source: 'PetaPixel', category: 'Fotografía', lang: 'en' },
  { url: 'https://canonrumors.com/feed/', source: 'Canon Rumors', category: 'Fotografía', lang: 'en' },
  { url: 'https://nikonrumors.com/feed/', source: 'Nikon Rumors', category: 'Fotografía', lang: 'en' },
  { url: 'https://sonyalpharumors.com/feed/', source: 'Sony Rumors', category: 'Fotografía', lang: 'en' },

  // --- POLÍTICA ---
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYT Politics', category: 'Política', lang: 'en' },
  { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/politica/portada.xml', source: 'El País Política', category: 'Política', lang: 'es' },
  { url: 'http://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics', category: 'Política', lang: 'en' },
  { url: 'https://www.politico.com/rss/politics.xml', source: 'Politico', category: 'Política', lang: 'en' },

  // --- MODA ---
  { url: 'https://elpais.com/rss/smoda/portada.xml', source: 'S Moda', category: 'Moda', lang: 'es' },
  { url: 'https://www.vogue.com/feed/rss', source: 'Vogue', category: 'Moda', lang: 'en' },
  { url: 'https://www.elle.com/rss/all.xml', source: 'Elle', category: 'Moda', lang: 'en' }
];

async function extractImageDeep(link: string, category: string): Promise<string> {
  const isDeepSource = link.includes('techcrunch.com') || link.includes('wired.com') || link.includes('openai.com');
  
  if (isDeepSource) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(link, { signal: controller.signal });
      const html = await res.text();
      clearTimeout(timeoutId);
      
      const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/) || 
                      html.match(/<meta[^>]+content="([^">]+)"[^>]+property="og:image"/);
      
      if (ogMatch && ogMatch[1]) return ogMatch[1];
    } catch (e) {}
  }

  const fallbacks: Record<string, string> = {
    'IA': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000',
    'Apple': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000',
    'Android': 'https://images.unsplash.com/photo-1607252831350-b4da48d3ebdf?q=80&w=1000',
    'Fotografía': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000',
    'Finanzas': 'https://images.unsplash.com/photo-1611974717483-5858cf7c1d13?q=80&w=1000',
    'Mundo': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1000',
    'Tecnología': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000'
  };

  return fallbacks[category] || 'https://images.unsplash.com/photo-1585829365295-ab7cd40dac98?q=80&w=1000';
}

function extractImage(item: any, category: string): string {
  const candidates: (string | undefined)[] = [];
  
  if (item.enclosure && item.enclosure.url) candidates.push(item.enclosure.url);
  if (item.media && item.media.$ && item.media.$.url) candidates.push(item.media.$.url);
  if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) candidates.push(item.thumbnail.$.url);
  
  if (item.group && item.group['media:content']) {
    const gc = item.group['media:content'];
    if (Array.isArray(gc)) candidates.push(gc[0]?.$?.url);
    else if (gc.$?.url) candidates.push(gc.$?.url);
  }

  const html = item.contentEncoded || item.content || item.description || '';
  const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) candidates.push(imgMatch[1]);

  const validImg = candidates.find(c => c && c.startsWith('http') && !c.includes('favicon'));
  if (validImg) {
    let src = validImg;
    if (src.startsWith('//')) src = 'https:' + src;
    return src;
  }

  return '';
}

function extractBullets(item: any): string[] {
  const html = item.contentEncoded || item.description || item.contentSnippet || '';
  const root = parse(html);
  const text = root.textContent.trim().replace(/\n/g, ' ');
  if (!text || text.length < 20) return ['Pulsa para leer el reporte completo en la fuente original.'];
  const sentences = text.split('.').map(s => s.trim()).filter(s => s.length > 25); 
  if (sentences.length === 0) return [text.substring(0, 160) + '...'];
  return sentences.slice(0, 3).map(s => s + '.');
}

export async function fetchAndUpdateFeeds() {
  await deleteOldArticles(3);
  let added = 0;
  for (const feedConfig of FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      for (const item of feed.items) {
        if (!item.link) continue;
        
        let imageUrl = extractImage(item, feedConfig.category);
        if (!imageUrl) {
          imageUrl = await extractImageDeep(item.link, feedConfig.category);
        }

        const newArticle: Article = {
          id: Math.random().toString(36).substring(2, 10),
          title: item.title?.trim() || 'Sin Titular',
          link: item.link,
          image: imageUrl,
          source: feedConfig.source,
          pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          bullets: extractBullets(item),
          category: feedConfig.category,
          lang: feedConfig.lang
        };
        try {
          await saveArticle(newArticle);
          added++;
        } catch(e) {}
      }
    } catch (err) {
      console.error(`Error fetching ${feedConfig.source}:`, err);
    }
  }

  await setLastUpdate(Date.now());
  return added;
}
