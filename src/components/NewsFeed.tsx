'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Clock, ExternalLink, Flame, Share2, LogOut, Sparkles, LayoutGrid, Newspaper, Globe, UserCheck, ChevronRight, Camera, Smartphone, Cpu, BrainCircuit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Article } from '@/lib/db';
import Link from 'next/link';
import TrendingBar from './TrendingBar';
import NewsletterModal from './NewsletterModal';

interface Props {
  initialArticles: Article[];
}

const CATEGORIES = [
  { id: 'Todas', name: { es: 'Portada', en: 'Home' }, icon: Newspaper },
  { id: 'IA', name: { es: 'IA', en: 'AI' }, icon: BrainCircuit },
  { id: 'Apple', name: { es: 'Apple', en: 'Apple' }, icon: Smartphone },
  { id: 'Android', name: { es: 'Android', en: 'Android' }, icon: Smartphone },
  { id: 'Fotografía', name: { es: 'Foto', en: 'Photo' }, icon: Camera },
  { id: 'Tecnología', name: { es: 'Tecno', en: 'Tech' }, icon: Sparkles },
  { id: 'Política', name: { es: 'Política', en: 'Politics' }, icon: Newspaper },
  { id: 'Finanzas', name: { es: 'Finanzas', en: 'Finance' }, icon: LayoutGrid },
  { id: 'Moda', name: { es: 'Moda', en: 'Fashion' } },
  { id: 'Mundo', name: { es: 'Mundo', en: 'World' }, icon: Globe },
];

