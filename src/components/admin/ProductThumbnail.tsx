'use client'
import { useEffect, useState } from 'react'
import { RecordEditLink } from './RecordEditLink'

type Image = { id?: number; url?: string; alt?: string }
export function ProductThumbnail({ rowData, viewType }: {
  rowData?: { id?: number | string; title?: string; images?: { image?: number | Image }[] }
  viewType?: string
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

  return (
    <div className="sp-record-preview">
      {photo?.url
        ? <img className="sp-media-tile" src={photo.url} alt={photo.alt || rowData?.title || ''} width={64} height={48} loading="lazy" decoding="async" />
        : <span>Brak zdjęcia</span>}
      <RecordEditLink collection="products" id={rowData?.id} name={rowData?.title} viewType={viewType} />
    </div>
  )
}
