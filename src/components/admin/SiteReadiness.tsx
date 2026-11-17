'use client'

import { useFormFields } from '@payloadcms/ui'

const requiredContent = [
  ['Dane sprzedawcy', ['sellerName']],
  ['Kanał kontaktu', ['phone', 'email']],
  ['Polityka prywatności', ['privacyText']],
  ['Zasady zamówień', ['termsText']],
  ['Informacje o cookies', ['cookiesText']],
] as const

export function SiteReadiness() {
  const fields = useFormFields(([state]) => state)
  const itemState = requiredContent.map(([label, keys]) => ({
    label, complete: keys.some((key) => typeof fields[key]?.value === 'string' && String(fields[key].value).trim().length > 0),
  }))

  return (
    <details className="sp-admin-card sp-site-readiness">
      <summary>Treści do publikacji · {itemState.filter(({ complete }) => complete).length}/{itemState.length}</summary>
      <ul>{itemState.map(({ label, complete }) => <li key={label}><strong>{label}</strong>
        <span className={`sp-state-pill sp-state-${complete ? 'ok' : 'waiting'}`}>{complete ? 'Uzupełnione' : 'Do uzupełnienia'}</span>
      </li>)}</ul>
    </details>
  )
}
