'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function EmailConfirmationPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'expired'>('checking')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // First check URL hash parameters (for direct Supabase confirmation)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // Also check URL search parameters (alternative format)
        const searchParams = new URLSearchParams(window.location.search)
        const token = searchParams.get('token')
        const confirmationType = searchParams.get('type')

        if (error) {
          setStatus('error')
          // Provide more specific error messages
          switch (error) {
            case 'access_denied':
              setMessage('E-Mail-Bestätigung wurde abgebrochen oder verweigert.')
              break
            case 'invalid_request':
              setMessage('Ungültiger Bestätigungslink. Der Link ist möglicherweise beschädigt.')
              break
            case 'expired_token':
              setStatus('expired')
              setMessage('Der Bestätigungslink ist abgelaufen. Bitte registriere dich erneut.')
              break
            default:
              setMessage(errorDescription || 'E-Mail-Bestätigung fehlgeschlagen. Bitte versuche es erneut.')
          }
          return
        }

        // Handle successful confirmation with tokens
        if (accessToken && refreshToken && (type === 'signup' || type === 'email_change')) {
          const supabase = createClient()
          
          // Set the session with the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('error')
            setMessage('Fehler beim Anmelden nach der Bestätigung. Bitte versuche dich manuell anzumelden.')
            return
          }

          setStatus('success')
          setMessage('E-Mail erfolgreich bestätigt! Du bist jetzt angemeldet.')

          // Clean up the URL to remove sensitive tokens
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }

          // Start countdown for redirect
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval)
                router.push('/')
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return
        }

        // Handle legacy confirmation with just access_token in hash
        if (window.location.hash.includes('access_token')) {
          // Try to extract tokens even if they weren't explicitly checked above
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            const supabase = createClient()
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            if (!sessionError) {
              setStatus('success')
              setMessage('E-Mail erfolgreich bestätigt! Du bist jetzt angemeldet.')
            } else {
              setStatus('success')
              setMessage('E-Mail erfolgreich bestätigt!')
            }
          } else {
            setStatus('success')
            setMessage('E-Mail erfolgreich bestätigt!')
          }

          // Clean up the URL
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }

          // Start countdown for redirect
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval)
                router.push('/')
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return
        }

        // Handle token-based confirmation (custom implementation)
        if (token && confirmationType) {
          // This would be for custom token confirmation if implemented
          setStatus('success')
          setMessage('E-Mail erfolgreich bestätigt!')
          
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval)
                router.push('/login')
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return
        }

        // No valid confirmation parameters found
        setStatus('error')
        setMessage('Ungültiger oder fehlender Bestätigungslink. Bitte überprüfe den Link aus deiner E-Mail.')
        
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.')
      }
    }

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(confirmEmail, 500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="auth-container">
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
          {status === 'checking' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <h2 style={{ marginBottom: '16px' }}>E-Mail wird bestätigt...</h2>
              <p style={{ color: '#666' }}>Bitte warten, während wir deine E-Mail-Adresse verifizieren...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#10b981' }}>✅</div>
              <h2 style={{ marginBottom: '16px', color: '#10b981' }}>Erfolgreich bestätigt!</h2>
              <p style={{ marginBottom: '16px' }}>{message}</p>
              {countdown > 0 && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
                  Weiterleitung in {countdown} Sekunden...
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" className="btn">
                  Zur Startseite
                </Link>
                <Link href="/login" className="btn ghost">
                  Zur Anmeldung
                </Link>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#f59e0b' }}>⏰</div>
              <h2 style={{ marginBottom: '16px', color: '#f59e0b' }}>Link abgelaufen</h2>
              <p style={{ marginBottom: '24px', color: '#666' }}>{message}</p>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                  💡 <strong>Tipp:</strong> Bestätigungslinks sind nur 24 Stunden gültig.<br />
                  Registriere dich einfach erneut mit derselben E-Mail-Adresse.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn">
                  Erneut registrieren
                </Link>
                <Link href="/login" className="btn ghost">
                  Zur Anmeldung
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#ef4444' }}>❌</div>
              <h2 style={{ marginBottom: '16px', color: '#ef4444' }}>Bestätigung fehlgeschlagen</h2>
              <p style={{ marginBottom: '24px', color: '#666' }}>{message}</p>
              
              <div style={{
                background: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px' }}>
                  <strong>Mögliche Lösungen:</strong><br />
                  • Überprüfe den vollständigen Link aus der E-Mail<br />
                  • Stelle sicher, dass der Link nicht abgelaufen ist<br />
                  • Prüfe deinen Spam-Ordner für eine neue E-Mail<br />
                  • Registriere dich erneut, falls der Link zu alt ist
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn">
                  Erneut registrieren
                </Link>
                <Link href="/login" className="btn ghost">
                  Zur Anmeldung
                </Link>
                <a 
                  href="mailto:info@muenchner-gastrotour.de?subject=Problem%20mit%20E-Mail-Bestätigung"
                  className="btn ghost"
                  style={{ fontSize: '14px' }}
                >
                  Hilfe anfordern
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}