export default function NewsFeed({ initialArticles }: Props) {
  const { data: session } = useSession();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [hasShownNewsletter, setHasShownNewsletter] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const revealObserver = useRef<IntersectionObserver | null>(null);

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Auto-trigger newsletter at 60% scroll
      if (progress > 60 && !hasShownNewsletter && !session) {
        setShowNewsletter(true);
        setHasShownNewsletter(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownNewsletter, session]);

  // Auto-trigger newsletter after 45s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasShownNewsletter && !session) {
        setShowNewsletter(true);
        setHasShownNewsletter(true);
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [hasShownNewsletter, session]);

  // Reveal Animations
  const setupRevealObserver = useCallback(() => {
    if (revealObserver.current) revealObserver.current.disconnect();
    revealObserver.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          revealObserver.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  }, []);

  useEffect(() => {
    setupRevealObserver();
    const items = document.querySelectorAll('.card-reveal');
    items.forEach(item => revealObserver.current?.observe(item));
  }, [articles, setupRevealObserver]);

  // Infinite Scroll
  const lastArticleRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchMore = async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    const cats = activeCategory === 'Todas' ? '' : `&categories=${activeCategory}`;
    const search = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
    const limit = 24;
    
    try {
      const res = await fetch(`/api/articles?page=${currentPage}&limit=${limit}&lang=${lang}${cats}${search}`);
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        setHasMore(false);
        return;
      }
      if (data.length < limit) setHasMore(false);
      
      if (reset) setArticles(data);
      else setArticles(prev => [...prev, ...data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page > 1) fetchMore();
  }, [page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMore(true);
  }, [activeCategory, lang, searchTerm]);

  const t = {
    tagline: { es: 'Información inteligente diseñada por Backend Engineers.', en: 'Smart news designed by Backend Engineers.' },
    login: { es: 'Entrar', en: 'Connect' },
    logout: { es: 'Salir', en: 'Exit' },
    loading: { es: 'Sincronizando la red...', en: 'Syncing grid...' },
    visitAI: { es: 'Ver GuarapoIA', en: 'View AI' },
    readTime: { es: 'min de lectura', en: 'min read' },
    author: { es: 'Redacción Guarapo News', en: 'Guarapo News Staff' }
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (term: string) => {
    setActiveCategory('Todas');
    setSearchTerm(term);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
      <NewsletterModal isOpen={showNewsletter} onClose={() => setShowNewsletter(false)} />
      
      {/* MINIMAL BRAND HEADER */}
      <div className="header-main" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)', borderBottom: '1px solid var(--border)', padding: '0.8rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none', minWidth: 'max-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 className="headline-font logo-text" style={{ fontWeight: 900, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>Guarapo<span style={{ color: 'var(--accent)' }}>News</span></h1>
              <span className="hide-mobile" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginTop: '4px' }}>{t.tagline[lang]}</span>
            </div>
          </Link>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
             <a href="https://guarapoia.com/" target="_blank" rel="noopener noreferrer" className="btn-primary hide-mobile" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
              <Sparkles size={14} /> <span>{t.visitAI[lang]}</span>
            </a>

            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <button onClick={() => setLang('es')} style={{ padding: '0.4rem 0.6rem', borderRadius: '100px', border: 'none', cursor: 'pointer', background: lang === 'es' ? 'var(--accent)' : 'transparent', color: lang === 'es' ? 'black' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.6rem' }}>ES</button>
               <button onClick={() => setLang('en')} style={{ padding: '0.4rem 0.6rem', borderRadius: '100px', border: 'none', cursor: 'pointer', background: lang === 'en' ? 'var(--accent)' : 'transparent', color: lang === 'en' ? 'black' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.6rem' }}>EN</button>
            </div>

            {!session ? (
              <button className="login-btn" onClick={() => signIn()} style={{ background: 'white', color: 'black', border: 'none', borderRadius: '100px', padding: '0.5rem 1.2rem', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t.login[lang]}
              </button>
            ) : (
              <button onClick={() => signOut()} className="btn-glass" style={{ padding: '0.5rem' }}>
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .logo-text { font-size: 1.8rem; }
        @media (max-width: 768px) {
          .logo-text { font-size: 1.3rem; }
          .hide-mobile { display: none !important; }
          .login-btn { padding: 0.4rem 0.8rem !important; font-size: 0.65rem !important; }
          .card-title { font-size: 1.6rem !important; }
        }
      `}</style>

      {/* XATAKA STYLE TRENDING BAR */}
      <TrendingBar lang={lang} onSelectCategory={(topic) => {
        // Mapeo inteligente
        const cat = CATEGORIES.find(c => (c.name as any)[lang].toLowerCase() === topic.toLowerCase() || c.id.toLowerCase() === topic.toLowerCase());
        if (cat) {
          handleCategoryChange(cat.id);
        } else {
          handleSearch(topic);
        }
      }} />

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        {/* MAIN CATEGORY NAV (GLASS) */}
        <div style={{ marginBottom: '3rem', position: 'sticky', top: '70px', background: 'black', zIndex: 90 }}>
          <div className="category-nav-container overflow-x-auto no-scrollbar" style={{ display: 'flex', gap: '0.8rem', paddingBottom: '0.5rem' }}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryChange(cat.id)}
                className={`btn-glass ${activeCategory === cat.id ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1.5rem' }}
              >
                {cat.icon && <cat.icon size={12} />} {(cat.name as any)[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '0' }}>
        {/* HYBRID GRID: TOP 3 BENTO */}
        <div className="bento-grid" style={{ marginBottom: '5rem' }}>
          {Array.isArray(articles) && articles.slice(0, 3).map((article, i) => {
            const price = article.title.match(/(\d+\s*€|€\s*\d+)/);
            const isReview = /(Análisis|Review|Prueba)/i.test(article.title);
            
            return (
              <article 
                key={article.id + i} 
                className={`glass-panel card-reveal ${i === 0 ? 'span-large' : 'span-wide'}`} 
                onMouseDown={() => { 
                  // Track Interest (Category)
                  if (session?.user) fetch('/api/track', { method: 'POST', body: JSON.stringify({ category: article.category })});
                  // Track View (Article)
                  fetch('/api/track/view', { method: 'POST', body: JSON.stringify({ id: article.id })});
                }}
              >
                <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="card-image-wrapper" style={{ position: 'relative', width: '100%', flex: '0 0 55%', overflow: 'hidden' }}>
                      <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', background: 'rgba(0,0,0,0.9)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900 }}>{article.source}</div>
                      
                      {(isReview || searchTerm === 'Análisis') && (
                        <div className="rating-badge" style={{ 
                          position: 'absolute', 
                          top: '1.25rem', 
                          right: '1.25rem', 
                          border: 'none', 
                          background: 'var(--accent-tdg)',
                          color: 'black',
                          fontWeight: 900,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 15px rgba(255, 92, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          {searchTerm === 'Análisis' ? (8 + (article.id.charCodeAt(0) % 20) / 10).toFixed(1) : '9.2'}
                        </div>
                      )}
                  </div>
                  <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                         <span className="tdg-orange font-black text-[10px] tracking-widest">
                           <span className="mr-2 opacity-30">|</span>{article.category.toUpperCase()}
                         </span>
                         {price && (
                           <div className="price-pill"><Flame size={10} /> {price[0]}</div>
                         )}
                      </div>
                      <h2 className="headline-font card-title" style={{ fontSize: i === 0 ? '2.8rem' : '1.8rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white', lineHeight: 1.1 }}>{article.title}</h2>
                      <div style={{ marginTop: 'auto' }}>
                        <div className="author-pill"><UserCheck size={14} color="var(--accent)" /> {t.author[lang]} • {Math.ceil(article.bullets.length * 0.5) + 1} {t.readTime[lang]}</div>
                      </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>

        {/* XTRA BANNER: MIDDLE RECRUITMENT */}
        <div className="xtra-banner animate-fade-in card-reveal">
           <h2 className="headline-font" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Súmate a <span style={{ color: 'var(--accent)' }}>Guarapo News XTRA</span></h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>Apoya el periodismo impulsado por ingeniería técnica y recibe alertas exclusivas de última hora.</p>
           <button onClick={() => setShowNewsletter(true)} className="btn-primary" style={{ padding: '1rem 3rem' }}>SABER MÁS <ChevronRight size={18} /></button>
        </div>

        {/* HYBRID GRID: THE REST IN LIST FORMAT */}
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {Array.isArray(articles) && articles.slice(3).map((article, i) => {
            const price = article.title.match(/(\d+\s*€|€\s*\d+)/);
            const isReview = /(Análisis|Review|Prueba)/i.test(article.title);
            
            return (
              <div key={article.id + i} ref={i === articles.length - 4 ? lastArticleRef : null}>
                 <article className="list-item card-reveal" onMouseDown={() => { if (session?.user) fetch('/api/track', { method: 'POST', body: JSON.stringify({ category: article.category })}) }}>
                    <div className="list-item-content">
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="tdg-orange font-black text-[10px] tracking-widest">
                          <span className="mr-2 opacity-30">|</span>{article.category.toUpperCase()}
                        </span>
                        {price && (
                          <div className="price-pill ml-auto"><Flame size={10} /> {price[0]}</div>
                        )}
                      </div>
                      
                      <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                         <div style={{ flex: 1 }}>
                            <h2 className="headline-font" style={{ 
                              fontSize: '1.6rem', 
                              fontWeight: 900, 
                              color: 'white', 
                              marginBottom: '1rem', 
                              lineHeight: 1.2,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              height: '4.3rem'
                            }}>{article.title}</h2>
                         </div>
                          {(isReview || searchTerm === 'Análisis') && (
                             <div className="rating-badge" style={{ 
                               flexShrink: 0,
                               background: 'var(--accent-tdg)',
                               color: 'black',
                               fontWeight: 900,
                               padding: '0.2rem 0.6rem',
                               borderRadius: '6px',
                               fontSize: '0.7rem',
                               marginLeft: '1rem'
                             }}>
                               {searchTerm === 'Análisis' ? (8 + (article.id.charCodeAt(0) % 20) / 10).toFixed(1) : '9.2'}
                             </div>
                          )}
                      </a>
                      <ul style={{ 
                        paddingLeft: '1.1rem', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.95rem', 
                        marginBottom: '1.5rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                         {article.bullets.slice(0, 2).map((b, bi) => <li key={bi}>{b}</li>)}
                      </ul>
                      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <div className="author-pill"><UserCheck size={14} color="var(--accent)" /> {t.author[lang]} • {Math.ceil(article.bullets.length * 0.5) + 1} {t.readTime[lang]}</div>
                      </div>
                    </div>
                    
                    <div className="list-item-image card-image-wrapper" style={{ position: 'relative', overflow: 'hidden', background: '#050505' }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: article.category === 'IA' ? 'linear-gradient(135deg, #10b981 10%, #000 90%)' : 'linear-gradient(135deg, #1f1f1f 0%, #000 100%)',
                      }}>
                         {(() => {
                           const Icon = CATEGORIES.find(c => c.id === article.category)?.icon;
                           return Icon ? <Icon size={48} color="rgba(255,255,255,0.15)" /> : null;
                         })()}
                      </div>

                      <img 
                        src={article.image} 
                        alt="" 
                        loading="lazy"
                        style={{ 
                          position: 'relative', 
                          zIndex: 2, 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          opacity: 0,
                          transition: 'opacity 0.8s ease'
                        }} 
                        onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                 </article>

                 {/* engagement blocks inside map div */}
                 {i % 6 === 5 && (
                    <div className="card-reveal" style={{ padding: '4rem', background: 'linear-gradient(to right, #000, #050505)', borderRadius: '32px', border: '1px solid #111', margin: '3rem 0', textAlign: 'center' }}>
                      <Flame size={32} color="var(--accent)" style={{ margin: '0 auto 1.5rem' }} />
                      <h3 className="headline-font" style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1rem' }}>Sigue el hilo de la innovación</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>¿Te apasiona la {activeCategory === 'Todas' ? 'Tecnología' : activeCategory}? Suscríbete para no perderte nada.</p>
                      <button onClick={() => setShowNewsletter(true)} className="btn-glass" style={{ padding: '1rem 3rem' }}>ACTIVAR ALERTAS</button>
                    </div>
                 )}
              </div>
            );
          })}
        </div>

        {loading && (
          <div style={{ padding: '8rem', textAlign: 'center', color: 'var(--accent)' }}>
             <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
             <span style={{ fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t.loading[lang]}</span>
          </div>
        )}

        {/* FOOTER AUTHORITY LINKS */}
        <footer style={{ marginTop: '10rem', padding: '8rem 0', borderTop: '1px solid #111', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
             <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>SOBRE NOSOTROS</Link>
             <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>PRIVACIDAD</Link>
             <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>TÉRMINOS</Link>
             <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>CONTACTO</Link>
          </div>

          <div className="glass-panel" style={{ display: 'inline-block', padding: '1.25rem 3rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>ENGINEERED BY</span> YORDAN DE ARMAS
            </p>
          </div>
          
          <p style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
            &copy; {new Date().getFullYear()} GUARAPONEWS. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
            UNA PLATAFORMA DE <a href="https://guarapoia.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 900 }}>GUARAPOIA.COM</a>
          </p>
        </footer>
      </div>
    </>
  );
}
