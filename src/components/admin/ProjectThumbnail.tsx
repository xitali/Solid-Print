'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { UploadField, useField, useFormFields } from '@payloadcms/ui'
import type { UploadFieldClientComponent } from 'payload'
import { mediaId } from '@/lib/media-reference'

async function imageFile(id: number, signal: AbortSignal) {
  const media = await fetch(`/api/media/${id}?depth=0`, { signal })
  if (!media.ok) throw new Error('Nie można odczytać oryginału.')
  const { url, alt } = await media.json() as { url?: string; alt?: string }
  if (!url) throw new Error('Oryginał nie ma adresu pliku.')
  const source = new URL(url, window.location.origin)
  if (source.origin !== window.location.origin && !source.pathname.startsWith('/api/media/file/')) {
    throw new Error('Oryginał pochodzi spoza biblioteki zdjęć.')
  }
  const response = await fetch(source.pathname + source.search, { signal })
  if (!response.ok) throw new Error('Nie można pobrać oryginału.')

  const bitmap = await createImageBitmap(await response.blob())
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  try {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Przeglądarka nie może przygotować miniatury.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  } finally {
    bitmap.close()
  }

  const thumbnail = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82))
  if (thumbnail?.type !== 'image/webp') throw new Error('Przeglądarka nie zapisała miniatury WebP.')

  const form = new FormData()
  form.append('file', thumbnail, `realizacja-${id}-${crypto.randomUUID().slice(0, 8)}.webp`)
  form.append('_payload', JSON.stringify({ alt: alt || 'Miniatura realizacji' }))
  return form
}

export const ProjectThumbnail: UploadFieldClientComponent = (props) => {
  const { setValue, disabled, formInitializing, formProcessing, initialValue } = useField({ potentiallyStalePath: props.path })
  const source = useFormFields(([fields]) => mediaId(fields.image?.value))
  const initialSource = useFormFields(([fields]) => mediaId(fields.image?.initialValue))
  const initialThumbnail = mediaId(initialValue)
  const previousSource = useRef(source)
  const request = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const readOnly = disabled || Boolean(props.readOnly)

  const generate = useCallback(async (id: number) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const { signal } = controller
    setBusy(true)
    setMessage('Przygotowywanie miniatury…')
    try {
      const body = await imageFile(id, signal)
      signal.throwIfAborted()
      const response = await fetch('/api/media', { method: 'POST', body, signal })
      if (!response.ok) throw new Error('Nie można zapisać miniatury w bibliotece.')
      const { doc } = await response.json()
      signal.throwIfAborted()
      const thumbnail = mediaId(doc)
      if (!thumbnail) throw new Error('Biblioteka nie zwróciła zapisanej miniatury.')
      setValue(thumbnail)
      setMessage('Miniatura jest gotowa. Zapisz realizację, aby ją zastosować.')
    } catch (error) {
      if (!signal.aborted) setMessage(`${error instanceof Error ? error.message : 'Nie udało się przygotować miniatury.'} Możesz zapisać oryginał.`)
    } finally {
      if (request.current === controller) setBusy(false)
    }
  }, [setValue])

  useEffect(() => {
    if (formInitializing) return
    if (source !== previousSource.current && !readOnly) {
      previousSource.current = source
      setValue(source === initialSource ? initialThumbnail ?? null : null)
    }
    const timeout = setTimeout(() => {
      if (source && source !== initialSource && !readOnly) void generate(source)
      else { setBusy(false); setMessage('') }
    }, 300)
    return () => { clearTimeout(timeout); request.current?.abort() }
  }, [source, initialSource, initialThumbnail, readOnly, formInitializing, setValue, generate])

  return (
    <>
      <UploadField {...props} />
      <div className="sp-thumbnail-tools">
        <button type="button" disabled={!source || readOnly || busy || formProcessing} onClick={() => source && void generate(source)}>Przygotuj miniaturę</button>
        {message && <p role="status">{message}</p>}
      </div>
    </>
  )
}
