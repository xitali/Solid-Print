'use client'
import {useFormFields} from '@payloadcms/ui'
import type {InquiryEvent} from '@/lib/inquiry-history'
const labels:Record<string,string>={new:'Nowe',review:'W ocenie',quoted:'Oferta wysłana',production:'W realizacji',closed:'Zamknięte',rejected:'Odrzucone'}
export function ProductSnapshot(){
  const snapshot=useFormFields(([f])=>f.productSnapshot?.value) as Record<string,unknown>|undefined
  if(!snapshot)return <p>Zapytanie nie dotyczy gotowego produktu.</p>
  return <div className="sp-product-snapshot"><strong>{String(snapshot.title||'Produkt')}</strong>
    <p>{snapshot.variant?`Wariant: ${String(snapshot.variant)} · `:''}Ilość: {String(snapshot.quantity||1)}</p>
    {typeof snapshot.priceFrom==='number'&&<p>Cena od w chwili zapytania: {snapshot.priceFrom.toLocaleString('pl-PL')} zł brutto</p>}
    {typeof snapshot.slug==='string'&&<a href={`/projekty/${encodeURIComponent(snapshot.slug)}`} target="_blank" rel="noreferrer">Otwórz aktualny produkt ↗</a>}
  </div>
}
export function InquiryHistory(){
  const history=useFormFields(([f])=>f.history?.value) as InquiryEvent[]|undefined
  return <section><h3>Historia statusów i notatek</h3>{Array.isArray(history)&&history.length?<ol>{[...history].reverse().map((e,i)=><li key={i}>
    <time>{new Date(e.at).toLocaleString('pl-PL')}</time> — {e.status?labels[e.status]||e.status:e.note}
  </li>)}</ol>:<p>Historia będzie zapisywana od następnej zmiany statusu lub notatki.</p>}</section>
}
export function FilesCell({cellData}:{cellData?:unknown}){return <span>{Array.isArray(cellData)?`${cellData.length} plików`:'0 plików'}</span>}
