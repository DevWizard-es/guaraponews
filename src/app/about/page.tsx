import { Cpu, Zap, Globe } from 'lucide-react';

export const metadata = {
  title: 'Sobre Nosotros | GuarapoNews',
  description: 'Conoce al equipo y la tecnología detrás de GuarapoNews.',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="headline-font" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Nosotros</h1>
        <p style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px' }}>THE FUTURE OF NEWS</p>
      </header>

      <div className="glass-panel" style={{ padding: '3rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.2rem', color: 'white', marginBottom: '2rem', fontWeight: 500 }}>
          GuarapoNews no es solo un agregador de noticias. Es una plataforma de inteligencia distribuida diseñada para ahorrarte tiempo. 
        </p>
        
        <p style={{ marginBottom: '3rem' }}>
          Nacida de la necesidad de filtrar el ruido informativo actual, nuestra tecnología de Backend escanea cientos de fuentes globales cada hora, sintetizando lo más relevante en 3 viñetas clave que puedes leer en segundos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Cpu size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'white' }}>Smart AI</h3>
            <p style={{ fontSize: '0.85rem' }}>Resúmenes automáticos de alta precisión.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Zap size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'white' }}>Velocidad OLED</h3>
            <p style={{ fontSize: '0.85rem' }}>Infraestructura optimizada para el rendimiento.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Globe size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'white' }}>Cobertura Global</h3>
            <p style={{ fontSize: '0.85rem' }}>Desde Tecnología hasta Finanzas mundiales.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a href="/" className="btn-glass">Volver a la Portada</a>
      </div>
    </div>
  );
}
