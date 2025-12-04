'use client'

import { useState } from 'react'

interface ReviewFormProps {
  eventId: string
  eventName: string
  onClose: () => void
  onSuccess: () => void
}

function StarRating({
  label,
  value,
  onChange,
  required = true
}: {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
}) {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--ink)',
        fontFamily: 'var(--font-ui)'
      }}>
        {label} {required && <span style={{ color: 'var(--bordeaux)' }}>*</span>}
      </label>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '28px',
              color: star <= (hover || value) ? 'var(--messing-dark)' : 'var(--line)',
              transition: 'color 0.15s ease, transform 0.15s ease',
              transform: star <= hover ? 'scale(1.1)' : 'scale(1)'
            }}
            aria-label={`${star} Sterne`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReviewForm({ eventId, eventName, onClose, onSuccess }: ReviewFormProps): JSX.Element {
  const [foodRating, setFoodRating] = useState(0)
  const [ambianceRating, setAmbianceRating] = useState(0)
  const [serviceRating, setServiceRating] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (foodRating === 0 || ambianceRating === 0 || serviceRating === 0) {
      setError('Bitte vergib alle drei Bewertungen')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          foodRating,
          ambianceRating,
          serviceRating,
          text: text.trim() || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Fehler beim Speichern')
        return
      }

      onSuccess()
    } catch {
      setError('Netzwerkfehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-md)',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: '500',
              margin: 0,
              color: 'var(--ink)'
            }}>
              Bewertung abgeben
            </h2>
            <p style={{
              color: 'var(--ink-soft)',
              marginTop: '8px',
              fontSize: '15px',
              fontFamily: 'var(--font-body)'
            }}>
              {eventName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--ink-soft)',
              padding: '4px'
            }}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <StarRating
            label="Essen"
            value={foodRating}
            onChange={setFoodRating}
          />

          <StarRating
            label="Ambiente"
            value={ambianceRating}
            onChange={setAmbianceRating}
          />

          <StarRating
            label="Service"
            value={serviceRating}
            onChange={setServiceRating}
          />

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="review-text"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--ink)',
                fontFamily: 'var(--font-ui)'
              }}
            >
              Kommentar <span style={{ color: 'var(--ink-soft)', fontWeight: '400' }}>(optional)</span>
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Erzähl uns von deinem Erlebnis..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                fontSize: '15px',
                fontFamily: 'var(--font-body)',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: 'var(--ink-soft)',
              marginTop: '6px',
              textAlign: 'right'
            }}>
              {text.length}/1000
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(139, 47, 52, 0.1)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--bordeaux)',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn secondary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Wird gespeichert...' : 'Bewertung absenden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
