'use client';

import { MessageSquare, X, ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="headline-font" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Contacto</h1>
        <p style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px' }}>GET IN TOUCH</p>
      </header>

      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          ¿Tienes sugerencias, reportes de errores o propuestas comerciales? Estaremos encantados de escucharte.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          <a 
            href="https://guarapoia.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', 
              padding: '1.2rem 3rem', 
              borderRadius: '100px', 
              border: '1px solid var(--accent)',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
             <Sparkles size={24} color="var(--accent)" />
             <span style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }}>VISITAR GUARAPO IA</span>
          </a>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
             <a href="https://twitter.com/guarapoia" target="_blank" rel="noopener noreferrer" className="btn-glass" style={{ padding: '1rem' }}>
              <X size={20} />
             </a>
             <a href="#" className="btn-glass" style={{ padding: '1rem' }}>
              <MessageSquare size={20} />
             </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <Link href="/" className="btn-glass" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft size={16} /> Volver a la Portada
        </Link>
      </div>
    </div>
  );
}
