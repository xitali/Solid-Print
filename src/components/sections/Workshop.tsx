import { TechnicalArt } from '@/components/TechnicalArt'
import { PageIntro,Paragraphs } from '@/components/UI'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Workshop({settings:s}:SectionProps){

    return (
      <>
        <PageIntro
          label="POZNAJ SOLID PRINT"
          title={s.aboutTitle || 'Za każdym wydrukiem stoi człowiek.'}
          description="Bezpośredni kontakt. Wspólne ustalenia. Projekt dopasowany do potrzeby."
        />
        <div className="container page-content two-column">
          <div className="prose">
            {s.aboutText ? (
              <Paragraphs text={s.aboutText} />
            ) : (
              <>
                <p>
                  Solid Print to pracownia projektowania i druku 3D. Łączymy pracę nad modelem z jego fizycznym
                  wykonaniem, żeby przejść od pomysłu do gotowego przedmiotu.
                </p>
                <p>
                  Możesz przynieść gotowy model, szkic albo sam opis. Przed wykonaniem wspólnie ustalimy wymiary, warunki pracy przedmiotu i wymagania dotyczące wyglądu.
                </p>
              </>
            )}
            <Link className="btn btn--primary" href="/wycena?type=design" style={{ marginTop: 'var(--s-6)' }}>
              <span>Opowiedz o pomyśle</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div>
            {s.ownerImage?.url ? (
              <img className="corner-frame" src={s.ownerImage.url} alt={s.ownerImage.alt || 'Właściciel Solid Print'} />
            ) : (
              <TechnicalArt small />
            )}
            {s.workshopImages?.filter((v) => v.image?.url).map((v, i) => (
              <img
                key={i}
                src={v.image.url}
                alt={v.image.alt || 'Pracownia Solid Print'}
                className="corner-frame"
                style={{ marginTop: 'var(--s-5)' }}
              />
            ))}
          </div>
        </div>
      </>
    )
  
}
