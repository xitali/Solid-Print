import Link from 'next/link'
import { Suspense } from 'react'
import type { ServerProps, Where } from 'payload'
import { ArrowUpRight, Clock3, FilePlus2, Inbox } from 'lucide-react'
import { StatusCell } from './StatusCell'

const inbox = '/admin/collections/inquiries'
const shortcuts = [
  ['Dodaj materiał', 'materials'],
  ['Dodaj usługę', 'services'],
  ['Dodaj realizację', 'projects'],
] as const

const dateFormat = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Warsaw' })

async function InquiryList({ payload, user, where, oldestFirst }: Pick<ServerProps, 'payload' | 'user'> & {
  where?: Where
  oldestFirst?: boolean
}) {
  try {
    const { docs } = await payload.find({
      collection: 'inquiries', overrideAccess: false, user, where, depth: 0,
      limit: 5, pagination: false, sort: oldestFirst ? ['createdAt', 'id'] : ['-createdAt', '-id'],
      select: { number: true, status: true, createdAt: true },
    })

    if (!docs.length) return <p>{oldestFirst ? 'Brak nowych zapytań starszych niż 24 godziny.' : 'Nie ma jeszcze zapytań.'}</p>

    return (
      <ul className="sp-inquiry-list">
        {docs.map(({ id, number, status, createdAt }) => (
          <li key={id}>
            <Link href={`${inbox}/${id}`} prefetch={false}>
              <span><strong>{number || `Zapytanie ${id}`}</strong><time dateTime={createdAt}>{dateFormat.format(new Date(createdAt))}</time></span>
              <StatusCell cellData={status} />
            </Link>
          </li>
        ))}
      </ul>
    )
  } catch (error) {
    console.error('Błąd odczytu zapytań na pulpicie:', error instanceof Error ? error.name : 'unknown')
    return <p className="sp-admin-notice" role="alert">Nie udało się pobrać zapytań. Odśwież stronę lub otwórz listę.</p>
  }
}

export function Dashboard({ payload, user }: ServerProps) {
  if (user?.role !== 'owner') return null

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const overdue: Where = { status: { equals: 'new' }, createdAt: { less_than: cutoff } }
  const overdueLink = `${inbox}?where[status][equals]=new&where[createdAt][less_than]=${encodeURIComponent(cutoff)}&sort=createdAt`

  return (
    <section className="sp-workspace" aria-label="Panel pracowni">
      <header className="sp-workspace-header">
        <div><h1>Panel pracowni</h1><p>{user.name ? `Dzień dobry, ${user.name}.` : 'Zarządzaj zapytaniami i ofertą Solid Print.'}</p></div>
        <nav aria-label="Skróty panelu">
          <Link href="/admin/stan-systemu" prefetch={false}>Stan systemu</Link>
          <a href="/" target="_blank" rel="noreferrer">Zobacz stronę <ArrowUpRight size={15} aria-hidden="true" /></a>
        </nav>
      </header>
      <nav className="sp-shortcuts" aria-label="Dodawanie treści">
        {shortcuts.map(([label, slug]) => <Link key={slug} href={`/admin/collections/${slug}/create`} prefetch={false}><FilePlus2 size={19} aria-hidden="true" /> {label}</Link>)}
      </nav>
      <div className="sp-admin-grid">
        <section className="sp-admin-card sp-workspace-panel">
          <h2><Clock3 size={19} aria-hidden="true" /> Do załatwienia</h2>
          <Suspense fallback={<p role="status">Wczytywanie zaległych zapytań…</p>}>
            <InquiryList payload={payload} user={user} where={overdue} oldestFirst />
          </Suspense>
          <Link href={overdueLink} prefetch={false}>Zobacz zaległe</Link>
        </section>
        <section className="sp-admin-card sp-workspace-panel">
          <h2><Inbox size={19} aria-hidden="true" /> Ostatnie zapytania</h2>
          <Suspense fallback={<p role="status">Wczytywanie ostatnich zapytań…</p>}>
            <InquiryList payload={payload} user={user} />
          </Suspense>
          <Link href={inbox} prefetch={false}>Wszystkie zapytania</Link>
        </section>
      </div>
    </section>
  )
}
