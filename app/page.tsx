'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Event {
  id: number
  name: string
  date: string
  address: string
  maxSeats: number
  seatsAvailable: number
  seatsTaken: number
}

export default function HomePage() {
  const [nextEvent, setNextEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNextEvent()
  }, [])

  const fetchNextEvent = async () => {
    try {
      const res = await fetch('/api/events?upcoming=true&limit=1')
      const data = await res.json()

      if (res.ok && data.events && data.events.length > 0) {
        setNextEvent(data.events[0])
      }
    } catch (err) {
      console.error('Error fetching next event:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container">
      <div className="hero">
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          🍽️ Münchner Gastrotour
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--muted)', marginBottom: '40px' }}>
          Gemeinsam essen. Max. 8 Plätze. Einmal im Monat.
        </p>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Lade nächstes Event...</p>
          </div>
        ) : nextEvent ? (
          <div className="card event-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '32px' }}>
            <div className="card-body">
              <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>📍 Nächstes Event</h2>

              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>{nextEvent.name}</h3>

              <div style={{ marginBottom: '24px' }}>
                <div className="detail-item" style={{ marginBottom: '12px' }}>
                  <span>📅</span>
                  <strong>{formatDate(nextEvent.date)}</strong>
                </div>
                <div className="detail-item">
                  <span>📍</span>
                  <span>{nextEvent.address}</span>
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: nextEvent.seatsAvailable === 0 ? '#f8d7da' : '#d4edda',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: nextEvent.seatsAvailable === 0 ? '#dc3545' : '#28a745'
                }}>
                  {nextEvent.seatsAvailable}
                </div>
                <div style={{ fontSize: '16px', color: '#666' }}>
                  von {nextEvent.maxSeats} Plätzen verfügbar
                </div>
              </div>

              <Link href="/events" className="btn" style={{ width: '100%', fontSize: '18px' }}>
                {nextEvent.seatsAvailable === 0 ? 'Zur Warteliste' : 'Jetzt Platz reservieren'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Noch kein Event geplant</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Sobald das nächste Event feststeht, kannst du dich hier anmelden.
            </p>
            <Link href="/events" className="btn">
              Alle Events ansehen
            </Link>
          </div>
        )}

        <div style={{ marginTop: '80px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>So funktioniert&apos;s</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. Registrieren</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  Erstelle einen Account mit deiner E-Mail-Adresse.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. Platz reservieren</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  Sichere dir einen der 8 Plätze für das nächste Event.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍻</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. Dabei sein</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  Komm zum Restaurant und genieße den Abend mit der Gruppe.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '24px' }}>Bereit für dein nächstes kulinarisches Abenteuer?</h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/events" className="btn" style={{ fontSize: '16px', padding: '12px 24px' }}>
              🎯 Events ansehen
            </Link>
            <Link href="/register" className="btn ghost" style={{ fontSize: '16px', padding: '12px 24px' }}>
              👤 Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}