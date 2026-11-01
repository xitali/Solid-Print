import Articles from '@/components/sections/Articles'
import Catalog from '@/components/sections/Catalog'
import Contact from '@/components/sections/Contact'
import Legal from '@/components/sections/Legal'
import Materials from '@/components/sections/Materials'
import Projects from '@/components/sections/Projects'
import Quote from '@/components/sections/Quote'
import Services from '@/components/sections/Services'
import Workshop from '@/components/sections/Workshop'
import { website } from '@/lib/cms'
import Search from '@/components/sections/Search'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
type Args = {
  params: Promise<{ section: string }>
  searchParams: Promise<Record<string, string | undefined>>
}
const titles: Record<string, string> = {
  projekty: 'Gotowe projekty',
  wycena: 'Wyceń projekt',
  uslugi: 'Usługi projektowania i druku 3D',
  materialy: 'Materiały',
  kontakt: 'Kontakt',
  'o-pracowni': 'O pracowni',
  'dla-firm': 'Druk 3D dla firm',
  realizacje: 'Realizacje',
  poradnik: 'Poradnik',
  szukaj: 'Wyszukiwanie',
  prywatnosc: 'Polityka prywatności',
  'zasady-zamowien': 'Zasady zamówień',
  cookies: 'Informacje o cookies',
}
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { section } = await params
  return {
    title: titles[section] || 'Strona',
    alternates: { canonical: `/${section}` },
    description: `${titles[section] || 'Pracownia projektowania i druku 3D'} — Solid Print. Poznaj możliwości i porozmawiajmy o Twoim projekcie.`,
  }
}
const renderers:Record<string,typeof Legal>={"wycena":Quote,"projekty":Catalog,"uslugi":Services,"dla-firm":Services,"materialy":Materials,"kontakt":Contact,"o-pracowni":Workshop,"realizacje":Projects,"poradnik":Articles,"szukaj":Search}
export default async function Page({params,searchParams}:Args){
const {section}=await params
if(!titles[section])notFound()
const [query,settings]=await Promise.all([searchParams,website()])
const Renderer=renderers[section]||Legal
return <Renderer section={section} query={query} settings={settings} title={titles[section]}/>
}
