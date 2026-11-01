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
        useAsTitle:'name',
        defaultColumns: ['name', 'kind', 'size', 'status', 'createdAt'],
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
    }]