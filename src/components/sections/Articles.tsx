import { EmptyState,PageIntro } from '@/components/UI'
import { list } from '@/lib/cms'
import type { Article } from '@/lib/types'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Articles(_props:SectionProps){

    const articles = await list<Article>('articles')
    return (
      <>
        <PageIntro
          label="WIEDZA PRZED PIERWSZYM WYDRUKIEM"
          title="Warto wiedzieć."
          description="Jak przygotować model, opisać zastosowanie i wybrać materiał. Praktycznie, po ludzku."
        />
        <div className="container page-content">
          {articles.length ? (
            <div className="article-grid">
              {articles.map((a) => (
                <Link className="article-card" key={a.id} href={`/poradnik/${a.slug}`}>
                  {a.image?.url && <img src={a.image.url} alt={a.image.alt || a.title} />}
                  <h2>{a.title}</h2>
                  <p>{a.description}</p>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Dobre pytania są dobrym początkiem."
              text="Poradnik jest przygotowywany. Jeśli potrzebujesz pomocy z modelem lub materiałem, opisz to w zapytaniu."
            />
          )}
        </div>
      </>
    )
  
}
