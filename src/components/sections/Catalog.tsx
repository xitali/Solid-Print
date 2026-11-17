import { EmptyState,PageIntro,ProductCard } from '@/components/UI'
import { list } from '@/lib/cms'
import { selectProducts } from '@/lib/rules'
import type { Product } from '@/lib/types'
import { Search } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Catalog({query}:SectionProps){

    const all = await list<Product>('products')
    const products = selectProducts(all, { q: query.q, category: query.category, application: query.application })
    const categories = [...new Set(all.map((p) => p.category).filter(Boolean))] as string[]
    const applications = [...new Set(all.flatMap((p) => p.applications?.map((a) => a.value) || []))]
    const filters = { q: query.q, category: query.category, application: query.application }
    const labels = { q: 'Szukaj', category: 'Kategoria', application: 'Zastosowanie' }
    const active = (Object.keys(filters) as (keyof typeof filters)[]).filter((key) => filters[key])

    return (
      <>
        <PageIntro
          label="KATALOG PRACOWNI"
          title="Gotowe projekty. Twój wybór."
          description="Przedmioty zaprojektowane w Solid Print. Wybierz projekt, poznaj szczegóły i zapytaj o wykonanie dla siebie."
        />
        <div className="container page-content">
          {(all.length > 0 || active.length > 0) && <form className="filter-bar" action="/projekty">
            <div className="field">
              <label htmlFor="catalog-query">Szukaj projektu</label>
              <input
                id="catalog-query"
                type="search"
                name="q"
                className="input"
                placeholder="Nazwa lub zastosowanie…"
                defaultValue={query.q}
              />
            </div>
            {(categories.length > 1 || query.category) && <div className="field">
              <label htmlFor="catalog-category">Kategoria</label>
              <select id="catalog-category" name="category" className="select" defaultValue={query.category || ''}>
                <option value="">Wszystkie kategorie</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>}
            {(applications.length > 1 || query.application) && <div className="field">
              <label htmlFor="catalog-application">Zastosowanie</label>
              <select
                id="catalog-application"
                name="application"
                className="select"
                defaultValue={query.application || ''}
              >
                <option value="">Wszystkie zastosowania</option>
                {applications.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>}
            <button className="btn btn--primary" type="submit">
              <Search size={17} />
              <span>Szukaj</span>
            </button>
          </form>}

          {(all.length > 0 || active.length > 0) && <div className="filter-count">
            <span>
              {products.length} {products.length === 1 ? 'projekt' : 'projektów'}
            </span>
            {!!active.length && <Link href="/projekty">Wyczyść filtry ↗</Link>}
          </div>}
          {!!active.length && <ul className="filter-chips" aria-label="Aktywne filtry">{active.map((key) => {
            const remaining = new URLSearchParams(active.filter((other) => other !== key).map((other) => [other, filters[other]!]))
            return <li key={key}><Link href={remaining.size ? `/projekty?${remaining}` : '/projekty'} aria-label={`Usuń filtr ${labels[key]}: ${filters[key]}`}>{labels[key]}: {filters[key]} <span aria-hidden="true">×</span></Link></li>
          })}</ul>}

          {products.length ? (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={all.length ? 'Nie znaleźliśmy takiego projektu.' : 'Masz pomysł na coś własnego?'}
              text={
                all.length
                  ? 'Zmień filtry lub opisz nam, czego szukasz.'
                  : 'Katalog gotowych projektów jest przygotowywany. Już teraz możesz opisać przedmiot, którego potrzebujesz, lub przesłać własny model.'
              }
            />
          )}
        </div>
      </>
    )
  
}
