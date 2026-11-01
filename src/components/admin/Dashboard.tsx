import Link from 'next/link'
import type { ServerProps } from 'payload'
import { Operations } from './Operations'

export async function Dashboard({payload}: ServerProps) {
  const cards = [
    {label:'Nowe zapytania',collection:'inquiries',field:'status',value:'new'},
    {label:'Czeka na ofertę',collection:'inquiries',field:'status',value:'review'},
    {label:'Pliki w kwarantannie',collection:'quote-files',field:'status',value:'quarantined'},
    {label:'Błędy poczty',collection:'outbox',field:'state',value:'failed'},
    {label:'Poczta oczekująca',collection:'outbox',field:'state',value:'pending'},
  ] as const
  const counts=await Promise.allSettled(cards.map(c=>payload.count({collection:c.collection,where:{[c.field]:{equals:c.value}}})))
  return <section style={{marginBottom:32}}>
    <h2>Solid Print — panel pracowni</h2>
    <p><a href="/" target="_blank" rel="noreferrer">Otwórz stronę ↗</a> · <Link href="/admin/collections/inquiries">Przejdź do zapytań</Link></p>
    <div className="sp-admin-grid">{cards.map((c,i)=><Link key={c.label} className="sp-admin-card" href={`/admin/collections/${c.collection}?where[${c.field}][equals]=${c.value}`}>
      <strong>{c.label}</strong><b>{counts[i].status==='fulfilled'?counts[i].value.totalDocs:'Brak danych'}</b>
      {counts[i].status==='rejected'&&<small>Błąd odczytu — sprawdź połączenie z bazą.</small>}
    </Link>)}</div>
    <Operations/>
  </section>
}
