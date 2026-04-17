'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        isRegister: isRegister.toString(),
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass animate-fade" style={{ maxWidth: '450px', width: '100%', padding: '3rem', borderRadius: '32px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', color: 'var(--accent)', marginBottom: '1.5rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 className="headline-font" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Únete a SnappNews para guardar tus preferencias.' : 'Inicia sesión para ver tus noticias personalizadas.'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>Usuario</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              className="glass" 
              style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '1rem', outline: 'none' }}
              placeholder="Ej: juan_news"
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="glass" 
              style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '1rem', outline: 'none' }}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', fontSize: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }} disabled={loading}>
            {loading ? 'Cargando...' : (isRegister ? <><UserPlus size={20} /> Registrarse</> : <><LogIn size={20} /> Entrar ahora</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}
