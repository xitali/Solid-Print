'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { BookOpen, Box, CircleHelp, FileStack, Images, Inbox, Layers3, Mail, Shapes, Users, Wrench } from 'lucide-react'
import type { BeforeListTableClientProps } from 'payload'

const published = [['published', 'true', 'Opublikowane'], ['published', 'false', 'Szkice']] as const
const lists = {
  inquiries: { Icon: Inbox, filters: [['status', 'new', 'Nowe'], ['status', 'review', 'W ocenie'], ['status', 'production', 'W realizacji']] },
  'quote-files': { Icon: FileStack, filters: [['status', 'quarantined', 'Kwarantanna'], ['status', 'clean', 'Bezpieczne'], ['status', 'infected', 'Zagrożenia']] },
  products: { Icon: Box, filters: [...published, ['featured', 'true', 'Wyróżnione']] },
  materials: { Icon: Layers3, filters: [...published, ['available', 'true', 'Dostępne']] },
  services: { Icon: Wrench, filters: published },
  media: { Icon: Images, filters: [['mimeType', 'image/jpeg', 'JPEG'], ['mimeType', 'image/png', 'PNG'], ['mimeType', 'image/webp', 'WebP']] },
  projects: { Icon: Shapes, filters: published },
  articles: { Icon: BookOpen, filters: published },
  faqs: { Icon: CircleHelp, filters: published },
  users: { Icon: Users, filters: [] },
  outbox: { Icon: Mail, filters: [['state', 'pending', 'Oczekujące'], ['state', 'failed', 'Błędy'], ['state', 'sent', 'Wysłane']] },
} as const

export function WorkspaceList({ collectionSlug }: BeforeListTableClientProps) {
  const pathname = usePathname()
  const params = useSearchParams()
  const base = `/admin/collections/${collectionSlug}`
  const list = lists[collectionSlug as keyof typeof lists]
  if (!list || pathname !== base) return null

  const { Icon, filters } = list
  const filterKeys = Array.from(params.keys()).filter((key) => key.startsWith('where['))

  return (
    <nav className="sp-list-views" aria-label="Szybkie widoki listy">
      <Icon size={18} aria-hidden="true" />
      <Link href={base} prefetch={false} aria-current={!filterKeys.length && !params.get('search') ? 'page' : undefined}>Wszystkie</Link>
      {filters.map(([field, value, label]) => {
        const key = `where[${field}][equals]`
        const active = filterKeys.length === 1 && params.get(key) === value && !params.get('search')
        return <Link key={label} href={`${base}?${new URLSearchParams({ [key]: value })}`} prefetch={false} aria-current={active ? 'page' : undefined}>{label}</Link>
      })}
    </nav>
  )
}
