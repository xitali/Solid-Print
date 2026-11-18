import Link from 'next/link'
import { Suspense } from 'react'
import type { ServerProps, Where } from 'payload'
import { Activity, ArrowRight, ArrowUpRight, Clock3, FilePlus2, Inbox, Mail } from 'lucide-react'
import { StatusCell } from './StatusCell'
import { Gutter } from '@payloadcms/ui'

const inbox = '/admin/collections/inquiries'
const shortcuts = [
  ['Dodaj materiał', 'materials'],
  ['Dodaj usługę', 'services'],
  ['Dodaj realizację', 'projects'],
] as const

const dateFormat = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Warsaw' })

async function InquiryQueues({ payload, user }: Pick<ServerProps, 'payload' | 'user'>) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const incoming: Where = { status: { equals: 'new' } }
  const activeStatuses = ['review', 'quoted', 'production']
  const active: Where = { status: { in: activeStatuses } }
  const newLink = `${inbox}?where[status][equals]=new&sort=createdAt`
  const activeLink = `${inbox}?where[status][in]=${activeStatuses.join(',')}&sort=-updatedAt`
  const failedLink = '/admin/collections/outbox?where[state][equals]=failed'
  try {
    const load = (where: Where, sort: string[]) => payload.find({
      collection: 'inquiries', overrideAccess: false, user, where, depth: 0,
      limit: 5, sort,
      select: { number: true, status: true, createdAt: true },
    })
    const [newItems, activeItems, failed] = await Promise.all([
      load(incoming, ['createdAt', 'id']),
      load(active, ['-updatedAt', '-id']),
      payload.count({ collection: 'outbox', overrideAccess: false, user, where: { state: { equals: 'failed' } } }),
    ])
    const cards = [
      { label: 'Nowe zapytania', href: newLink, total: newItems.totalDocs, Icon: Inbox, attention: newItems.totalDocs > 0 },
      { label: 'Sprawy w toku', href: activeLink, total: activeItems.totalDocs, Icon: Activity },
      { label: 'Błędy poczty', href: failedLink, total: failed.totalDocs, Icon: Mail, attention: failed.totalDocs > 0 },
    ]

    const queues = [
      { title: 'Do oceny', docs: newItems.docs, Icon: Clock3, href: newLink, empty: 'Brak nowych zapytań.' },
      { title: 'Sprawy w toku', docs: activeItems.docs, Icon: Activity, href: activeLink, empty: 'Brak spraw w toku.' },
    ]
    return <>
      <nav className="sp-admin-grid sp-owner-metrics" aria-label="Podsumowanie pracy">
        {cards.map(({ label, href, total, Icon, attention }) => (
          <Link className="sp-admin-card sp-owner-metric" href={href} prefetch={false} key={label} data-attention={attention || undefined}>
            <span className="sp-metric-icon"><Icon size={19} aria-hidden="true" /></span>
            <span><b>{total}</b><span>{label}</span></span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <div className="sp-admin-grid sp-owner-queues">
        {queues.map(({ title, docs, Icon, href, empty }) => <section className="sp-admin-card sp-workspace-panel" key={title}>
          <h2><Icon size={19} aria-hidden="true" /> {title}</h2>
          {docs.length ? <ul className="sp-inquiry-list">{docs.map(({ id, number, status, createdAt }) => (
            <li key={id}>
              <Link href={`${inbox}/${id}`} prefetch={false}>
                <span><strong>{number || `Zapytanie ${id}`}</strong><time dateTime={createdAt}>{dateFormat.format(new Date(createdAt))}</time></span>
                {status === 'new' && Date.parse(createdAt) < cutoff
                  ? <span className="sp-state-pill sp-state-waiting">Czeka ponad 24 h</span>
                  : <StatusCell cellData={status} />}
              </Link>
            </li>
          ))}</ul> : <p>{empty}</p>}
          <Link href={href} prefetch={false}>Otwórz listę <ArrowRight size={14} aria-hidden="true" /></Link>
        </section>)}
      </div>
    </>
  } catch (error) {
    console.error('Błąd odczytu zapytań na pulpicie:', error instanceof Error ? error.name : 'unknown')
    return <p className="sp-admin-notice" role="alert">Nie udało się pobrać zapytań. Odśwież stronę lub otwórz listę.</p>
  }
}

export function Dashboard({ payload, user }: ServerProps) {
  if (user?.role !== 'owner') return null

  return (
    <Gutter className="sp-dashboard">
    <section className="sp-workspace" aria-label="Panel pracowni">
      <header className="sp-workspace-header">
        <div><h1>Panel pracowni</h1><p>{user.name ? `Dzień dobry, ${user.name}.` : 'Zarządzaj zapytaniami i ofertą Solid Print.'}</p></div>
        <nav aria-label="Skróty panelu">
          <Link href="/admin/stan-systemu" prefetch={false}><Activity size={17} aria-hidden="true" /> Stan systemu</Link>
          <a href="/" target="_blank" rel="noreferrer">Zobacz stronę <ArrowUpRight size={15} aria-hidden="true" /></a>
        </nav>
      </header>
      <nav className="sp-shortcuts" aria-label="Dodawanie treści">
        {shortcuts.map(([label, slug]) => <Link key={slug} href={`/admin/collections/${slug}/create`} prefetch={false}><FilePlus2 size={19} aria-hidden="true" /> {label}</Link>)}
      </nav>
      <Suspense fallback={<p role="status">Wczytywanie zadań…</p>}>
        <InquiryQueues payload={payload} user={user} />
      </Suspense>
    </section>
    </Gutter>
  )
}
