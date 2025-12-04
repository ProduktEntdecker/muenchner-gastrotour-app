'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      setIsValidSession(true)
    }
    setCheckingSession(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/events')
        }, 2000)
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="auth-container">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="auth-container">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
              Link abgelaufen
            </h2>
            <p style={{ marginBottom: '24px', color: 'var(--muted)' }}>
              Dieser Link ist nicht mehr gültig. Bitte fordere einen neuen Link an.
            </p>
            <Link href="/auth/reset" className="btn">
              Neuen Link anfordern
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ marginBottom: '16px', color: '#10b981', fontSize: '24px' }}>
              Passwort geändert!
            </h2>
            <p style={{ marginBottom: '24px' }}>
              Du wirst gleich weitergeleitet...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="card">
        <div className="card-body">
          <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>Neues Passwort setzen</h1>
          <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px' }}>
            Gib dein neues Passwort ein.
          </p>

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label htmlFor="password">Neues Passwort</label>
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

            <button
              type="submit"
              className="btn full"
              disabled={loading || !password || !confirmPassword}
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Speichern...' : 'Passwort speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
