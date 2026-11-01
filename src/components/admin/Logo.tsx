import { MonogramSP } from '@/components/Brand'

export function Logo() {
  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: -1,
        color: '#17191A',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <MonogramSP size={36} />
      <span>Solid Print</span>
    </div>
  )
}

export function Icon() {
  return <MonogramSP size={28} />
}
