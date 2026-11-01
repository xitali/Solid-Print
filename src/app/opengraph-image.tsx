import { ImageResponse } from 'next/og'

export const alt = 'Solid Print — pracownia projektowania i druku 3D'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: '#F6F4EF',
        color: '#17191A',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Monogram SP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 64 }}>
          <div style={{ width: 64, height: 12, borderRadius: 6, background: '#C2410C' }} />
          <div style={{ width: 64, height: 12, borderRadius: 6, background: '#17191A' }} />
          <div style={{ width: 48, height: 12, borderRadius: 6, background: '#17191A' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5 }}>Solid Print</span>
          <span style={{ fontSize: 13, letterSpacing: 3, color: '#5B605C', fontFamily: 'monospace' }}>
            PROJEKTOWANIE I DRUK 3D
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '8px 18px',
            background: '#F2C14E',
            color: '#17191A',
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 6,
            fontFamily: 'monospace',
          }}
        >
          PRACOWNIA 3D · PL
        </div>
        <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, maxWidth: 980 }}>
          Od pomysłu do gotowego wydruku 3D.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #E3DFD5',
          paddingTop: 30,
          fontSize: 19,
          color: '#5B605C',
          fontFamily: 'monospace',
        }}
      >
        <span>WĘGIEL #1C1B19 · PAPIER #F6F4EF · POMARAŃCZ #C2410C</span>
        <span>TWÓJ POMYSŁ. NASZE WSPÓLNE ROZWIĄZANIE.</span>
      </div>
    </div>,
    size
  )
}
