import type { CollectionConfig } from 'payload'
import { owner } from '../access'
import { privateCollection } from '../fields'
export const systemCollections:CollectionConfig[]=[{
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
{
      ...privateCollection(
        'quote-files',
        'Pliki wycen',
        [
          { name: 'name', label: 'Nazwa pliku', type: 'text', required: true },
          { name: 'size', label: 'Rozmiar', type: 'number', required: true, admin: { components: { Cell: '/components/admin/CatalogCells#FileSizeCell' } } },
          { name: 'kind', label: 'Typ', type: 'select', options: [{ value: 'model', label: 'Model 3D' }, { value: 'reference', label: 'Załącznik' }], required: true },
          { name: 'sessionId', type: 'text', index: true, admin: { hidden: true } },
          { name: 'objectKey', type: 'text', admin: { hidden: true } },
          { name: 'contentHash', label: 'SHA-256 zawartości', type: 'text', admin: { readOnly: true } },
          {
            name: 'status',
            label: 'Stan',
            type: 'select',
            defaultValue: 'pending',
            admin: { components: { Cell: '/components/admin/CatalogCells#OperationalStatusCell' } },
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
        useAsTitle:'name',
        defaultColumns: ['name', 'status', 'kind', 'size', 'createdAt'],
      },
    },
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
            options: [{ value: 'pending', label: 'Oczekuje' }, { value: 'sent', label: 'Wysłano' }, { value: 'failed', label: 'Błąd' }],
            admin: { components: { Cell: '/components/admin/CatalogCells#OperationalStatusCell' } },
          },
          { name: 'attempts', label: 'Próby', type: 'number', defaultValue: 0 },
          { name: 'nextAttemptAt', label: 'Następna próba', type: 'date' },
          { name: 'lastError', label: 'Ostatni błąd', type: 'text' },
        ],
        'System'
      ),
      admin: {
        group: 'System',
        defaultColumns: ['subject', 'state', 'attempts', 'to', 'nextAttemptAt', 'lastError'],
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
    }]
