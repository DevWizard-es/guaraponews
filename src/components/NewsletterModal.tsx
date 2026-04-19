'use client';

import { useState } from 'react';
import { Mail, User, X, CheckCircle2, Loader2, Rocket } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Algo salió mal');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Error de conexión');
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel modal-content" style={{ width: '100%', maxWidth: '500px', padding: '3rem', position: 'relative', border: '1px solid var(--accent)' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <style jsx>{`
          @media (max-width: 600px) {
            .modal-content { padding: 2rem 1.25rem !important; }
          }
        `}</style>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={60} color="var(--accent)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="headline-font" style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>¡De lujo, {name.split(' ')[0]}!</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Te has sumado a la red VIP de Guarapo News XTRA. Pronto recibirás tu primer resumen inteligente.</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 3rem' }}>VOLVER AL FEED</button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ background: 'var(--accent)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'black' }}>
                <Rocket size={30} />
              </div>
              <h2 className="headline-font" style={{ fontSize: '2.2rem', color: 'white', marginBottom: '0.75rem' }}>Guarapo <span style={{ color: 'var(--accent)' }}>XTRA</span></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Suscríbete al resumen diario redactado por IA más inteligente de la red.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Tu nombre" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #222', padding: '1.2rem 1.2rem 1.2rem 3rem', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }} 
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="Tu mejor email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #222', padding: '1.2rem 1.2rem 1.2rem 3rem', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }} 
                />
              </div>

              {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</p>}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="btn-primary" 
                style={{ padding: '1.1rem', fontSize: '1rem', fontWeight: 800, background: 'var(--accent)', color: 'black', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'SUSCRIBIRME AHORA'}
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Prometemos 0% spam. Solo información de valor real.</p>
          </>
        )}
      </div>
    </div>
  );
}
