'use client'
import { useDocumentInfo } from '@payloadcms/ui'
export function Download() {const {id} = useDocumentInfo(); return <p><a href={`/api/quote/files/${id}/download`} target="_blank" rel="noreferrer">Pobierz plik po sprawdzeniu bezpieczeństwa ↗</a><br/><small>Pobieranie jest dostępne wyłącznie po wyniku skanowania „Bezpieczny”.</small></p>}
