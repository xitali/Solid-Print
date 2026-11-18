import { pl } from '@payloadcms/translations/languages/pl'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type CollectionConfig, type Field } from 'payload'
import { catalogCollections } from './collections/catalog'
import { Inquiries } from './collections/inquiries'
import { Products } from './collections/products'
import { systemCollections } from './collections/system'
import { Website } from './globals/website'
import { onCloudflare } from './lib/cloudflare'
import { platformConfig } from './lib/platform-config'
const dirname=path.dirname(fileURLToPath(import.meta.url))
const collections: CollectionConfig[] = [Inquiries, ...systemCollections.filter(c => c.slug === 'quote-files'), Products,
  ...catalogCollections(onCloudflare), ...systemCollections.filter(c => c.slug !== 'quote-files')]
const listColumns: Record<string, string[]> = {
  materials: ['title', 'published', 'displayOrder', 'sampleCount', 'updatedAt'],
  services: ['title', 'published', 'displayOrder', 'requirementsState', 'updatedAt'],
  products: [...(Products.admin?.defaultColumns ?? []), 'recordActions'],
  media: ['preview', 'filename', 'alt', 'updatedAt', 'recordActions'],
  projects: ['title', 'published', 'image', 'cardImage', 'updatedAt'],
  faqs: ['question', 'published', 'order', 'updatedAt'],
}
const summaryFields: Record<string, { name: string; label: string; component: string }> = {
  materials: { name: 'sampleCount', label: 'Próbki', component: 'MaterialSampleCount' },
  services: { name: 'requirementsState', label: 'Wymagania', component: 'ServiceRequirementsCell' },
  media: { name: 'preview', label: 'Miniatura', component: 'MediaPreviewCell' },
}
const recordActions: Field = {
  name: 'recordActions',
  label: 'Akcje',
  type: 'ui',
  admin: { components: { Cell: '/components/admin/RecordActions#RecordActions' } },
}
export default buildConfig({
...await platformConfig(),
secret: process.env.PAYLOAD_SECRET || 'build-only-secret-not-for-production',
serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000',
i18n: { fallbackLanguage: 'pl', supportedLanguages: { pl } },
admin: {
    user: 'users',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' — Solid Print' },
    dateFormat: 'dd.MM.yyyy, HH:mm',
    components: {
      providers: ['/components/admin/WorkspaceAccessibility#WorkspaceAccessibility'],
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Logo#Icon',
      },
      beforeLogin: ['/components/admin/Welcome#Welcome'],
      beforeNavLinks: ['/components/admin/WorkspaceNavigation#WorkspaceNavigation'],
      views: {
        dashboard: { Component: '/components/admin/Dashboard#Dashboard' },
        operations: { path: '/stan-systemu', Component: '/components/admin/Operations#OperationsView' },
      },
    },
  },
typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
globals: [Website],
collections: collections.map(collection => {
  const summary = summaryFields[collection.slug]
  const fields = [...collection.fields]
  if (summary) {
    fields.push({ name: summary.name, label: summary.label, type: 'ui',
      admin: { components: { Cell: `/components/admin/CatalogCells#${summary.component}` } } })
  }
  if (collection.slug === 'products' || collection.slug === 'media') fields.push(recordActions)
  return {
    ...collection,
    fields,
    admin: {
      ...collection.admin,
      defaultColumns: listColumns[collection.slug] ?? collection.admin?.defaultColumns,
      components: {
        ...collection.admin?.components,
        beforeListTable: [...(collection.admin?.components?.beforeListTable ?? []), '/components/admin/WorkspaceList#WorkspaceList'],
      },
    },
  }
}),
})
