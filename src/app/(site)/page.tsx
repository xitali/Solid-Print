import Link from 'next/link'
import { ArrowUpRight, ArrowDown } from 'lucide-react'
import { SectionLabel } from '@/components/Brand'
import { Pathways, Process, ProductCard, FAQList, Paragraphs } from '@/components/UI'
import { HeroDropZone } from '@/components/HeroDropZone'
import {
  FileLayersIcon,
  ProductBoxIcon,
  RulerIcon,
  BatchIcon,
  PhoneIcon,
  MailIcon,
  InstagramIcon,
} from '@/components/Icons'
import { ContactForm } from '@/components/ContactForm'
import { StructuredData } from '@/components/StructuredData'
import { list, website } from '@/lib/cms'
import type { Product, Project, FAQ, Article } from '@/lib/types'

export default async function Home() {
  const [s, products, projects, faqs, articles] = await Promise.all([
    website(),
    list<Product>('products'),
    list<Project>('projects'),
    list<FAQ>('faqs'),
    list<Article>('articles'),
  ])
  const selected = products.filter((p) => p.featured).slice(0, 6)


  return (
    <>
      {s.sellerName&&<StructuredData value={{'@context':'https://schema.org','@type':'LocalBusiness',name:s.sellerName,url:process.env.NEXT_PUBLIC_SERVER_URL,...(s.email?{email:s.email}:{}),...(s.phone?{telephone:s.phone}:{}),sameAs:[s.instagram,s.facebook].filter(Boolean)}}/>}
      {/* HERO (Plansza 03 — MOTYW I KOMPONENTY + animowany wazon) */}
      <section className="hero">
        <div className="hero-drifting-lines" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            {/* Żółta etykieta z Planszy 03 */}
            <div style={{ marginBottom: 20 }}>
              <span className="badge-yellow">PRACOWNIA 3D · PL</span>
            </div>

            <div className="hero-headline-wrap">
              <h1>
                <span className="hero-line hero-line-1">Od pomysłu do</span>
                <span className="hero-line hero-line-2">gotowego</span>
                <span className="hero-line hero-line-3">
                  <span className="highlight-word">wydruku 3D</span>
                </span>
              </h1>
              {/* Animacja trzech pomarańczowych linii warstw (900 ms, opóźnienie 180 ms z PDF) */}
              <div className="hero-layer-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <p>
              {s.heroDescription ||
                'Wgraj model albo opisz pomysł. Ocenimy projekt i potwierdzimy cenę oraz termin.'}
            </p>

            <div className="hero-buttons">
              <Link href="/wycena" className="button">
                Wyceń projekt <ArrowUpRight size={19} />
              </Link>
              <Link href="/projekty" className="button button-outline">
                Gotowe projekty <ArrowUpRight size={18} />
              </Link>
            </div>


          </div>

          <div className="hero-visual">
            <HeroDropZone material={s?.heroMaterial} layerHeight={s?.heroLayer} />
          </div>
        </div>

        <div className="container hero-baseline">
          <span className="mono">PROJEKTUJEMY. DRUKUJEMY. ROZWIĄZUJEMY.</span>
          <a href="#sciezki" className="mono">
            ZOBACZ MOŻLIWOŚCI <ArrowDown size={15} />
          </a>
        </div>
      </section>

      {/* TRZY ŚCIEŻKI NA CIEMNYM PASIE #1C1B19 (Plansza 02) */}
      <div id="sciezki">
        <Pathways />
      </div>

      {/* KATALOG GOTOWYCH PROJEKTÓW (Plansza 03) */}
      {selected.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionLabel number="02">PROJEKTY Z PRACOWNI</SectionLabel>
            <div className="section-title-row">
              <h2>
                Gotowe pomysły.
                <br />
                Do zamówienia dla Ciebie.
              </h2>
              <Link className="text-link" href="/projekty">
                Wszystkie projekty <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="product-grid">
              {selected.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCES: 4 STACJE */}
      <Process />

      {/* REALIZACJE */}
      {projects.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionLabel number="04">ZROBIONE W SOLID PRINT</SectionLabel>
            <div className="section-title-row">
              <h2>
                Przedmiot to dopiero
                <br />
                część historii.
              </h2>
              <Link href="/realizacje" className="text-link">
                Zobacz realizacje <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="realization-grid">
              {projects.slice(0, 3).map((p) => (
                <Link href={`/realizacje/${p.slug}`} className="realization-card" key={p.id}>
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
          </div>
        </section>
      )}

      {/* ZASTOSOWANIA Z IKONAMI 48 PX (Plansza 02) */}
      <section className="section applications-section">
        <div className="container applications-layout">
          <div>
            <SectionLabel number="05">NIE TYLKO DOBRY WYGLĄD</SectionLabel>
            <h2>
              Druk 3D.
              <br />
              Realne zastosowania.
            </h2>
            <p className="section-description">
              Czasem potrzeba prototypu. Czasem małego elementu, którego nie można znaleźć. Zacznijmy
              od tego, co chcesz osiągnąć.
            </p>
            <Link href="/materialy" className="text-link">
              Porozmawiajmy o materiale <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="application-grid">
            {[
              {
                Icon: RulerIcon,
                href: '/wycena?type=design',
                title: 'Prototypowanie',
                text: 'Sprawdź formę i pasowanie, zanim zrobisz kolejny krok.',
              },
              {
                Icon: BatchIcon,
                href: '/wycena?type=print',
                title: 'Małe serie',
                text: 'Powtarzalna produkcja od kilku do kilkudziesięciu sztuk.',
              },
              {
                Icon: ProductBoxIcon,
                href: '/projekty',
                title: 'Gotowe produkty',
                text: 'Uchwyty, organizery i obudowy gotowe do użycia.',
              },
              {
                Icon: FileLayersIcon,
                title: 'Druk z pliku',
                text: 'Prześlij model — sprawdzimy możliwości wykonania.',
                href: '/wycena?type=print',
              },
            ].map(({ Icon, title, text, href }) => (
              <Link
                href={href}
                className="application-card"
                key={title}
              >
                <Icon size={36} />
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* O PRACOWNI */}
      <section className="section workshop-section">
        <div className="container workshop-grid">
          <div className="workshop-art">
            {s.ownerImage?.url ? (
              <img
                className="corner-frame"
                src={s.ownerImage.url}
                alt={s.ownerImage.alt || 'Właściciel pracowni Solid Print'}
              />
            ) : (
              <div className="workshop-type">
                <span className="mono">SOLID PRINT / PODEJŚCIE</span>
                <div>
                  Pomysł.
                  <br />
                  Projekt.
                  <br />
                  <span>Przedmiot.</span>
                </div>
                <div className="workshop-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="mono">DOBRE RZECZY ZACZYNAJĄ SIĘ OD ROZMOWY.</span>
              </div>
            )}
          </div>
          <div>
            <SectionLabel number="06">POZNAJ PRACOWNIĘ</SectionLabel>
            <h2>{s.aboutTitle || 'Za każdym wydrukiem stoi człowiek.'}</h2>
            {s.aboutText ? (
              <Paragraphs text={s.aboutText} />
            ) : (
              <p className="section-description">
                Solid Print to projektowanie i druk 3D z bezpośrednim kontaktem z osobą, która zajmie
                się Twoim pomysłem. Najpierw rozumiemy potrzebę, potem szukamy formy.
              </p>
            )}
            <Link href="/o-pracowni" className="text-link">
              Więcej o pracowni <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PORADNIK */}
      {articles.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionLabel>WARTO WIEDZIEĆ</SectionLabel>
            <div className="section-title-row">
              <h2>Przed pierwszym wydrukiem.</h2>
              <Link href="/poradnik" className="text-link">
                Poradnik <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="article-grid">
              {articles.slice(0, 3).map((a) => (
                <Link href={`/poradnik/${a.slug}`} className="article-card" key={a.id}>
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KONTAKT NA CIEPŁYM WĘGLU #1C1B19 */}
      <section className="section dark-section contact-section" id="kontakt">
        <div className="container contact-grid">
          <div>
            <SectionLabel number="07">POROZMAWIAJMY O TWOIM POMYŚLE</SectionLabel>
            <h2>
              Co możemy
              <br />
              dla Ciebie stworzyć?
            </h2>
            <p>
              Nie musisz znać wszystkich odpowiedzi.
              <br />
              Od tego jest pierwsza rozmowa.
            </p>
            <div className="contact-links">
              {s.phone && (
                <a href={`tel:${s.phone}`}>
                  <PhoneIcon size={24} /> {s.phone}
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`}>
                  <MailIcon size={24} /> {s.email}
                </a>
              )}
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noreferrer">
                  <InstagramIcon size={24} /> Zobacz pracownię na Instagramie <ArrowUpRight size={17} />
                </a>
              )}
            </div>
            {faqs.length > 0 && <FAQList items={faqs.slice(0, 5)} />}
          </div>
          <div className="contact-form-card" style={{ background: '#FFFFFF', color: 'var(--ink)' }}>
            <span className="mono muted">ZACZNIJMY OD WIADOMOŚCI</span>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
