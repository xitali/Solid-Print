'use client'

import { ConfirmationModal, toast, useAuth, useConfig, useListQuery, useModal } from '@payloadcms/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EditRecordIcon, DeleteRecordIcon } from '@/components/Icons'

export function RecordActions({ collectionSlug, rowData, viewType }: {
  collectionSlug: string
  rowData?: { id?: number | string; title?: string; filename?: string }
  viewType?: string
}) {
  const { permissions } = useAuth()
  const { config: { routes } } = useConfig()
  const { openModal } = useModal()
  const { data, query, handlePageChange } = useListQuery()
  const router = useRouter()
  const id = rowData?.id
  const access = permissions?.collections?.[collectionSlug]
  if (viewType !== 'list' || !rowData || id == null || !access || (!access.update && !access.delete)) return null

  const name = rowData.title || rowData.filename || String(id)
  const recordPath = `${collectionSlug}/${encodeURIComponent(id)}`
  const modalSlug = `sp-delete-${collectionSlug}-${id}`

  async function remove() {
    try {
      const response = await fetch(`${routes.api}/${recordPath}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.errors?.[0]?.message || 'Nie udało się usunąć rekordu.')
      }
      toast.success(`Usunięto „${name}”.`)
      if (data?.docs.length === 1 && query.page && query.page > 1 && handlePageChange) {
        await handlePageChange(query.page - 1)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nie udało się usunąć rekordu.')
    }
  }

  return (
    <div className="sp-record-actions">
      {access.update && <Link href={`${routes.admin}/collections/${recordPath}`} prefetch={false}
        aria-label={`Edytuj: ${name}`} title={`Edytuj: ${name}`}>
        <EditRecordIcon size={24} />
      </Link>}
      {access.delete && <>
        <button type="button" className="sp-delete-record" aria-label={`Usuń: ${name}`}
          title={`Usuń: ${name}`} onClick={() => openModal(modalSlug)}>
          <DeleteRecordIcon size={24} />
        </button>
        <ConfirmationModal modalSlug={modalSlug} heading={`Usunąć „${name}”?`}
          body={collectionSlug === 'media'
            ? 'Zdjęcie zostanie usunięte z biblioteki i może zniknąć z miejsc, w których jest używane. Tej operacji nie można cofnąć w panelu.'
            : 'Projekt zostanie usunięty z katalogu. Tej operacji nie można cofnąć w panelu.'}
          cancelLabel="Anuluj" confirmLabel="Usuń" confirmingLabel="Usuwanie…" onConfirm={remove} />
      </>}
    </div>
  )
}
