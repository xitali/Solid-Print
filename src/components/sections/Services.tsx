import { PageIntro,Process } from '@/components/UI'
import { list } from '@/lib/cms'
import type { Service } from '@/lib/types'
import { ArrowUpRight,Boxes,FileBox,Layers,PenTool } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Services({section}:SectionProps){

    const services = await list<Service>('services')
    const defaults = [
      {
        id: 1,
        title: 'Projektowanie od pomysłu',
        slug: 'projektowanie-3d',
        description: 'Od opisu potrzeby, szkicu lub zdjęcia do modelu przygotowanego z myślą o wykonaniu.',
        kind: 'design',
      },
      {
        id: 2,
        title: 'Druk z Twojego pliku',
        slug: 'druk-3d',
        description: 'Masz gotowy model? Sprawdzimy jego geometrię i wymagania, a następnie uzgodnimy sposób wykonania.',
        kind: 'print',
      },
      {
        id: 3,
        title: 'Prototypy i dopasowanie',
        slug: 'prototypowanie',
        description: 'Sprawdzenie kształtu, funkcji i dopasowania przedmiotu przed kolejnym etapem projektu.',
        kind: 'design',
      },
      {
        id: 4,
        title: 'Małe serie',
        slug: 'male-serie',
        description: 'Potrzebujesz więcej niż jednej sztuki? Prześlij zapytanie z ilością oraz wymaganiami.',
        kind: 'print',
      },
    ] as Service[]

    return (
      <>
        <PageIntro
          label={section === 'dla-firm' ? 'WSPÓŁPRACA Z FIRMAMI' : 'MOŻLIWOŚCI PRACOWNI'}
          title={section === 'dla-firm' ? 'Wsparcie dla Twojego projektu.' : 'Od potrzeby do przedmiotu.'}
          description={
            section === 'dla-firm'
              ? 'Projektowanie, prototypowanie i druk 3D. Opisz potrzeby firmy — ustalimy zakres, liczbę sztuk i możliwości współpracy.'
              : 'Możesz przyjść z gotowym modelem albo z samym pomysłem. Dobierzemy dalszą drogę do tego, czego potrzebujesz.'
          }
        />
        <div className="container page-content">
          <div className="service-grid">
            {(services.length ? services : defaults).map((v, i) => {
              const Icon = [PenTool, FileBox, Layers, Boxes][i % 4]
              return (
                <article key={v.id} className="service-card">
                  <span className="mono">USŁUGA / 0{i + 1}</span>
                  <Icon size={30} strokeWidth={1.15} />
                  <h2>{v.title}</h2>
                  <p>{v.description}</p>
                  {v.body && <div className="service-details">{v.body}</div>}
                  {v.applications && (
                    <div className="service-details">
                      <strong>Zastosowania</strong>
                      <br />
                      {v.applications}
                    </div>
                  )}
                  <Link className="text-link" href={`/wycena?type=${v.kind}`}>
                    Porozmawiajmy o projekcie <ArrowUpRight size={17} />
                  </Link>
                </article>
              )
            })}
          </div>
          <div className="notice">
            Zakres wykonania, dobór materiału oraz terminy ustalamy po zapoznaniu się z projektem. W zapytaniu firmowym
            możesz podać nazwę firmy, NIP oraz planowaną liczbę sztuk.
          </div>
        </div>
        <Process />
      </>
    )
  
}
