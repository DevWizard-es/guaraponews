export const metadata = {
  title: 'Términos de Servicio | GuarapoNews',
  description: 'Condiciones de uso de la plataforma GuarapoNews.',
};

export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="headline-font" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Términos</h1>
        <p style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px' }}>CONTRATO DE USO</p>
      </header>

      <div className="glass-panel" style={{ padding: '3rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>1. Aceptación</h2>
          <p>Al acceder a GuarapoNews, aceptas estar sujeto a estos términos. Si no estás de acuerdo, por favor deja de utilizar el servicio inmediatamente.</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>2. Propiedad Intelectual</h2>
          <p>Todo el contenido agregado y resumido en esta plataforma pertenece a sus respectivos dueños originales. GuarapoNews actúa como un agregador de noticias con valor añadido (resúmenes de IA).</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>3. Uso del Servicio</h2>
          <p>Se prohíbe el uso de scrapers, bots o cualquier método automatizado para extraer contenido de GuarapoNews sin autorización previa.</p>
        </section>

        <section>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>4. Limitación de Responsabilidad</h2>
          <p>GuarapoNews no garantiza la exactitud absoluta de las noticias resumidas. Instamos a los usuarios a consultar las fuentes originales mediante los enlaces proporcionados.</p>
        </section>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a href="/" className="btn-glass">Volver a la Portada</a>
      </div>
    </div>
  );
}
