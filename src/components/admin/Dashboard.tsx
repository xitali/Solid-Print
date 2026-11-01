import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function Dashboard() {
  let fresh = 0
  let review = 0
  let quarantined = 0
  let failedMail = 0

  try {
    const payload = await getPayload({ config })
    const [freshCount, reviewCount, quarantinedCount, failedMailCount] = await Promise.all([
      payload.count({ collection: 'inquiries', where: { status: { equals: 'new' } } }).catch(() => ({ totalDocs: 0 })),
      payload.count({ collection: 'inquiries', where: { status: { equals: 'review' } } }).catch(() => ({ totalDocs: 0 })),
      payload.count({ collection: 'quote-files', where: { status: { equals: 'quarantined' } } }).catch(() => ({ totalDocs: 0 })),
      payload.count({ collection: 'outbox', where: { state: { equals: 'failed' } } }).catch(() => ({ totalDocs: 0 })),
    ])
    fresh = freshCount.totalDocs
    review = reviewCount.totalDocs
    quarantined = quarantinedCount.totalDocs
    failedMail = failedMailCount.totalDocs
  } catch {}

  const cards = [
    {
      label: 'Nowe zapytania',
      count: fresh,
      desc: 'Wymagają sprawdzenia i pierwszej odpowiedzi',
      href: '/admin/collections/inquiries?where[status][equals]=new',
      highlight: fresh > 0,
      accent: '#C2410C',
    },
    {
      label: 'Czeka na ofertę',
      count: review,
      desc: 'W trakcie oceny technologicznej lub wyceny',
      href: '/admin/collections/inquiries?where[status][equals]=review',
      highlight: review > 0,
      accent: '#D97706',
    },
    {
      label: 'Pliki w kwarantannie',
      count: quarantined,
      desc: 'Załączniki klientów oczekujące na skan',
      href: '/admin/collections/quote-files?where[status][equals]=quarantined',
      highlight: quarantined > 0,
      accent: '#2563EB',
    },
    {
      label: 'Błędy wysyłki poczty',
      count: failedMail,
      desc: 'Zgłoszenia w kolejce z problemem wysyłki',
      href: '/admin/collections/outbox?where[state][equals]=failed',
      highlight: failedMail > 0,
      accent: '#DC2626',
    },
  ]

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Nagłówek powitalny */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          background: 'var(--theme-elevation-50, #f8fafc)',
          border: '1px solid var(--theme-elevation-150, #e2e8f0)',
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--theme-elevation-900, #0f172a)' }}>
            Solid Print — Panel pracowni
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--theme-elevation-600, #64748b)' }}>
            Obsługa zapytań, baza modeli 3D, katalog produktów i ustawienia serwisu.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--theme-elevation-150, #e2e8f0)',
              color: 'var(--theme-elevation-800, #1e293b)',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Otwórz stronę ↗
          </a>
          <Link
            href="/admin/collections/inquiries"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--theme-accent, #c2410c)',
              color: '#ffffff',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Przejdź do zapytań →
          </Link>
        </div>
      </div>

      {/* Siatka liczników i stanu systemu */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            style={{
              display: 'block',
              padding: '16px 20px',
              background: 'var(--theme-elevation-50, #f8fafc)',
              border: card.highlight
                ? `1.5px solid ${card.accent}`
                : '1px solid var(--theme-elevation-150, #e2e8f0)',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: card.highlight ? card.accent : 'var(--theme-elevation-600, #64748b)',
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1.2,
                marginTop: 6,
                color: card.highlight ? card.accent : 'var(--theme-elevation-400, #94a3b8)',
              }}
            >
              {card.count}
            </div>
            <div
              style={{
                fontSize: 12,
                marginTop: 4,
                color: 'var(--theme-elevation-600, #64748b)',
                lineHeight: 1.4,
              }}
            >
              {card.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
