import { Pencil } from 'lucide-react'
import Link from 'next/link'

export function RecordEditLink({ collection, id, name, viewType }: {
  collection: 'products' | 'media'
  id?: number | string
  name?: string | null
  viewType?: string
}) {
  if (id == null || viewType !== 'list') return null

  return (
    <Link className="sp-record-edit" href={`/admin/collections/${collection}/${encodeURIComponent(id)}`}
      prefetch={false} aria-label={name ? `Edytuj: ${name}` : 'Edytuj rekord'}>
      <Pencil size={15} aria-hidden="true" />
      Edytuj
    </Link>
  )
}
