'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

const TYPE_MAP: Record<string, string> = {
  print: 'Druk z pliku',
  design: 'Projektowanie',
  product: 'Gotowy produkt',
  contact: 'Kontakt',
}

const DELIVERY_MAP: Record<string, string> = {
  shipping: 'Wysyłka (kurier / paczkomat)',
  pickup: 'Odbiór osobisty w pracowni',
  discuss: 'Dostawa do ustalenia',
}

export function InquirySummary() {
  const fields = useFormFields(([f]) => f)

  const val = (name: string): string => {
    const v = fields[name]?.value
    return typeof v === 'string' || typeof v === 'number' ? String(v) : ''
  }

  const name = val('name')
  const company = val('company')
  const email = val('email')
  const phone = val('phone')
  const number = val('number')
  const type = val('type')
  const quantity = val('quantity') || '1'
  const deadline = val('deadline')
  const delivery = val('delivery')

  const cleanPhone = phone.replace(/[^\d+]/g, '')

  return (
    <div
      style={{
        padding: '16px 20px',
        background: 'var(--theme-elevation-50, #f8fafc)',
        border: '1.5px solid var(--theme-elevation-200, #cbd5e1)',
        borderRadius: 8,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--theme-elevation-900, #0f172a)' }}>
          {name || 'Bez imienia'}
          {company && <span style={{ fontWeight: 400, opacity: 0.85 }}> · {company}</span>}
        </div>
        {number && (
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--theme-accent, #c2410c)' }}>
            {number}
          </span>
        )}
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
        {email && (
          <div>
            <span style={{ opacity: 0.65 }}>E-mail: </span>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(`Solid Print — zapytanie ${number}`)}`}
              style={{ color: 'var(--theme-accent, #c2410c)', textDecoration: 'underline' }}
            >
              {email}
            </a>
          </div>
        )}
        {phone && (
          <div>
            <span style={{ opacity: 0.65 }}>Tel: </span>
            <a
              href={`tel:${cleanPhone}`}
              style={{ color: 'var(--theme-accent, #c2410c)', textDecoration: 'underline' }}
            >
              {phone}
            </a>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px dashed var(--theme-elevation-200, #cbd5e1)',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 13,
          color: 'var(--theme-elevation-700, #334155)',
        }}
      >
        <span>
          <strong>Rodzaj:</strong> {TYPE_MAP[type] || type || '—'}
        </span>
        <span>
          <strong>Liczba sztuk:</strong> {quantity}
        </span>
        <span>
          <strong>Oczekiwany termin:</strong> {deadline || 'Do ustalenia'}
        </span>
        <span>
          <strong>Dostawa:</strong> {DELIVERY_MAP[delivery] || delivery || 'Do ustalenia'}
        </span>
      </div>
    </div>
  )
}
