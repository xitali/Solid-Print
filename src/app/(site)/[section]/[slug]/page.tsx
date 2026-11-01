import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { list } from '@/lib/cms'
import { ProductDetails } from '@/components/ProductDetails'
import { PageIntro,Paragraphs } from '@/components/UI'
import { SectionLabel } from '@/components/Brand'
import type { Product,Project,Article,Service,Material } from '@/lib/types'
type Args={params:Promise<{section:string;slug:string}>}
const collections:Record<string,string>={projekty:'products',realizacje:'projects',poradnik:'articles',uslugi:'services',materialy:'materials'}
type Doc=Product&Project&Article&Service&Material
async function getDoc(section:string,slug:string){if(!collections[section])return null;return (await list<Doc>(collections[section])).find(d=>d.slug===slug)}
export async function generateMetadata({params}:Args){const {section,slug}=await params;const d=await getDoc(section,slug);return {title:d?.title||'Nie znaleziono',description:d?.description||d?.result,alternates:{canonical:`/${section}/${slug}`}}}
export default async function Page({params}:Args){const {section,slug}=await params;const d=await getDoc(section,slug);if(!d)notFound()
  if(section==='projekty')return <div className="container page-content"><div className="breadcrumb"><Link href="/">Start</Link><span>/</span><Link href="/projekty">Gotowe projekty</Link><span>/</span><span>{d.title}</span></div><ProductDetails product={d}/></div>
  return <><PageIntro label={section==='realizacje'?'PROBLEM / PROJEKT / EFEKT':section==='poradnik'?'PORADNIK SOLID PRINT':section==='materialy'?'MATERIAŁY':'USŁUGI'} title={d.title} description={d.description}/><div className="container page-content"><div className="prose">{d.image?.url&&<img src={d.image.url} alt={d.image.alt||d.title} style={{marginBottom:35,borderRadius:10}}/>}{section==='realizacje'?<><SectionLabel>01 / PROBLEM</SectionLabel><Paragraphs text={d.problem}/><SectionLabel>02 / PROJEKT</SectionLabel><Paragraphs text={d.solution}/><SectionLabel>03 / EFEKT</SectionLabel><Paragraphs text={d.result}/><p className="mono">{[d.material,d.dimensions].filter(Boolean).join(' / ')}</p></>:<Paragraphs text={d.body||d.limitations}/>}{d.relatedProjects?.length&&<><h2>Powiązane realizacje</h2>{d.relatedProjects.map(p=><p key={p.id}><Link className="text-link" href={`/realizacje/${p.slug}`}>{p.title} ↗</Link></p>)}</>}<Link href={`/wycena?type=${d.kind||'design'}`} className="button">Porozmawiajmy o Twoim projekcie <ArrowUpRight size={18}/></Link></div></div></>
}
