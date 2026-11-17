import { EmptyState,PageIntro } from '@/components/UI'
import { RealizationCard } from '@/components/RealizationCard'
import { list } from '@/lib/cms'
import type { Project } from '@/lib/types'
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
              {projects.map((project) => <RealizationCard key={project.id} project={project} />)}
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
