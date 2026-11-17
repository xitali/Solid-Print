'use client'

import { useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import { STATUS_OPTIONS } from '@/collections/inquiries'

const nextSteps: Record<string, string> = {
  new: 'Sprawdź opis i załączniki. W razie potrzeby poproś o uzupełnienie danych.',
  review: 'Ustal zakres, cenę i termin, a następnie przygotuj ofertę.',
  quoted: 'Poczekaj na akceptację oferty. Po akceptacji zmień status na „W realizacji”.',
  production: 'Potwierdź zakończenie pracy i sposób przekazania zamówienia.',
  closed: 'Sprawa jest zamknięta.',
  rejected: 'Sprawa jest odrzucona.',
}

const templates = {
  confirm: { label: 'Potwierdzenie', body: 'Dziękuję za przesłanie zapytania. Sprawdzę szczegóły i wrócę z informacją o możliwościach wykonania.' },
  missing: { label: 'Prośba o brakujące dane', body: 'Dziękuję za zapytanie. Do przygotowania wyceny potrzebuję jeszcze:\n\n[uzupełnij brakujące informacje]' },
  offer: { label: 'Oferta', body: 'Przesyłam ofertę dotyczącą Twojego zapytania.\n\nZakres: [uzupełnij]\nCena: [uzupełnij]\nTermin: [uzupełnij]\n\nDaj proszę znać, czy możemy przystąpić do realizacji.' },
}

export function InquiryWorkflow() {
  const { value: status, setValue, disabled, formProcessing } = useField<string>({ path: 'status' })
  const number = useFormFields(([fields]) => fields.number?.value as string | undefined)
  const name = useFormFields(([fields]) => fields.name?.value as string | undefined)
  const email = useFormFields(([fields]) => fields.email?.value as string | undefined)
  const [template, setTemplate] = useState<keyof typeof templates>('confirm')
  const [draft, setDraft] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  if (!number) return null

  const subject = `Solid Print — zapytanie ${number}`
  const message = draft ?? `${name?.trim() ? `Dzień dobry, ${name.trim()}!` : 'Dzień dobry!'}\n\n${templates[template].body}\n\nNumer zapytania: ${number}\n\nPozdrawiam\nSolid Print`
  const address = email?.trim() && /^[^\s@<>]+@[^\s@<>]+$/.test(email.trim()) ? email.trim() : null

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${message}`)
      setFeedback('Odpowiedź skopiowana.')
    } catch {
      setFeedback('Nie udało się skopiować automatycznie. Zaznacz tekst i skopiuj go ręcznie.')
    }
  }

  return (
    <section className="sp-workspace-panel sp-admin-card sp-inquiry-workflow">
      <h2>Następny krok</h2>
      <p>{nextSteps[status] ?? 'Sprawdź zapytanie i uzupełnij status.'}</p>
      <label>Szybka zmiana statusu
        <select value={status ?? ''} onChange={(event) => setValue(event.target.value)} disabled={disabled || formProcessing}>
          {STATUS_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <small>Aby zachować zmianę w historii, kliknij „Zapisz” u góry.</small>
      <details>
        <summary>Przygotuj odpowiedź</summary>
        <label>Szablon
          <select value={template} onChange={(event) => { setTemplate(event.target.value as keyof typeof templates); setDraft(null); setFeedback('') }}>
            {Object.entries(templates).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
        </label>
        <label>Treść odpowiedzi
          <textarea rows={8} value={message} onChange={(event) => { setDraft(event.target.value); setFeedback('') }} />
        </label>
        <div className="sp-shortcuts">
          <button type="button" onClick={copy}>Kopiuj odpowiedź</button>
          {address && <a href={`mailto:${encodeURIComponent(address)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}>Otwórz w poczcie</a>}
        </div>
        {feedback && <p role="status">{feedback}</p>}
      </details>
    </section>
  )
}
