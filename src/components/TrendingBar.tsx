'use client';

import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight, BarChart3 } from 'lucide-react';

interface Props {
  onSelectCategory: (topic: string) => void;
  lang: 'es' | 'en';
}

export default function TrendingBar({ onSelectCategory, lang }: Props) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        setLoading(true);
        const res = await fetch(`/api/trends?lang=${lang}`);
        const data = await res.json();
        if (Array.isArray(data)) setTopics(data);
      } catch (err) {
        console.error('Trend fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, [lang]);

  return (
    <div style={{
      background: '#050505',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '0.8rem 0',
      width: '100%'
    }}>
      <div className="container" style={{ 
        overflowX: 'auto', 
        msOverflowStyle: 'none', 
        scrollbarWidth: 'none',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          whiteSpace: 'nowrap', 
          minWidth: 'max-content' 
        }}>
          {/* XATAKA STYLE LABEL */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '9px', 
            fontWeight: 900, 
            color: 'white', 
            flexShrink: 0,
            letterSpacing: '-0.2px'
          }}>
            <Flame size={12} fill="#FF5C00" stroke="#FF5C00" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            <span style={{ opacity: 0.9 }}>HOY SE HABLA DE</span>
            <ChevronRight size={10} style={{ color: '#FF5C00' }} />
          </div>

          {/* DYNAMIC TOPICS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* ANALISIS TOP (FIXED REQD BY USER) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => onSelectCategory('Análisis')}
                  style={{ 
                    background: 'rgba(255,165,0,0.12)',
                    border: '1px solid rgba(255,165,0,0.25)',
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#FFA500',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(255,165,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,165,0,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,165,0,0.12)'}
                >
                  <BarChart3 size={11} /> {lang === 'es' ? 'ANÁLISIS TOP' : 'TOP ANALYSIS'}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                 {[1,2,3,4].map(i => <div key={i} style={{ width: '60px', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />)}
              </div>
            ) : topics.length === 0 ? (
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                {lang === 'es' ? 'Buscando historias...' : 'Exploring stories...'}
              </span>
            ) : (
              topics.map((topic, i) => (
                <div key={topic + i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    onClick={() => onSelectCategory(topic)}
                    style={{ 
                      background: i === 0 ? 'rgba(255, 92, 0, 0.1)' : 'transparent',
                      border: i === 0 ? '1px solid rgba(255, 92, 0, 0.2)' : 'none',
                      padding: i === 0 ? '2px 8px' : 0,
                      borderRadius: i === 0 ? '4px' : 0,
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: i === 0 ? 900 : 800,
                      color: i === 0 ? '#FF5C00' : 'rgba(255,255,255,0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FF5C00';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = i === 0 ? '#FF5C00' : 'rgba(255,255,255,0.8)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {i === 0 && <Flame size={10} fill="#FF5C00" stroke="#FF5C00" />}
                    {topic}
                  </button>
                  {i < topics.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>}
                </div>
              ))
            )}
            
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

            {/* CHOLLOS BUTTON AT THE END */}
            <a 
              href="https://www.chollometro.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.5rem 1.4rem',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, rgba(255,92,0,0.1), rgba(255,92,0,0.05))',
                border: '1px solid rgba(255,92,0,0.4)',
                color: 'white',
                fontWeight: 900,
                fontSize: '10px',
                letterSpacing: '1.2px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 4px 20px rgba(255,92,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FF5C00';
                e.currentTarget.style.borderColor = '#FF5C00';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,92,0,0.1), rgba(255,92,0,0.05))';
                e.currentTarget.style.borderColor = 'rgba(255,92,0,0.4)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>CHOLLOS</span> 
              <Flame size={12} fill="white" stroke="white" />
            </a>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
