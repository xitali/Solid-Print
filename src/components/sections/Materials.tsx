import { EmptyState,PageIntro } from '@/components/UI'
import { list } from '@/lib/cms'
import type { Material } from '@/lib/types'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Materials({query}:SectionProps){

    const all = await list<Material>('materials')
    const materials = all.filter((m) => (!query.group || m.group === query.group) && (!query.available || m.available))

    return (
      <>
        <PageIntro
          label="DOBÓR MA ZNACZENIE"
          title="Materiał dobrany do zadania."
          description="Wygląd to jedno. Równie ważne są zastosowanie, warunki pracy i oczekiwane właściwości. Nie wiesz, co wybrać? Pomożemy przy wycenie."
        />
        <div className="container page-content">
          {all.length > 0 && (
            <form action="/materialy" className="filter-bar">
              <div className="field">
                <label htmlFor="material-group">Zastosowanie</label>
                <select name="group" id="material-group" className="select" defaultValue={query.group || ''}>
                  <option value="">Wszystkie grupy</option>
                  <option value="decorative">Dekoracyjne</option>
                  <option value="technical">Techniczne</option>
                  <option value="flexible">Elastyczne</option>
                  <option value="outdoor">Na zewnątrz</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="material-available">Dostępność</label>
                <select
                  id="material-available"
                  name="available"
                  className="select"
                  defaultValue={query.available || ''}
                >
                  <option value="">Wszystkie</option>
                  <option value="yes">Dostępne</option>
                </select>
              </div>
              <button className="btn btn--primary">
                <span>Pokaż materiały</span>
                <ArrowUpRight size={17} />
              </button>
            </form>
          )}

          {materials.length ? (
            <div className="material-grid">
              {materials.map((m) => (
                <article className="material-card" key={m.id}>
                  <span className="mono">{m.available ? 'DOSTĘPNY' : 'ZAPYTAJ O DOSTĘPNOŚĆ'}</span>
                  <h2>{m.title}</h2>
                  <p>{m.description}</p>
                  <dl>
                    {m.applications?.length ? (
                      <>
                        <dt>Zastosowania</dt>
                        <dd>{m.applications.map((a) => a.value).join(', ')}</dd>
                      </>
                    ) : null}
                    {m.limitations && (
                      <>
                        <dt>Ograniczenia</dt>
                        <dd>{m.limitations}</dd>
                      </>
                    )}
                    {m.colors && (
                      <>
                        <dt>Kolory</dt>
                        <dd>{m.colors}</dd>
                      </>
                    )}
                  </dl>
                  <Link href="/wycena" className="text-link">
                    Zapytaj o wykonanie <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nie musisz znać się na materiałach."
              text="Opisz zastosowanie i warunki, w których będzie pracował przedmiot. Dostępne materiały oraz kolory potwierdzimy przy wycenie."
            />
          )}
        </div>
      </>
    )
  
}
