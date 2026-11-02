import React from 'react'

const TONE: Record<string, { bg: string; fg: string; label: string }> = {
  new: { bg: '#C2410C', fg: '#FFFFFF', label: 'Nowe' },
  review: { bg: '#F2C14E', fg: '#1C1B19', label: 'W ocenie' },
  quoted: { bg: '#1D4ED8', fg: '#FFFFFF', label: 'Oferta wysłana' },
  production: { bg: '#15803D', fg: '#FFFFFF', label: 'W realizacji' },
  closed: { bg: '#E3DFD5', fg: '#1C1B19', label: 'Zamknięte' },
  rejected: { bg: '#B42318', fg: '#FFFFFF', label: 'Odrzucone' },
}

export function StatusCell({ cellData }: { cellData?: string }) {
  const tone = TONE[cellData ?? ''] ?? { bg: '#E3DFD5', fg: '#1C1B19', label: cellData ?? '—' }
  return (
    <span
      className="sp-status-cell"
      style={{
        display: 'inline-block',
        background: tone.bg,
        color: tone.fg,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {tone.label}
    </span>
  )
}
