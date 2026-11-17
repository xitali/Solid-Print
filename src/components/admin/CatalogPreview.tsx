'use client'

import { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import { mediaId } from '@/lib/media-reference'

export function CatalogPreview({ kind }: { kind: 'material' | 'service' | 'project' }) {
  const fields = useFormFields(([state]) => state)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState<{ id: number; url: string; alt: string } | null>(null)
  const id = kind === 'project' ? mediaId(fields.image?.value) : undefined

  useEffect(() => {
    if (!open || !id) return
    const controller = new AbortController()
    fetch(`/api/media/${id}?depth=0`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return
        const { url, alt } = await response.json()
        if (typeof url === 'string' && !controller.signal.aborted) setLoaded({ id, url, alt: alt || '' })
      })
      .catch(() => { /* The text preview remains available when media cannot be read. */ })
    return () => controller.abort()
  }, [id, open])

  const text = (path: string) => {
    const value = fields[path]?.value
    return typeof value === 'string' ? value.trim() : ''
  }
  const samples = (fields.colorSamples?.rows ?? []).slice(0, 8)

  return (
    <details className="sp-catalog-preview sp-admin-card" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Podgląd karty · {fields.published?.value ? 'Opublikowane po zapisie' : 'Szkic'}</summary>
      {open && <article>
        {kind === 'project' && id && loaded?.id === id && <img src={loaded.url} alt={loaded.alt || text('title')} />}
        <h2>{text('title') || 'Tytuł karty'}</h2>
        <p>{text(kind === 'project' ? 'result' : 'description') || 'Tu pojawi się opis karty.'}</p>
        {kind === 'material' && <>
          {text('colors') && <p>{text('colors')}</p>}
          {!!samples.length && <ul className="sp-preview-samples" aria-label="Próbki kolorów">
            {samples.map(({ id }, index) => {
              const hex = text(`colorSamples.${index}.hex`)
              const name = text(`colorSamples.${index}.name`)
              return name && <li key={id}>{/^#[0-9a-f]{6}$/i.test(hex) && <span style={{ backgroundColor: hex }} />}{name}</li>
            })}
          </ul>}
          {(fields.glassFiber?.value || fields.carbonFiber?.value) ? <p>{[
            fields.glassFiber?.value && 'Włókno szklane (GF)', fields.carbonFiber?.value && 'Włókno węglowe (CF)',
          ].filter(Boolean).join(', ')}</p> : null}
        </>}
        {kind === 'service' && <>
          {text('requirements') && <p><strong>Wymagania</strong><br />{text('requirements')}</p>}
          {text('additionalInfo') && <p><strong>Dodatkowe informacje</strong><br />{text('additionalInfo')}</p>}
        </>}
      </article>}
    </details>
  )
}
