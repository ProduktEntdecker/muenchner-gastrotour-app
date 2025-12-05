export default function ImpressumPage(): JSX.Element {
  return (
    <div className="container py-16 px-5 max-w-3xl mx-auto">
      <div className="section-header mb-10">
        <p className="tagline">Rechtliches</p>
        <h1>Impressum</h1>
        <div className="decorative-line"></div>
      </div>

      <div className="leading-relaxed text-[var(--ink)]">
        <h2 className="mb-4 text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
        <p className="mb-6">
          Dr. Florian Steiner<br />
          St.-Ingbert-Str. 9<br />
          81541 München<br />
          Deutschland
        </p>

        <h2 className="mb-4 text-xl font-semibold">Kontakt</h2>
        <p className="mb-6">
          E-Mail: <a href="mailto:info@muenchner-gastrotour.de">info@muenchner-gastrotour.de</a>
        </p>

        <h2 className="mb-4 text-xl font-semibold">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p className="mb-6">
          Dr. Florian Steiner<br />
          St.-Ingbert-Str. 9<br />
          81541 München
        </p>

        <h2 className="mb-4 text-xl font-semibold">Haftungsausschluss</h2>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Haftung für Inhalte</h3>
        <p className="mb-6">
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
          nach den allgemeinen Gesetzen verantwortlich.
        </p>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Haftung für Links</h3>
        <p className="mb-6">
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>

        <h3 className="mb-3 text-lg text-[var(--ink-soft)]">Urheberrecht</h3>
        <p className="mb-6">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>

        <div className="mt-10 p-5 bg-[var(--paper-warm)] rounded-lg border border-[var(--line)]">
          <p className="text-sm text-[var(--ink-soft)] m-0">
            <strong>Hinweis:</strong> Dies ist eine private, nicht-kommerzielle Webseite für eine
            geschlossene Freundesgruppe. Es werden keine Waren oder Dienstleistungen angeboten.
          </p>
        </div>
      </div>
    </div>
  )
}
