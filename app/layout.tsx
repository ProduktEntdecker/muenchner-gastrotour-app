import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Münchner Gastrotour",
  description: "Gemeinsam essen. Max. 8 Plätze. Einmal im Monat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <header>
          <div className="container navbar">
            <Link href="/" className="brand">
              <span className="dot"></span>
              <span>Münchner Gastrotour</span>
            </Link>
            <div className="nav-actions" id="nav-actions">
              <NavBar />
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--line)', padding: '40px 0', marginTop: '60px' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Kontakt</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  Allgemeine Anfragen:<br />
                  <a href="mailto:info@muenchner-gastrotour.de">info@muenchner-gastrotour.de</a>
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Über uns</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  Eine private Freundesrunde für gemeinsames Essen in München.
                  Einmal im Monat, max. 8 Plätze.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Rechtliches</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  <a href="/impressum">Impressum</a><br />
                  <a href="/datenschutz">Datenschutz</a>
                </p>
              </div>
            </div>
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
                © {new Date().getFullYear()} Münchner Gastrotour. Privat initiierte Freundesrunde.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
