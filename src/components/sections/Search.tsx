import { EmptyState,PageIntro } from '@/components/UI'
import { list } from '@/lib/cms'
import { Search } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function SearchSection({query}:SectionProps){

    const q = (query.q || '').trim().toLocaleLowerCase('pl')
    const results = q ? await Promise.all(
      ['products', 'services', 'materials', 'articles', 'projects'].map(async (collection) =>
        (await list<{ title: string; slug: string; description: string }>(collection)).map((d) => ({
          ...d,
          collection,
        }))
      )
    ) : []
    const found = q
      ? results
          .flat()
          .filter((d) => `${d.title} ${d.description || ''}`.toLocaleLowerCase('pl').includes(q))
      : []

    const urls: Record<string, string> = {
      products: 'projekty',
      services: 'uslugi',
      materials: 'materialy',
      articles: 'poradnik',
      projects: 'realizacje',
    }
    const labels: Record<string, string> = {
      products: 'PROJEKT',
      services: 'USŁUGA',
      materials: 'MATERIAŁ',
      articles: 'PORADNIK',
      projects: 'REALIZACJA',
    }

    return (
      <>
        <PageIntro label="ZNAJDŹ TO, CZEGO SZUKASZ" title="Szukaj w Solid Print." />
        <div className="container page-content">
          <form className="search-form">
            <input
              aria-label="Szukana fraza"
              name="q"
              type="search"
              className="input"
              defaultValue={query.q}
              placeholder="Projekt, materiał lub usługa…"
            />
            <button className="btn btn--primary" type="submit">
              <span>Szukaj</span>
              <Search size={18} />
            </button>
          </form>

          {!!q && <p className="filter-count" aria-live="polite">Liczba wyników: {found.length}</p>}
          {found.map((d, i) => (
            <Link className="search-result" key={i} href={`/${urls[d.collection]}/${d.slug}`}>
              <span className="mono">{labels[d.collection]}</span>
              <h2>{d.title}</h2>
              {d.description && <p className="catalog-summary">{d.description}</p>}
            </Link>
          ))}

          {q && !found.length && (
            <EmptyState
              title="Nie znaleźliśmy pasujących treści."
              text="Spróbuj innej frazy lub opisz swój pomysł w zapytaniu."
            />
          )}
          {!found.length && <nav className="catalog-actions search-shortcuts" aria-label="Przeglądaj kategorie">
            <Link className="text-link" href="/uslugi">Usługi</Link>
            <Link className="text-link" href="/materialy">Materiały</Link>
            <Link className="text-link" href="/realizacje">Realizacje</Link>
          </nav>}
        </div>
      </>
    )
  
}
