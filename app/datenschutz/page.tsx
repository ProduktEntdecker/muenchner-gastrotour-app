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

        <h2 className="mb-4 text-xl font-semibold">2. Hosting und Auftragsverarbeiter</h2>
        <p className="mb-4">
          Für den Betrieb dieser Website nutzen wir folgende Dienstleister:
        </p>
        <ul className="mb-6 list-disc pl-6 space-y-2">
          <li><strong>Vercel Inc.</strong> (Hosting) – 440 N Barranca Ave #4133, Covina, CA 91723, USA</li>
          <li><strong>Supabase Inc.</strong> (Datenbank, Authentifizierung) – Server in Dublin, Irland (EU)</li>
          <li><strong>Resend Inc.</strong> (E-Mail-Versand) – San Francisco, CA, USA</li>
        </ul>
        <p className="mb-6">
          Für die Übermittlung in die USA bestehen Standardvertragsklauseln (SCCs) gemäß Art. 46 DSGVO.
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

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Rechtsgrundlage der Verarbeitung</h3>
        <p className="mb-4">
          Die Verarbeitung Ihrer Daten erfolgt auf folgenden Rechtsgrundlagen (Art. 6 DSGVO):
        </p>
        <ul className="mb-6 list-disc pl-6 space-y-2">
          <li><strong>Registrierung & Profildaten:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b) – zur Nutzung der Plattform</li>
          <li><strong>Buchungsdaten:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b) – zur Teilnahme an Events</li>
          <li><strong>E-Mail-Benachrichtigungen:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b) – Buchungsbestätigungen und Event-Erinnerungen</li>
          <li><strong>Technische Cookies:</strong> Berechtigtes Interesse (Art. 6 Abs. 1 lit. f) – zur Authentifizierung</li>
        </ul>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Speicherdauer</h3>
        <p className="mb-4">
          Wir speichern Ihre Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist:
        </p>
        <ul className="mb-6 list-disc pl-6 space-y-2">
          <li><strong>Account-Daten:</strong> Bis zur Löschung Ihres Accounts</li>
          <li><strong>Buchungsdaten:</strong> Bis 1 Jahr nach dem Event-Datum</li>
          <li><strong>Session-Cookies:</strong> Maximal 30 Tage</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">5. E-Mail-Versand</h2>
        <p className="mb-6">
          Für den Versand von E-Mails (z.B. Buchungsbestätigungen) nutzen wir den Dienst Resend.
          Anbieter ist Resend, Inc. Die E-Mail-Adressen werden ausschließlich für die Kommunikation
          im Rahmen der Gastrotour-Events verwendet.
        </p>

        <h2 className="mb-4 text-xl font-semibold">6. Ihre Rechte</h2>
        <p className="mb-4">
          Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen
          Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf
          Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz
          können Sie sich jederzeit an uns wenden.
        </p>
        <p className="mb-4">
          <strong>Beschwerderecht bei der Aufsichtsbehörde:</strong><br />
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die für uns
          zuständige Aufsichtsbehörde ist:
        </p>
        <p className="mb-6">
          Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
          Promenade 18, 91522 Ansbach<br />
          <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
            www.lda.bayern.de
          </a>
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
