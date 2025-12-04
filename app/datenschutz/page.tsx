export default function DatenschutzPage() {
  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <p className="tagline">Rechtliches</p>
        <h1>Datenschutzerklärung</h1>
        <div className="decorative-line"></div>
      </div>

      <div style={{ lineHeight: '1.8', color: 'var(--ink)' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>1. Datenschutz auf einen Blick</h2>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Allgemeine Hinweise</h3>
        <p style={{ marginBottom: '24px' }}>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
          Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
          denen Sie persönlich identifiziert werden können.
        </p>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Datenerfassung auf dieser Website</h3>
        <p style={{ marginBottom: '24px' }}>
          <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
          können Sie dem Impressum dieser Website entnehmen.
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>2. Hosting</h2>
        <p style={{ marginBottom: '24px' }}>
          Wir hosten die Inhalte unserer Website bei Vercel Inc. Anbieter ist die Vercel Inc.,
          440 N Barranca Ave #4133, Covina, CA 91723, USA.
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>3. Allgemeine Hinweise und Pflichtinformationen</h2>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Datenschutz</h3>
        <p style={{ marginBottom: '24px' }}>
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln
          Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften
          sowie dieser Datenschutzerklärung.
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>4. Datenerfassung auf dieser Website</h2>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Cookies</h3>
        <p style={{ marginBottom: '24px' }}>
          Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten
          auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung
          (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.<br /><br />
          Wir verwenden ausschließlich technisch notwendige Cookies für die Authentifizierung (Login-Funktion).
          Diese Cookies werden für 30 Tage gespeichert.
        </p>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Registrierung auf dieser Website</h3>
        <p style={{ marginBottom: '24px' }}>
          Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite zu nutzen.
          Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder
          Dienstes, für den Sie sich registriert haben. Die bei der Registrierung abgefragten Pflichtangaben
          müssen vollständig angegeben werden.<br /><br />
          Wir speichern: E-Mail-Adresse, Name, Buchungsdaten für Events.
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>5. E-Mail-Versand</h2>
        <p style={{ marginBottom: '24px' }}>
          Für den Versand von E-Mails (z.B. Buchungsbestätigungen) nutzen wir den Dienst Resend.
          Anbieter ist Resend, Inc. Die E-Mail-Adressen werden ausschließlich für die Kommunikation
          im Rahmen der Gastrotour-Events verwendet.
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>6. Ihre Rechte</h2>
        <p style={{ marginBottom: '24px' }}>
          Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen
          Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf
          Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz
          können Sie sich jederzeit an uns wenden.
        </p>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'var(--paper-warm)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--line)'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: 0 }}>
            <strong>Kontakt für Datenschutzanfragen:</strong><br />
            <a href="mailto:info@muenchner-gastrotour.de">info@muenchner-gastrotour.de</a>
          </p>
        </div>
      </div>
    </div>
  )
}
