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
      <div className="hero" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Münchner Gastrotour
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--muted)', marginBottom: '40px' }}>
          Gemeinsam essen. Max. 8 Plätze. Einmal im Monat.
        </p>

        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '32px' }}>
          <div className="card-body">
            <p style={{ marginBottom: '24px', color: 'var(--muted)' }}>
              Diese Seite ist nur für Mitglieder der WhatsApp-Gruppe zugänglich.
            </p>

            <Link href="/login" className="btn" style={{ width: '100%', marginBottom: '12px' }}>
              Anmelden
            </Link>

            <Link href="/register" className="btn ghost" style={{ width: '100%' }}>
              Registrieren
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '60px', maxWidth: '600px', margin: '60px auto 0' }}>
          <h2 style={{ marginBottom: '24px' }}>So funktioniert&apos;s</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>1.</div>
                <p style={{ fontSize: '14px' }}>Registrieren mit Einladungscode</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>2.</div>
                <p style={{ fontSize: '14px' }}>Platz reservieren</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>3.</div>
                <p style={{ fontSize: '14px' }}>Dabei sein</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
