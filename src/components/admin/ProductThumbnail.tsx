'use client'
import { useEffect, useState } from 'react'

type Image = { id?: number; url?: string; alt?: string }
export function ProductThumbnail({ rowData }: {
  rowData?: { title?: string; images?: { image?: number | Image }[] }
}) {
  const image=rowData?.images?.[0]?.image
  const id=typeof image==='number'?image:image?.id
  const embedded = typeof image === 'object' ? image : undefined
  const [loaded, setLoaded] = useState<{ id: number; image: Image | null }>()
  useEffect(() => {
    if (!id || embedded?.url) return
    const controller=new AbortController()
    fetch(`/api/media/${id}?depth=0`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted) setLoaded({ id, image: data }) })
      .catch(() => {})
    return () => controller.abort()
  }, [id, embedded?.url])
  const photo = embedded?.url ? embedded : loaded && loaded.id === id ? loaded.image : null

  return photo?.url
    ? <img className="sp-media-tile" src={photo.url} alt={photo.alt || rowData?.title || ''} width={64} height={48} loading="lazy" decoding="async" />
    : <span>Brak zdjęcia</span>
}
