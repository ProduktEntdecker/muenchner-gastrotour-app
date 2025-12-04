export default function DatenschutzPage(): JSX.Element {
  return (
    <div className="container py-16 px-5 max-w-3xl mx-auto">
      <div className="section-header mb-10">
        <p className="tagline">Rechtliches</p>
        <h1>Datenschutzerklärung</h1>
        <div className="decorative-line"></div>
      </div>

      <div className="leading-relaxed text-[var(--ink)]">
        <h2 className="mb-4 text-xl font-semibold">1. Datenschutz auf einen Blick</h2>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Allgemeine Hinweise</h3>
        <p className="mb-6">
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
          Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
          denen Sie persönlich identifiziert werden können.
        </p>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Datenerfassung auf dieser Website</h3>
        <p className="mb-6">
          <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
          können Sie dem Impressum dieser Website entnehmen.
        </p>

        <h2 className="mb-4 text-xl font-semibold">2. Hosting</h2>
        <p className="mb-6">
          Wir hosten die Inhalte unserer Website bei Vercel Inc. Anbieter ist die Vercel Inc.,
          440 N Barranca Ave #4133, Covina, CA 91723, USA.
        </p>

        <h2 className="mb-4 text-xl font-semibold">3. Allgemeine Hinweise und Pflichtinformationen</h2>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Datenschutz</h3>
        <p className="mb-6">
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln
          Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften
          sowie dieser Datenschutzerklärung.
        </p>

        <h2 className="mb-4 text-xl font-semibold">4. Datenerfassung auf dieser Website</h2>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Cookies</h3>
        <p className="mb-6">
          Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten
          auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung
          (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.<br /><br />
          Wir verwenden ausschließlich technisch notwendige Cookies für die Authentifizierung (Login-Funktion).
          Diese Cookies werden für 30 Tage gespeichert.
        </p>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Registrierung auf dieser Website</h3>
        <p className="mb-6">
          Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite zu nutzen.
          Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder
          Dienstes, für den Sie sich registriert haben. Die bei der Registrierung abgefragten Pflichtangaben
          müssen vollständig angegeben werden.<br /><br />
          Wir speichern: E-Mail-Adresse, Name, Buchungsdaten für Events.
        </p>

        <h2 className="mb-4 text-xl font-semibold">5. E-Mail-Versand</h2>
        <p className="mb-6">
          Für den Versand von E-Mails (z.B. Buchungsbestätigungen) nutzen wir den Dienst Resend.
          Anbieter ist Resend, Inc. Die E-Mail-Adressen werden ausschließlich für die Kommunikation
          im Rahmen der Gastrotour-Events verwendet.
        </p>

        <h2 className="mb-4 text-xl font-semibold">6. Ihre Rechte</h2>
        <p className="mb-6">
          Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen
          Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf
          Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz
          können Sie sich jederzeit an uns wenden.
        </p>

        <div className="mt-10 p-5 bg-[var(--paper-warm)] rounded-lg border border-[var(--line)]">
          <p className="text-sm text-[var(--ink-soft)] m-0">
            <strong>Kontakt für Datenschutzanfragen:</strong><br />
            <a href="mailto:info@muenchner-gastrotour.de">info@muenchner-gastrotour.de</a>
          </p>
        </div>
      </div>
    </div>
  )
}
