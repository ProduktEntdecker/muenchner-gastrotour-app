'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      )

      if (error) {
        setError(error.message)
      } else {
        setMessage('success')
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  if (message === 'success') {
    return (
      <div className="auth-container">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h2 style={{ marginBottom: '16px', color: '#10b981', fontSize: '24px' }}>
              E-Mail gesendet!
            </h2>
            <p style={{ marginBottom: '24px', fontSize: '16px', lineHeight: '1.5' }}>
              Wir haben dir einen Link zum Zurücksetzen deines Passworts gesendet.
            </p>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: 0, color: '#166534' }}>
                Prüfe dein Postfach und klicke auf den Link in der E-Mail.
              </p>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Keine E-Mail erhalten? Prüfe auch deinen Spam-Ordner.
            </p>
            <Link href="/login" className="btn">
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="card">
        <div className="card-body">
          <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>Passwort zurücksetzen</h1>
          <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px' }}>
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
          </p>

          <form onSubmit={handleReset}>
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

            {error && <div className="error" role="alert" aria-live="assertive">{error}</div>}

            <button
              type="submit"
              className="btn full"
              disabled={loading || !email.trim()}
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Sende E-Mail...' : 'Link senden'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '14px', color: 'var(--primary)' }}>
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
