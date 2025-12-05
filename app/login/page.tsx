'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Set session persistence based on "Remember Me" checkbox
      // When checked: session persists across browser restarts (30 days)
      // When unchecked: session ends when browser closes
      if (!rememberMe) {
        // For non-persistent session, we'll handle logout on browser close via storage
        localStorage.setItem('gastrotour_session_temp', 'true')
      } else {
        localStorage.removeItem('gastrotour_session_temp')
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('E-Mail-Adresse oder Passwort falsch')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse')
        } else if (error.message.includes('Load failed') || error.message.includes('Failed to fetch')) {
          setError('Verbindungsfehler. Bitte prüfe deine Internetverbindung oder deaktiviere Content-Blocker.')
        } else {
          setError(error.message)
        }
      } else {
        // Hard redirect to ensure cookies are sent and NavBar refreshes
        window.location.href = '/events'
      }
    } catch (err) {
      // Handle network errors that don't come from Supabase
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch')) {
        setError('Verbindungsfehler. Bitte prüfe deine Internetverbindung oder deaktiviere Content-Blocker.')
      } else {
        setError('Netzwerkfehler. Bitte versuche es später erneut.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <div className="card-body">
          <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Anmelden</h1>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">E-Mail-Adresse</label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="dein.name@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Passwort</label>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Angemeldet bleiben
                </label>
                <Link href="/auth/reset" style={{ fontSize: '14px', color: 'var(--messing-dark)' }}>
                  Passwort vergessen?
                </Link>
              </div>
            </div>

            {error && <div className="error" role="alert" aria-live="assertive">{error}</div>}

            <button
              type="submit"
              className="btn full"
              disabled={loading || !email.trim() || !password}
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>

          <div className="divider">
            <span>Neu hier?</span>
          </div>

          <Link href="/register" className="btn ghost full">
            Account erstellen
          </Link>
        </div>
      </div>
    </div>
  )
}
