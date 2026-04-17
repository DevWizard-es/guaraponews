import { Shield, Lock, Eye, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | GuarapoNews',
  description: 'Cómo tratamos tus datos y cookies en GuarapoNews.',
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="headline-font" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Privacidad</h1>
        <p style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px' }}>GUARAPONEWS COMPLIANCE</p>
      </header>

      <div className="glass-panel" style={{ padding: '3rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={24} color="var(--accent)" /> Recopilación de Datos
          </h2>
          <p>
            En GuarapoNews, valoramos tu privacidad. Solo recopilamos información necesaria para personalizar tu feed de noticias mediante tu actividad de clics, asegurando una experiencia única.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Lock size={24} color="var(--accent)" /> Google AdSense & Cookies
          </h2>
          <p>
            Esta web utiliza Google AdSense para mostrar anuncios. Google, como proveedor externo, utiliza cookies para mostrar anuncios basados en tus visitas previas a este y otros sitios web. Los usuarios pueden inhabilitar el uso de la cookie de DoubleClick para la publicidad basada en intereses visitando Configuración de anuncios de Google.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Eye size={24} color="var(--accent)" /> Uso de la Información
          </h2>
          <p>
            Utilizamos los datos para mejorar la relevancia de las noticias y optimizar el rendimiento de la plataforma. Nunca compartiremos tus datos personales con terceros sin tu consentimiento explícito.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Trash2 size={24} color="var(--accent)" /> Tus Derechos
          </h2>
          <p>
            Tienes derecho a acceder, rectificar o eliminar tus datos en cualquier momento. Puedes contactarnos para cualquier solicitud relacionada con tu privacidad en nuestra sección de contacto.
          </p>
        </section>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a href="/" className="btn-glass">Volver a la Portada</a>
      </div>
    </div>
  );
}
