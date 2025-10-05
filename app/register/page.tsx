'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.requiresEmailConfirmation) {
          // Show success state with email confirmation message
          setMessage('success')
          setEmail('')
          setName('')
          setPassword('')
          setConfirmPassword('')
        } else {
          // Registration successful, redirect to home
          router.push('/')
          router.refresh()
        }
      } else {
        setError(data.error || 'Registrierung fehlgeschlagen')
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuche es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  // Show success message if email confirmation was sent
  if (message === 'success') {
    return (
      <div className="auth-container">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h2 style={{ marginBottom: '16px', color: '#10b981', fontSize: '24px' }}>
              Fast geschafft!
            </h2>
            <p style={{ marginBottom: '24px', fontSize: '16px', lineHeight: '1.5' }}>
              Wir haben dir eine <strong>Bestätigungs-E-Mail</strong> an deine E-Mail-Adresse gesendet.
            </p>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: 0, color: '#166534' }}>
                ✅ Bitte überprüfe dein Postfach<br />
                ✅ Klicke auf den Bestätigungslink<br />
                ✅ Danach kannst du dich anmelden
              </p>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Keine E-Mail erhalten? Prüfe auch deinen Spam-Ordner.
            </p>
            <Link href="/login" className="btn">
              Zur Anmeldung
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
          <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Account erstellen</h1>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Max Mustermann"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-Mail-Adresse</label>
              <input
                type="text"
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
              <small style={{ color: '#666', fontSize: '12px' }}>
                Mindestens 6 Zeichen
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Passwort bestätigen</label>
              <input
                type="password"
                id="confirmPassword"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && <div className="error" role="alert" aria-live="assertive">{error}</div>}
            {message && <div className="success" role="status" aria-live="polite">{message}</div>}

            <button
              type="submit"
              className="btn full"
              disabled={loading || !email.trim() || !name.trim() || !password || !confirmPassword}
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Erstelle Account...' : 'Account erstellen'}
            </button>
          </form>

          <div className="divider">
            <span>Bereits registriert?</span>
          </div>

          <Link href="/login" className="btn ghost full">
            Zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  )
}