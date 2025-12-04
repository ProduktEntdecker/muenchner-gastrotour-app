'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Redirect to home page on successful login
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen')
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuche es später erneut.')
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
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <Link href="/auth/reset" style={{ fontSize: '14px', color: 'var(--primary)' }}>
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