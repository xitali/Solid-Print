import { EmptyState,PageIntro } from '@/components/UI'
import { list } from '@/lib/cms'
import type { Project } from '@/lib/types'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Projects(_props:SectionProps){

    const projects = await list<Project>('projects')
    return (
      <>
        <PageIntro
          label="PROBLEM / PROJEKT / EFEKT"
          title="Przedmioty z własną historią."
          description="Zobacz, jak konkretna potrzeba zmienia się w projekt i gotowy wydruk."
        />
        <div className="container page-content">
          {projects.length ? (
            <div className="realization-grid">
              {projects.map((p) => (
                <Link className="realization-card" key={p.id} href={`/realizacje/${p.slug}`}>
                  {p.image?.url && <img src={p.image.url} alt={p.image.alt || p.title} />}
                  <span className="mono muted">
                    {p.material} {p.dimensions && `/ ${p.dimensions}`}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.result}</p>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Każda realizacja zaczyna się od potrzeby."
              text="Przygotowujemy opisy projektów z pracowni. Tymczasem opowiedz nam o swoim — zobaczmy, co możemy stworzyć."
            />
          )}
        </div>
      </>
    )
  
}
