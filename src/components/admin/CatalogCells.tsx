import { RecordEditLink } from './RecordEditLink'

const decimal = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 })

export function FileSizeCell({ cellData }: { cellData?: number | null }) {
  if (typeof cellData !== 'number') return '—'
  if (cellData >= 1_048_576) return `${decimal.format(cellData / 1_048_576)} MiB`
  if (cellData >= 1024) return `${decimal.format(cellData / 1024)} KiB`
  return `${decimal.format(cellData)} B`
}

const statuses: Record<string, [string, string]> = {
  clean: ['Bezpieczny', 'ok'], quarantined: ['Kwarantanna', 'waiting'], infected: ['Wykryto zagrożenie', 'error'],
  pending: ['Oczekuje', 'waiting'], uploading: ['Przesyłanie', 'waiting'], sent: ['Wysłano', 'ok'], failed: ['Błąd', 'error'],
}

export function OperationalStatusCell({ cellData }: { cellData?: string | null }) {
  const [label, tone] = statuses[cellData ?? ''] ?? ['Nieznany stan', 'neutral']
  return <span className={`sp-state-pill sp-state-${tone}`}>{label}</span>
}

export function PublicationCell({ cellData }: { cellData?: boolean | null }) {
  return <span className={`sp-state-pill sp-state-${cellData ? 'ok' : 'neutral'}`}>{cellData ? 'Opublikowane' : 'Szkic'}</span>
}

export function MaterialSampleCount({ rowData }: { rowData?: { colorSamples?: unknown[] | null } }) {
  return String(rowData?.colorSamples?.length ?? 0)
}

export function ServiceRequirementsCell({ rowData }: { rowData?: { requirements?: string | null } }) {
  return rowData?.requirements?.trim() ? 'Uzupełnione' : '—'
}

export function MediaPreviewCell({ rowData, viewType }: {
  rowData?: { id?: number | string; url?: string | null; alt?: string; filename?: string | null }
  viewType?: string
}) {
  return (
    <div className="sp-record-preview">
      {rowData?.url
        ? <img className="sp-media-tile" src={rowData.url} alt={rowData.alt || ''} width={72} height={54} loading="lazy" />
        : <span>Brak zdjęcia</span>}
      <RecordEditLink collection="media" id={rowData?.id} name={rowData?.filename} viewType={viewType} />
    </div>
  )
}
