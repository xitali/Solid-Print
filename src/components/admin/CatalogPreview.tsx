'use client'

import { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import { mediaId } from '@/lib/media-reference'

export function CatalogPreview({ kind }: { kind: 'material' | 'service' | 'project' }) {
  const fields = useFormFields(([state]) => state)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState<{ id: number; url: string; alt: string }[]>([])
  const id = kind === 'project' ? mediaId(fields.image?.value) : undefined
  const thumbnail = kind === 'project' ? mediaId(fields.cardImage?.value) : undefined

  useEffect(() => {
    if (!open || (!id && !thumbnail)) return
    const controller = new AbortController()
    Promise.all([...new Set([id, thumbnail])].map(async (media) => {
      if (!media) return null
      try {
        const response = await fetch(`/api/media/${media}?depth=0`, { signal: controller.signal })
        if (!response.ok) return null
        const { url, alt } = await response.json()
        return typeof url === 'string' ? { id: media, url, alt: alt || '' } : null
      } catch { return null }
    })).then((images) => { if (!controller.signal.aborted) setLoaded(images.filter((image) => image !== null)) })
    return () => controller.abort()
  }, [id, thumbnail, open])

  const text = (path: string) => {
    const value = fields[path]?.value
    return typeof value === 'string' ? value.trim() : ''
  }
  const samples = (fields.colorSamples?.rows ?? []).slice(0, 8)

  return (
    <details className="sp-catalog-preview sp-admin-card" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Podgląd karty · {fields.published?.value ? 'Opublikowane po zapisie' : 'Szkic'}</summary>
      {open && <article>
        {kind === 'project' && id && <div className="sp-preview-images">
          {[['Oryginał', id], ['Miniatura karty', thumbnail]].map(([label, imageId]) => {
            const image = loaded.find((photo) => photo.id === imageId)
            return <figure key={label}><figcaption>{label}</figcaption>{image ? <img src={image.url} alt={image.alt || text('title')} /> : <p>{imageId ? 'Zdjęcie wybrane' : 'Do przygotowania'}</p>}</figure>
          })}
        </div>}
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
