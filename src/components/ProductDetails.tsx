'use client'

import { useState, ViewTransition } from 'react'
import Link from 'next/link'
import { Box, ArrowUpRight, X } from 'lucide-react'
import type { Product } from '@/lib/types'
import { Modal } from './Modal'

export function ProductDetails({ product: p }: { product: Product }) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [variant, setVariant] = useState(p.variants?.[0]?.name || '')
  const [quantity, setQuantity] = useState(1)

  const images = p.images || []
  const image = images[index]?.image

  return (
    <div className="detail-grid">
      <div>
        <ViewTransition name={`product-${p.id}`} default="none" share="sp-product"><div className="product-gallery-main corner-frame">
          {image?.url ? (
            <button type="button" onClick={() => setExpanded(true)} aria-label="Powiększ zdjęcie produktu">
              <img src={image.url} alt={image.alt || p.title} width={image.width} height={image.height} decoding="async" fetchPriority="high" />
            </button>
          ) : (
            <div className="product-no-image">
              <Box size={80} strokeWidth={0.8} />
              <span className="mono">ZDJĘCIE NIE ZOSTAŁO JESZCZE DODANE</span>
            </div>
          )}
        </div></ViewTransition>
        {images.length > 1 && (
          <div className="product-gallery-thumbs">
            {images.map((img, i) => (
              <button
                type="button"
                key={i}
                aria-label={`Zdjęcie ${i + 1}`}
                aria-pressed={index === i}
                onClick={() => setIndex(i)}
              >
                <img src={img.image.url} alt={img.image.alt || `Zdjęcie ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
        {images[index]?.caption && <p className="form-note">{images[index].caption}</p>}
      </div>

      <div className="product-detail-info">
        <span className="eyebrow">
          {p.category || 'PROJEKT PRACOWNI'} / {p.available ? 'NA ZAMÓWIENIE' : 'REALIZACJA'}
        </span>
        <h1>{p.title}</h1>
        <p className="detail-description">{p.description}</p>

        {p.applications?.length ? (
          <div className="product-applications">
            {p.applications.map((a) => (
              <Link key={a.value} href={`/projekty?application=${encodeURIComponent(a.value)}`}>
                {a.value} ↗
              </Link>
            ))}
          </div>
        ) : null}

        {(p.material || p.dimensions || p.layerHeight) && (
          <dl className="spec-list">
            {p.material && (
              <div>
                <dt>MATERIAŁ</dt>
                <dd>{p.material}</dd>
              </div>
            )}
            {p.dimensions && (
              <div>
                <dt>WYMIARY</dt>
                <dd>{p.dimensions}</dd>
              </div>
            )}
            {p.layerHeight && (
              <div>
                <dt>WARSTWA</dt>
                <dd>{p.layerHeight}</dd>
              </div>
            )}
          </dl>
        )}

        {p.personalization && (
          <div>
            <h3 style={{ font: "700 20px var(--font-heading)", margin: "var(--s-4) 0 var(--s-2)", color: "var(--ink)" }}>
              Po Twojemu.
            </h3>
            <p className="detail-description">{p.personalization}</p>
          </div>
        )}

        {p.available ? (
          <div className="product-order-box">
            {p.priceFrom !== null && p.priceFrom !== undefined && (
              <p className="product-price">
                od {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(p.priceFrom)}{' '}
                <small>brutto</small>
              </p>
            )}
            <div className="field-row">
              {p.variants?.length ? (
                <div className="field">
                  <label htmlFor="order-variant">Wariant</label>
                  <select
                    id="order-variant"
                    className="select"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                  >
                    {p.variants.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                        {v.color && ` / ${v.color}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="field">
                  <span className="field-label">Wykonanie</span>
                  <span style={{ fontSize: '15px', color: 'var(--ink)' }}>Na indywidualne zamówienie</span>
                </div>
              )}
              <div className="field">
                <label htmlFor="order-quantity">Ilość</label>
                <input
                  type="number"
                  id="order-quantity"
                  className="input"
                  min={1}
                  max={100000}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))}
                />
              </div>
            </div>

            <Link
              href={`/wycena?type=product&product=${p.id}&variant=${encodeURIComponent(variant)}&quantity=${quantity}`}
              className="btn btn--primary"
            >
              <span>Zapytaj o zamówienie</span>
              <ArrowUpRight size={18} />
            </Link>

            <p className="form-note">
              {p.leadTime && `Orientacyjny termin: ${p.leadTime}. `}
              Ostateczną cenę i termin potwierdzimy w odpowiedzi.
            </p>
          </div>
        ) : (
          <div className="notice">
            Ten projekt prezentujemy jako realizację.{' '}
            <Link className="text-link" href="/wycena?type=design">
              Zapytaj o podobne rozwiązanie <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>

      {expanded && image?.url && (
        <Modal className="image-modal" label="Powiększone zdjęcie" onClose={() => setExpanded(false)}>
          <div className="lightbox">
            <button autoFocus onClick={() => setExpanded(false)} aria-label="Zamknij powiększenie">
              <X />
            </button>
            <img src={image.url} alt={image.alt || p.title} />
          </div>
        </Modal>
      )}
    </div>
  )
}
