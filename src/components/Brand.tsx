import Link from 'next/link'

/*
 * Monogram „SP” zbudowany z warstw druku (Plansza 01 — LOGO z PDF):
 * - Litery S i P zlane w jeden znak z 7 poziomych warstw FDM.
 * - S i P łączą się wspólnymi belkami: górną (pomarańczową), środkową i dolną,
 *   a dolny łuk S przechodzi w trzon P.
 * - Górna warstwa jest pomarańczowa (var(--accent)), dolne warstwy w kolorze tekstu/węgla.
 * - Duże logo na planszy buduje się od dołu w pętli.
 * - Przy 16 px znak upraszcza się do trzech grubych belek, żeby warstwy nie zlewały się w plamę.
 */

export function MonogramSP({
  size = 42,
  className = '',
  light = false,
  animated = false,
}: {
  size?: number
  className?: string
  light?: boolean
  animated?: boolean
}) {
  const baseColor = light ? '#FFFFFF' : 'currentColor'
  const accentColor = light ? 'var(--light-accent)' : 'var(--accent)'

  // Dokładne proporcje z planszy 01:
  // Siatka modułowa 6 kolumn x 84 = 504 px szerokości
  // 7 warstw o wysokości 38 px i odstępie 16 px = 362 px wysokości
  // Zaokrąglenie pigułki rx = 19 px
  return (
    <svg
      width={size}
      height={Math.round((size * 362) / 504)}
      viewBox="0 0 504 362"
      fill="none"
      className={`monogram-sp ${animated ? 'monogram-animated' : ''} ${className}`}
      aria-label="Monogram SP Solid Print"
    >
      {/* Warstwa 1 (GÓRNA) — POMARAŃCZOWA, wspólna belka górna S i P */}
      <g className="sp-layer sp-layer-1" fill={accentColor}>
        <rect x="42" y="0" width="462" height="38" rx="19" />
      </g>

      {/* Warstwa 2 — lewa kolumna S, trzon P, prawa pętla P */}
      <g className="sp-layer sp-layer-2" fill={baseColor}>
        <rect x="0" y="54" width="84" height="38" rx="19" />
        <rect x="252" y="54" width="84" height="38" rx="19" />
        <rect x="420" y="54" width="84" height="38" rx="19" />
      </g>

      {/* Warstwa 3 — lewa kolumna S, trzon P, prawa pętla P */}
      <g className="sp-layer sp-layer-3" fill={baseColor}>
        <rect x="0" y="108" width="84" height="38" rx="19" />
        <rect x="252" y="108" width="84" height="38" rx="19" />
        <rect x="420" y="108" width="84" height="38" rx="19" />
      </g>

      {/* Warstwa 4 (ŚRODKOWA) — wspólna belka środkowa S i dół pętli P */}
      <g className="sp-layer sp-layer-4" fill={baseColor}>
        <rect x="42" y="162" width="462" height="38" rx="19" />
      </g>

      {/* Warstwa 5 — dolny łuk S przechodzący w trzon P */}
      <g className="sp-layer sp-layer-5" fill={baseColor}>
        <rect x="168" y="216" width="168" height="38" rx="19" />
      </g>

      {/* Warstwa 6 — dolny łuk S przechodzący w trzon P */}
      <g className="sp-layer sp-layer-6" fill={baseColor}>
        <rect x="168" y="270" width="168" height="38" rx="19" />
      </g>

      {/* Warstwa 7 (DOLNA) — podstawa S i spód trzonu P */}
      <g className="sp-layer sp-layer-7" fill={baseColor}>
        <rect x="0" y="324" width="336" height="38" rx="19" />
      </g>
    </svg>
  )
}

/** Uproszczony znak 16 px — 3 grube belki (Plansza 01) */
export function MonogramMini16({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      {/* Górna warstwa pomarańczowa */}
      <rect x="1" y="2" width="14" height="3" rx="1.5" fill="var(--accent)" />
      {/* Środkowa warstwa */}
      <rect x="1" y="6.5" width="14" height="3" rx="1.5" fill="currentColor" />
      {/* Dolna warstwa */}
      <rect x="1" y="11" width="11" height="3" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function Brand({
  light = false,
  showTagline = true,
  animated = false,
}: {
  light?: boolean
  showTagline?: boolean
  animated?: boolean
}) {
  return (
    <Link
      href="/"
      className={`brand ${light ? 'brand-light' : ''}`}
      aria-label="Solid Print — strona główna"
    >
      <MonogramSP size={38} light={light} animated={animated} />
      <div className="brand-text-col">
        <span className="brand-title">
          Solid <span className="brand-second">Print</span>
        </span>
        {showTagline && <span className="brand-sub">PROJEKTOWANIE I DRUK 3D</span>}
      </div>
    </Link>
  )
}

export function SectionLabel({
  children,
  number,
}: {
  children: React.ReactNode
  number?: string
}) {
  return (
    <div className="eyebrow">
      <span className="mini-layers" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {number && <span className="section-number">{number} /</span>}
      {children}
    </div>
  )
}
