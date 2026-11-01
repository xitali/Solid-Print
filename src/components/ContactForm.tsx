'use client'

import { useState, useRef } from 'react'
import { ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { sendInquiry, type SubmissionState } from '@/lib/submission'

export function ContactForm() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [number, setNumber] = useState('')
  const state = useRef<SubmissionState | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      if (!state.current) state.current = { key: crypto.randomUUID(), session: null }
      setNumber(
        await sendInquiry(
          state.current,
          {
            type: 'contact',
            name: form.get('name'),
            email: form.get('email'),
            description: form.get('description'),
            privacy: form.get('privacy') === 'on',
            website: form.get('website'),
          },
          []
        )
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wysłać wiadomości. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }

  if (number) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={42} strokeWidth={1.5} color="var(--accent)" />
        <h3>Dziękujemy za wiadomość.</h3>
        <p>
          Zapisaliśmy Twoje zapytanie. Numer zgłoszenia:{' '}
          <strong className="mono" style={{ color: 'var(--accent)' }}>
            {number}
          </strong>
          . Odpowiemy najszybciej jak to możliwe.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="contact-form">
      <div className="field">
        <label htmlFor="contact-name">
          Jak masz na imię? <span className="req">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          className="input"
          placeholder="Twoje imię"
          required
          minLength={2}
          maxLength={100}
          autoComplete="given-name"
        />
      </div>

      <div className="field">
        <label htmlFor="contact-email">
          Twój e-mail <span className="req">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className="input"
          placeholder="twoj@email.pl"
          required
          maxLength={254}
          autoComplete="email"
        />
      </div>

      <div className="field">
        <label htmlFor="contact-description">
          Co chodzi Ci po głowie? <span className="req">*</span>
        </label>
        <textarea
          id="contact-description"
          name="description"
          className="textarea"
          placeholder="Opisz krótko swój pomysł, projekt lub zadaj pytanie…"
          required
          minLength={10}
          maxLength={10000}
          rows={5}
        />
        <span className="hint">Minimum 10 znaków.</span>
      </div>

      <div className="honeypot" aria-hidden="true" style={{ display: 'none' }}>
        <label>
          Strona internetowa
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="field">
        <label className="checkbox-custom-label">
          <input type="checkbox" name="privacy" required className="checkbox-custom" />
          <span className="checkbox-text">
            Zapoznałem/am się z{' '}
            <a href="/prywatnosc" target="_blank" className="text-link">
              informacją o prywatności
            </a>{' '}
            i rozumiem, jak będą obsługiwane dane z zapytania. <span className="req">*</span>
          </span>
        </label>
      </div>

      {error && (
        <div className="form-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <button className="btn btn--primary" type="submit" disabled={busy}>
        <span>{busy ? 'Wysyłanie…' : 'Wyślij wiadomość'}</span>
        <ArrowUpRight size={18} />
      </button>

      <p className="form-note">To początek rozmowy, bez zobowiązań. Cenę i termin ustalimy po poznaniu szczegółów.</p>
    </form>
  )
}
