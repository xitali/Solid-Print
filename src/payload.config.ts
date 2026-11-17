import { pl } from '@payloadcms/translations/languages/pl'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type CollectionConfig } from 'payload'
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
export default buildConfig({
...await platformConfig(),
secret: process.env.PAYLOAD_SECRET || 'build-only-secret-not-for-production',
serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000',
i18n: { fallbackLanguage: 'pl', supportedLanguages: { pl } },
admin: {
    user: 'users',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' — Solid Print' },
    components: {
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
collections: collections.map(collection => ({
  ...collection,
  admin: {
    ...collection.admin,
    components: {
      ...collection.admin?.components,
      beforeListTable: [...(collection.admin?.components?.beforeListTable ?? []), '/components/admin/WorkspaceList#WorkspaceList'],
    },
  },
})),
})
