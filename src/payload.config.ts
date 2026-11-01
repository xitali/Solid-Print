import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { r2Storage } from '@payloadcms/storage-r2'
import { pl } from '@payloadcms/translations/languages/pl'
import { onCloudflare, bindings } from './lib/cloudflare'
import { owner, published } from './access'
import {
  descriptionField,
  publicationField,
  applicationsField,
  imageField,
  content,
  privateCollection,
} from './fields'
import { Inquiries } from './collections/inquiries'
import { Products } from './collections/products'
import { Website } from './globals/website'

const cloud = onCloudflare ? await bindings() : null

// Native Node packages are loaded only by the local PostgreSQL deployment.
const local = cloud
  ? null
  : {
      postgresAdapter: (await import('@payloadcms/db-postgres')).postgresAdapter,
      s3Storage: (await import('@payloadcms/storage-s3')).s3Storage,
      nodemailerAdapter: (await import('@payloadcms/email-nodemailer')).nodemailerAdapter,
      sharp: (await import('sharp')).default,
    }

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
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
      beforeDashboard: ['/components/admin/Dashboard#Dashboard'],
    },
  },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: cloud
    ? sqliteD1Adapter({
        binding: cloud.D1,
        migrationDir: path.resolve(dirname, 'migrations-d1'),
        push: false,
      })
    : local!.postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URL },
        push: process.env.ALLOW_SCHEMA_PUSH === 'true',
      }),
  ...(local ? { sharp: local.sharp } : {}),
  logger: cloud
    ? {
        options: { enabled: true },
        destination: { write: (line: string) => console.log(line.trim()) },
      }
    : undefined,
  email: cloud
    ? () => ({
        name: 'unconfigured',
        defaultFromAddress: 'noreply@solidprint.emanuelwloch.pl',
        defaultFromName: 'Solid Print',
        sendEmail: async () => {
          throw new Error('Poczta nie została jeszcze skonfigurowana.')
        },
      })
    : local!.nodemailerAdapter({
        defaultFromAddress:
          process.env.SMTP_FROM?.match(/<([^>]+)>/)?.[1] || 'powiadomienia@solidprint.local',
        defaultFromName: 'Solid Print',
        transportOptions: {
          host: process.env.SMTP_HOST || '127.0.0.1',
          port: Number(process.env.SMTP_PORT || 51025),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
            : undefined,
        },
      }),
  collections: [
    // --- System ---
    {
      slug: 'users',
      labels: { singular: 'Właściciel', plural: 'Właściciele' },
      auth: { maxLoginAttempts: 5, lockTime: 600000 },
      admin: { useAsTitle: 'email', group: 'System' },
      access: { read: owner, create: owner, update: owner, delete: owner },
      fields: [
        { name: 'name', label: 'Imię', type: 'text' },
        {
          name: 'role',
          type: 'select',
          defaultValue: 'owner',
          required: true,
          options: [{ label: 'Właściciel', value: 'owner' }],
          access: { update: () => false },
        },
      ],
    },
    // --- Treści ---
    {
      slug: 'media',
      labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
      admin: { group: 'Treści' },
      access: { read: () => true, create: owner, update: owner, delete: owner },
      upload: {
        staticDir: path.resolve('.data/public-media'),
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        ...(cloud
          ? {}
          : {
              imageSizes: [
                { name: 'card' as const, width: 800, height: 600, position: 'centre' as const },
              ],
            }),
      },
      fields: [{ name: 'alt', label: 'Opis zdjęcia dla czytników ekranu', type: 'text', required: true }],
    },
    // --- Oferta ---
    Products,
    content(
      'materials',
      'Materiał',
      'Materiały',
      [
        descriptionField,
        { name: 'limitations', label: 'Ograniczenia', type: 'textarea' },
        applicationsField,
        { name: 'colors', label: 'Dostępne kolory', type: 'text' },
        {
          name: 'group',
          label: 'Grupa',
          type: 'select',
          options: [
            { label: 'Dekoracyjne', value: 'decorative' },
            { label: 'Techniczne', value: 'technical' },
            { label: 'Elastyczne', value: 'flexible' },
            { label: 'Na zewnątrz', value: 'outdoor' },
          ],
        },
        { name: 'available', label: 'Dostępny', type: 'checkbox', defaultValue: true },
      ],
      'Oferta'
    ),
    content(
      'services',
      'Usługa',
      'Usługi',
      [
        descriptionField,
        { name: 'body', label: 'Szczegóły (akapity oddziel pustą linią)', type: 'textarea' },
        { name: 'applications', label: 'Zastosowania', type: 'textarea' },
        {
          name: 'relatedProjects',
          label: 'Powiązane realizacje',
          type: 'relationship',
          relationTo: 'projects',
          hasMany: true,
        },
        {
          name: 'kind',
          label: 'Rodzaj formularza',
          type: 'select',
          required: true,
          defaultValue: 'print',
          options: [
            { label: 'Druk z pliku', value: 'print' },
            { label: 'Projektowanie', value: 'design' },
          ],
        },
      ],
      'Oferta'
    ),
    // --- Treści ---
    content(
      'projects',
      'Realizacja',
      'Realizacje',
      [
        { name: 'problem', label: 'Problem', type: 'textarea', required: true },
        { name: 'solution', label: 'Projekt / rozwiązanie', type: 'textarea', required: true },
        { name: 'result', label: 'Efekt', type: 'textarea', required: true },
        imageField,
        { name: 'material', label: 'Materiał', type: 'text' },
        { name: 'dimensions', label: 'Wymiary', type: 'text' },
      ],
      'Treści'
    ),
    content(
      'articles',
      'Artykuł',
      'Poradnik',
      [
        descriptionField,
        { name: 'body', label: 'Treść (akapity oddziel pustą linią)', type: 'textarea', required: true },
        imageField,
      ],
      'Treści'
    ),
    {
      slug: 'faqs',
      labels: { singular: 'Pytanie', plural: 'FAQ' },
      admin: { useAsTitle: 'question', group: 'Treści' },
      access: { read: published, create: owner, update: owner, delete: owner },
      fields: [
        { name: 'question', label: 'Pytanie', type: 'text', required: true },
        { name: 'answer', label: 'Odpowiedź', type: 'textarea', required: true },
        { name: 'order', label: 'Kolejność', type: 'number', defaultValue: 0 },
        publicationField,
      ],
    },
    // --- Sprzedaż ---
    Inquiries,
    {
      ...privateCollection(
        'quote-files',
        'Pliki wycen',
        [
          { name: 'name', label: 'Nazwa pliku', type: 'text', required: true },
          { name: 'size', label: 'Rozmiar w bajtach', type: 'number', required: true },
          { name: 'kind', label: 'Typ', type: 'select', options: ['model', 'reference'], required: true },
          { name: 'sessionId', type: 'text', index: true, admin: { hidden: true } },
          { name: 'objectKey', type: 'text', admin: { hidden: true } },
          { name: 'contentHash', label: 'SHA-256 zawartości', type: 'text', admin: { readOnly: true } },
          {
            name: 'status',
            label: 'Stan',
            type: 'select',
            defaultValue: 'pending',
            options: [
              { label: 'Oczekiwanie na przesłanie', value: 'pending' },
              { label: 'Przesyłanie', value: 'uploading' },
              { label: 'Kwarantanna — oczekuje na skan', value: 'quarantined' },
              { label: 'Bezpieczny — pobierz', value: 'clean' },
              { label: 'Wykryto zagrożenie', value: 'infected' },
            ],
          },
          { name: 'scanMessage', label: 'Wynik skanowania', type: 'text' },
          { name: 'inquiryId', type: 'text', index: true, admin: { hidden: true } },
          {
            name: 'download',
            type: 'ui',
            admin: { components: { Field: '/components/admin/Download#Download' } },
          },
        ],
        'Sprzedaż'
      ),
      admin: {
        group: 'Sprzedaż',
        defaultColumns: ['name', 'kind', 'size', 'status', 'createdAt'],
      },
    },
    // --- System (ukryte / techniczne) ---
    {
      ...privateCollection(
        'upload-sessions',
        'Sesje plików',
        [
          { name: 'tokenHash', type: 'text', index: true },
          { name: 'expiresAt', type: 'date' },
          { name: 'ipHash', type: 'text', index: true },
          { name: 'inquiryId', type: 'text' },
        ],
        'System'
      ),
      admin: { hidden: true },
    },
    {
      ...privateCollection(
        'outbox',
        'Kolejka pocztowa',
        [
          { name: 'to', label: 'Odbiorca', type: 'email', required: true },
          { name: 'subject', label: 'Temat', type: 'text', required: true },
          { name: 'text', type: 'textarea', required: true },
          {
            name: 'state',
            label: 'Stan',
            type: 'select',
            defaultValue: 'pending',
            options: ['pending', 'sent', 'failed'],
          },
          { name: 'attempts', type: 'number', defaultValue: 0 },
          { name: 'nextAttemptAt', type: 'date' },
          { name: 'lastError', type: 'text' },
        ],
        'System'
      ),
      admin: {
        group: 'System',
        defaultColumns: ['to', 'subject', 'state', 'attempts'],
      },
    },
    {
      ...privateCollection(
        'rate-limits',
        'Limity',
        [
          { name: 'key', type: 'text', index: true },
          { name: 'expiresAt', type: 'date' },
        ],
        'System'
      ),
      admin: { hidden: true },
    },
  ],
  globals: [Website],
  plugins: cloud
    ? [
        r2Storage({
          bucket: cloud.MEDIA as unknown as Parameters<typeof r2Storage>[0]['bucket'],
          collections: { media: { prefix: 'public-media' } },
        }),
      ]
    : process.env.S3_ENDPOINT
      ? [
          local!.s3Storage({
            bucket: process.env.S3_BUCKET || 'solid-print-private',
            collections: { media: { prefix: 'public-media' } },
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'us-east-1',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY!,
                secretAccessKey: process.env.S3_SECRET_KEY!,
              },
            },
          }),
        ]
      : [],
})
