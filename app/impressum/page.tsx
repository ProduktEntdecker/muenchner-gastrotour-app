export default function ImpressumPage() {
  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <p className="tagline">Rechtliches</p>
        <h1>Impressum</h1>
        <div className="decorative-line"></div>
      </div>

      <div style={{ lineHeight: '1.8', color: 'var(--ink)' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Angaben gemäß § 5 TMG</h2>
        <p style={{ marginBottom: '24px' }}>
          Florian Steiner<br />
          [Straße und Hausnummer]<br />
          [PLZ] München<br />
          Deutschland
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Kontakt</h2>
        <p style={{ marginBottom: '24px' }}>
          E-Mail: <a href="mailto:info@muenchner-gastrotour.de">info@muenchner-gastrotour.de</a>
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p style={{ marginBottom: '24px' }}>
          Florian Steiner<br />
          [Straße und Hausnummer]<br />
          [PLZ] München
        </p>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Haftungsausschluss</h2>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Haftung für Inhalte</h3>
        <p style={{ marginBottom: '24px' }}>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
          nach den allgemeinen Gesetzen verantwortlich.
        </p>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Haftung für Links</h3>
        <p style={{ marginBottom: '24px' }}>
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>

        <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>Urheberrecht</h3>
        <p style={{ marginBottom: '24px' }}>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'var(--paper-warm)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--line)'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: 0 }}>
            <strong>Hinweis:</strong> Dies ist eine private, nicht-kommerzielle Webseite für eine
            geschlossene Freundesgruppe. Es werden keine Waren oder Dienstleistungen angeboten.
          </p>
        </div>
      </div>
    </div>
  )
}
