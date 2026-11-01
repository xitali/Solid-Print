import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container error-page" style={{ textAlign: 'center', padding: 'var(--s-10) var(--s-4)' }}>
      {/* Ilustracja niedokończonego wydruku z plątaniną filamentu (Item E9) */}
      <div style={{ maxWidth: 280, margin: '0 auto var(--s-6)' }}>
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Przerwany wydruk 3D">
          <rect x="20" y="140" width="160" height="6" rx="3" fill="#1C1B19" />
          <line x1="30" y1="148" x2="170" y2="148" stroke="#E3DFD5" strokeDasharray="3 3" />
          <rect x="50" y="126" width="100" height="12" rx="2" fill="#1C1B19" stroke="#2D2C28" />
          <rect x="55" y="112" width="90" height="12" rx="2" fill="#1C1B19" stroke="#2D2C28" />
          <rect x="62" y="98" width="76" height="12" rx="2" fill="#C2410C" stroke="#9A3412" />
          <path d="M 65 96 C 40 85, 30 70, 50 60 C 70 50, 45 40, 60 30 C 75 20, 100 40, 90 60 C 80 80, 110 70, 125 55 C 140 40, 160 65, 145 75 C 130 85, 140 95, 135 96" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
          <path d="M 70 94 C 85 80, 105 85, 115 70 C 125 55, 150 50, 140 35" stroke="#FF8A5B" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
          <rect x="155" y="25" width="22" height="16" rx="2" fill="#1C1B19" stroke="#2D2C28" />
          <polygon points="163,41 169,41 166,48" fill="#C2410C" />
        </svg>
      </div>

      <span className="eyebrow mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>BŁĄD 404 / PRZERWANY WYDRUK</span>
      <h1 style={{ marginTop: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>Ten wydruk się nie udał.</h1>
      <p style={{ maxWidth: 480, margin: '0 auto var(--s-6)', color: 'var(--fg-muted)', fontSize: 16 }}>
        Strona, której szukasz, odkleiła się od stołu roboczego, nie istnieje albo zmieniła swój adres.
      </p>
      <div style={{ display: 'flex', gap: 'var(--s-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link className="btn btn--primary" href="/">
          Wróć do strony głównej <ArrowUpRight size={17} />
        </Link>
        <Link className="btn btn--secondary" href="/projekty">
          Zobacz gotowe projekty
        </Link>
      </div>
    </div>
  )
}
