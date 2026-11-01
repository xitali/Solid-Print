import Link from 'next/link'
import { ArrowUpRight, Box, Plus, Upload, Check, Truck, Layers } from 'lucide-react'
import { SectionLabel } from './Brand'
import { FileLayersIcon, IdeaIcon, ProductBoxIcon } from './Icons'
import type { FAQ, Product } from '@/lib/types'

export function PageIntro({
  label,
  title,
  description,
  children,
}: {
  label: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <section className="page-intro">
      <div className="container">
        <SectionLabel>{label}</SectionLabel>
        <h1>{title}</h1>
        {description && <p className="intro-copy">{description}</p>}
        {children}
      </div>
    </section>
  )
}

export function EmptyState({
  title = 'Tu zaczyna się Twój projekt.',
  text = 'Nie widzisz tego, czego szukasz? Opisz swój pomysł — sprawdzimy możliwości wykonania.',
  action = true,
}: {
  title?: string
  text?: string
  action?: boolean
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">
        <Layers size={38} strokeWidth={1} />
        <span>+</span>
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        {action && (
          <Link href="/wycena?type=design" className="text-link">
            Opisz swój pomysł <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
      <span className="mono empty-label">INDYWIDUALNY PROJEKT / 3D</span>
    </div>
  )
}

/*
 * Trzy ścieżki na ciemnym pasie (Plansza 02 — IKONY):
 * - Tło: Ciepły Węgiel #1C1B19
 * - 3 kafelki z autorskimi ikonami i pomarańczowym akcentem
 */
export function Pathways() {
  const paths = [
    {
      n: '01',
      Icon: FileLayersIcon,
      title: 'Mam model',
      text: 'Wgrywam plik i opisuję wymagania',
      link: '/wycena?type=print',
      cta: 'Prześlij plik',
    },
    {
      n: '02',
      Icon: IdeaIcon,
      title: 'Mam pomysł',
      text: 'Potrzebuję projektu i wydruku',
      link: '/wycena?type=design',
      cta: 'Opisz swój pomysł',
    },
    {
      n: '03',
      Icon: ProductBoxIcon,
      title: 'Gotowe produkty',
      text: 'Wybieram z katalogu i pytam o zamówienie',
      link: '/projekty',
      cta: 'Wybierz z katalogu',
    },
  ]

  return (
    <section className="pathways dark-section">
      <div className="container">
        <div className="section-heading">
          <SectionLabel number="01">OD CZEGO ZACZYNAMY?</SectionLabel>
          <p className="mono">WYBIERZ SWÓJ PUNKT WYJŚCIA</p>
        </div>
        <div className="path-grid">
          {paths.map(({ n, Icon, title, text, link, cta }) => (
            <Link href={link} className="path-card" key={n}>
              <div className="path-card-top">
                <Icon size={48} />
                <span className="mono">/ {n}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="path-cta">
                {cta}
                <ArrowUpRight size={19} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Process() {
  return (
    <section id="jak-to-dziala" className="section process-section">
      <div className="container">
        <SectionLabel number="03">OD POMYSŁU DO PRZEDMIOTU</SectionLabel>
        <div className="section-title-row">
          <h2>
            Prosty proces.
            <br />
            Konkretny efekt.
          </h2>
          <p>
            Wiesz, co dzieje się z Twoim projektem.
            <br />
            Na każdym etapie jesteśmy w kontakcie.
          </p>
        </div>
        <div className="process-grid">
          {[
            { Icon: Upload, title: 'Opowiedz lub prześlij', text: 'Wyślij model, szkic albo opis tego, czego potrzebujesz.' },
            { Icon: Check, title: 'Ustalmy szczegóły', text: 'Sprawdzimy projekt, dobierzemy materiał i potwierdzimy cenę oraz termin.' },
            { Icon: Layers, title: 'Nadajemy kształt', text: 'Po uzgodnieniu szczegółów przechodzimy do projektowania lub druku.' },
            { Icon: Truck, title: 'Gotowe do Ciebie', text: 'Uzgadniamy wysyłkę lub dostępny sposób odbioru gotowego przedmiotu.' },
          ].map(({ Icon, title, text }, i) => (
            <div className="process-step" key={title}>
              <div className="process-node">
                <span className="mono">0{i + 1}</span>
                <Icon size={23} strokeWidth={1.3} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="process-note mono">
          <span /> CENA I TERMIN ZAWSZE PO SPRAWDZENIU PROJEKTU.
        </p>
      </div>
    </section>
  )
}

export function FAQList({ items }: { items: FAQ[] }) {
  return (
    <div className="faq-list">
      {items.map((f, i) => (
        <details key={f.id}>
          <summary>
            <span className="mono">0{i + 1}</span>
            {f.question}
            <Plus size={19} />
          </summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function ProductCard({ product: p }: { product: Product }) {
  const image = p.images?.[0]?.image

  return (
    <article className="product-card">
      <Link href={`/projekty/${p.slug}`} className="product-visual corner-frame">
        {image?.url ? (
          <img src={image.url} alt={image.alt || p.title} loading="lazy" />
        ) : (
          <div className="product-no-image">
            <Box strokeWidth={0.8} size={64} />
            <span className="mono">PROJEKT PRACOWNI</span>
          </div>
        )}
        <span className={`product-badge ${p.available ? 'badge-yellow' : 'tag-pill-dark'} mono`}>
          {p.available ? 'NA ZAMÓWIENIE' : 'REALIZACJA'}
        </span>
        <span className="product-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono muted">{p.category || 'PROJEKT 3D'}</span>
          {p.material && <span className="tag-pill mono">{p.material}</span>}
        </div>
        <Link href={`/projekty/${p.slug}`}>
          <h3>{p.title}</h3>
        </Link>
        <p>{p.description}</p>
        <div className="product-spec mono">
          <span>{p.dimensions ? `WYMIARY: ${p.dimensions}` : 'PARAMETRY DO UZGODNIENIA'}</span>
        </div>
        {p.priceFrom !== undefined && p.priceFrom !== null && (
          <span className="product-price">
            od {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(p.priceFrom)}
            <small> brutto</small>
          </span>
        )}
      </div>
    </article>
  )
}

export function Paragraphs({ text }: { text?: string }) {
  return (
    <>
      {text?.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  )
}
