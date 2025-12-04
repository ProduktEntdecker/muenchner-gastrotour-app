'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      setIsLoggedIn(true)
      router.push('/events')
    } else {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p>Laden...</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return null // Will redirect to /events
  }

  return (
    <div className="container">
      <div className="hero" style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '60px' }}>
        <p className="tagline">Exklusiv für Mitglieder</p>
        <h1>
          Münchner Gastrotour
        </h1>
        <div className="decorative-line" style={{ margin: '24px auto' }}></div>
        <p style={{ margin: '0 auto', maxWidth: '500px' }}>
          Gemeinsam essen. Max. 8 Plätze. Einmal im Monat.
        </p>

        <div className="card" style={{ maxWidth: '420px', margin: '48px auto 0' }}>
          <div className="card-body" style={{ padding: '32px' }}>
            <p style={{ marginBottom: '28px', color: 'var(--ink-soft)', fontSize: '15px', lineHeight: '1.7' }}>
              Diese Seite ist nur für Mitglieder unserer privaten Dinner-Runde zugänglich.
            </p>

            <Link href="/login" className="btn full" style={{ marginBottom: '12px' }}>
              Anmelden
            </Link>

            <Link href="/register" className="btn ghost full">
              Registrieren
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '80px', maxWidth: '700px', margin: '80px auto 0' }}>
          <h2 style={{ marginBottom: '12px' }}>So funktioniert&apos;s</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '40px', fontSize: '16px' }}>
            In drei einfachen Schritten zum gemeinsamen Dinner
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-body" style={{ padding: '28px 20px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.5rem',
                  fontWeight: '500',
                  color: 'var(--messing)',
                  marginBottom: '16px',
                  lineHeight: '1'
                }}>1</div>
                <p style={{ fontSize: '15px', color: 'var(--ink)' }}>Registrieren mit Einladungscode</p>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-body" style={{ padding: '28px 20px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.5rem',
                  fontWeight: '500',
                  color: 'var(--messing)',
                  marginBottom: '16px',
                  lineHeight: '1'
                }}>2</div>
                <p style={{ fontSize: '15px', color: 'var(--ink)' }}>Platz reservieren</p>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-body" style={{ padding: '28px 20px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.5rem',
                  fontWeight: '500',
                  color: 'var(--messing)',
                  marginBottom: '16px',
                  lineHeight: '1'
                }}>3</div>
                <p style={{ fontSize: '15px', color: 'var(--ink)' }}>Gemeinsam genießen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
