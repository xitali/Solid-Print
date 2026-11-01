import React from 'react'

const LABELS: Record<string, string> = {
  print: 'Druk z pliku',
  design: 'Projektowanie',
  product: 'Gotowy produkt',
  contact: 'Kontakt',
}

export function TypeCell({ cellData }: { cellData?: string }) {
  const label = LABELS[cellData ?? ''] ?? cellData ?? '—'
  return (
    <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}
