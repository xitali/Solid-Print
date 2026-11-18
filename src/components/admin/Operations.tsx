import { cloudUsage, usageLevel } from '@/lib/usage'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { Suspense } from 'react'
import type { AdminViewServerProps } from 'payload'

const checkDate = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'short', timeStyle: 'short' })

export function OperationsView(props: AdminViewServerProps) {
  const { req, visibleEntities } = props.initPageResult
  if (req.user?.role !== 'owner') return null

  return (
    <DefaultTemplate {...props} req={req} visibleEntities={visibleEntities}>
      <Gutter>
        <section className="sp-workspace sp-system-view">
          <header className="sp-system-header">
            <Link href="/admin" prefetch={false}>← Panel pracowni</Link>
            <h1>Stan systemu</h1>
            <nav className="sp-shortcuts" aria-label="Skróty stanu systemu">
              <Link href="/admin/collections/quote-files?where[status][equals]=quarantined" prefetch={false}>Pliki w kwarantannie</Link>
              <Link href="/admin/collections/outbox?where[state][equals]=failed" prefetch={false}>Błędy poczty</Link>
              <Link href="/admin/collections/outbox?where[state][equals]=pending" prefetch={false}>Poczta oczekująca</Link>
            </nav>
          </header>
          <Suspense fallback={<p role="status">Wczytywanie stanu usług…</p>}><Operations /></Suspense>
        </section>
      </Gutter>
    </DefaultTemplate>
  )
}

export async function Operations() {
  if(process.env.PLATFORM!=='cloudflare')return <p className="sp-admin-notice">Środowisko lokalne — wskaźniki produkcji Cloudflare są dostępne w panelu wdrożonej strony.</p>
  try {
    const {metrics,states}=await cloudUsage()
    const state=(key:string)=>states.find(s=>s.key===key)
    const scanner=state('scanner'), cleanup=state('cleanup')
    const scannerRecent=scanner && Date.now()-Date.parse(scanner.updated_at)<10*60000
    return <section className="sp-operations" aria-label="Usługi i darmowe limity">
      <h3>Usługi i darmowe limity</h3>
      <div className="sp-admin-grid">{metrics.map(m=>{
        const level=usageLevel(m.used,m.limit)
        const percent=m.used===null?null:Math.round(m.used/m.limit*1000)/10
        return <div className={`sp-admin-card sp-usage-${level}`} key={m.label}>
          <strong>{m.label}</strong><p>{percent===null?'Brak pomiaru':`${percent}% · ${(m.used!/1e6).toFixed(1)} MB / ${(m.limit/1e6).toLocaleString('pl-PL')} MB`}</p>
          {m.used!==null && <progress max={m.limit} value={m.used} aria-label={m.label}/>}
          {(level==='warning'||level==='full')&&<p role="alert">Osiągnięto co najmniej 75% limitu. Usuń zbędne dane lub ogranicz przyjmowanie nowych plików.</p>}
          <small>{m.note}</small>
        </div>
      })}</div>
      <div className="sp-admin-grid" aria-label="Stan usług">
        <section className="sp-admin-card"><h4>Skaner</h4><p>{scannerRecent ? 'Połączony' : 'Pliki pozostają w kwarantannie'}</p>
          <small>{scanner ? `Ostatni kontakt ${checkDate.format(new Date(scanner.updated_at))}` : 'Brak pomiaru'}</small></section>
        <section className="sp-admin-card"><h4>Retencja</h4><p>{cleanup ? (JSON.parse(cleanup.value).status === 'ok' ? 'Ostatnie wykonanie poprawne' : 'Błąd wykonania') : 'Brak potwierdzonego wykonania'}</p>
          {cleanup && <small>{checkDate.format(new Date(cleanup.updated_at))}</small>}</section>
        <section className="sp-admin-card"><h4>Poczta</h4><p>{process.env.MAIL_API_URL ? 'Adapter HTTP skonfigurowany' : 'Wiadomości czekają w kolejce'}</p>
          <Link href="/admin/collections/outbox" prefetch={false}>Otwórz kolejkę</Link></section>
      </div>
      <p className="sp-admin-notice">To wskaźniki tej witryny. R2 może naliczać opłaty po przekroczeniu limitów całego konta, również za operacje. Ruch Workera i operacje D1/R2 sprawdzaj w panelu Cloudflare; brak tych pomiarów tutaj nie oznacza 0%.</p>
      <a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer">Otwórz zużycie konta Cloudflare ↗</a>
    </section>
  } catch(error) {
    console.error('Nie udało się odczytać limitów Cloudflare:',error instanceof Error?error.message:'unknown')
    return <p className="sp-admin-notice" role="alert">Nie udało się odczytać zużycia i stanu usług. Sprawdź migracje oraz panel Cloudflare. Nie przyjmuj, że dostępny jest cały limit.</p>
  }
}
