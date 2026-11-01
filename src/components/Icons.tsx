import React from 'react'

type IconProps = {
  size?: number
  className?: string
}

/*
 * Zestaw autorskich ikon Solid Print według specyfikacji PDF (Plansza 02 — IKONY):
 * - Siatka 48 px, kreska 2 px, końce i naroża zaokrąglone.
 * - Dokładnie JEDEN pomarańczowy akcent na ikonę (--accent / --light-accent).
 */

export function FileLayersIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* Obrys arkusza ze zagiętym rogiem */}
      <path d="M12 6h16l10 10v26H12V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 6v10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* 3 pomarańczowe warstwy druku z pliku (Plansza 02) */}
      <path d="M16 26h16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 32h16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 38h10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IdeaIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* Korpus żarówki */}
      <path d="M24 7a13 13 0 0 0-9 22.3V34a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.7A13 13 0 0 0 24 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 40h10M21 44h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Pomarańczowy żarnik w kształcie T (Plansza 02) */}
      <path d="M18 21h12" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 21v13" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function ProductBoxIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* Sześcian izometryczny */}
      <path d="M24 6 39 15v18L24 42 9 33V15L24 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m24 24-15-9M24 24l15-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Środkowa pionowa krawędź pomarańczowa (Plansza 02) */}
      <path d="M24 24v18" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function RulerIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* Ekierka / trójkąt prostokątny */}
      <path d="M10 8v32h32L10 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* 3 pomarańczowe znaczniki na pionowej ściance (Plansza 02) */}
      <path d="M10 14h6" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10 20h8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10 26h6" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Dolne czarne znaczniki */}
      <path d="M24 40v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 40v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function BatchIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="8" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="27" y="8" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="8" y="27" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pojedynczy akcent: prawy dolny element w serii pomarańczowy (Plansza 02) */}
      <rect x="27" y="27" width="13" height="13" rx="3.5" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function SpoolIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2"/>
      {/* Przerywany okrąg zwojów filamentu w kolorze pomarańczowym (Plansza 02) */}
      <circle cx="24" cy="24" r="12" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="5 4.4" strokeLinecap="round"/>
    </svg>
  )
}

export function PhoneIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="13" y="6" width="22" height="36" rx="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pomarańczowa dolna belka (Plansza 02) */}
      <path d="M20 36h8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function MailIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="7" y="11" width="34" height="26" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pomarańczowa linia klapy koperty V (Plansza 02) */}
      <path d="m7 15 17 12 17-12" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function InstagramIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
      {/* Pomarańczowa kropka wizjera / diody (Plansza 02) */}
      <circle cx="33" cy="15" r="2.5" fill="var(--accent)"/>
    </svg>
  )
}
