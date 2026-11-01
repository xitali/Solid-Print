import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { owner } from '../access'
import { inquiryHistory, type InquiryEvent } from '../lib/inquiry-history'

export const STATUS_OPTIONS = [
  { label: 'Nowe', value: 'new' },
  { label: 'W ocenie', value: 'review' },
  { label: 'Oferta wysłana', value: 'quoted' },
  { label: 'W realizacji', value: 'production' },
  { label: 'Zamknięte', value: 'closed' },
  { label: 'Odrzucone', value: 'rejected' },
] as const

const CLOSED_STATUSES = ['closed', 'rejected']

const setClosedAt: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  data.history = req.context?.anonymize ? [] : inquiryHistory(Array.isArray(originalDoc?.history)?originalDoc.history as InquiryEvent[]:[],originalDoc,data)
  if (CLOSED_STATUSES.includes(data.status) && !originalDoc?.closedAt) {
    data.closedAt = new Date().toISOString()
  } else if (data.status && !CLOSED_STATUSES.includes(data.status)) {
    data.closedAt = null
  }
  return data
}

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Zapytanie', plural: 'Zapytania' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Sprzedaż',
    useAsTitle: 'number',
    defaultColumns: ['number', 'status', 'type', 'name', 'company', 'quantity', 'files', 'createdAt'],
    listSearchableFields: ['number', 'name', 'email', 'company', 'description'],
    description: 'Najnowsze zapytania na górze. Status zmieniasz w prawej kolumnie bocznej.',
  },
  access: {
    read: owner,
    create: () => false,
    update: owner,
    delete: owner,
  },
  hooks: {
    beforeChange: [setClosedAt],
  },
  fields: [
    {name:'history',type:'json',admin:{hidden:true}},
    // Pasek podsumowania z danymi kontaktowymi i parametrami (Item A3)
    {
      name: 'summary',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/InquirySummary#InquirySummary',
        },
      },
    },

    // --- Kolumna boczna (Item A2) ---
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [...STATUS_OPTIONS],
      admin: {
        position: 'sidebar',
        components: {
          Cell: '/components/admin/StatusCell#StatusCell',
        },
      },
    },
    {
      name: 'number',
      label: 'Numer',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'closedAt',
      label: 'Data zamknięcia',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    // --- Pola techniczne ukryte ---
    {
      name: 'idempotencyKey',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'sessionId',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },

    // --- Zakładki główne (bez właściwości 'name' - bez migracji bazy!) ---
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Zapytanie',
          fields: [
            {
              name: 'description',
              label: 'Opis i zastosowanie',
              type: 'textarea',
              admin: { rows: 8 },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  label: 'Rodzaj',
                  type: 'select',
                  options: [
                    { label: 'Druk z pliku', value: 'print' },
                    { label: 'Projektowanie', value: 'design' },
                    { label: 'Gotowy produkt', value: 'product' },
                    { label: 'Kontakt', value: 'contact' },
                  ],
                  admin: {
                    width: '33%',
                    components: {
                      Cell: '/components/admin/TypeCell#TypeCell',
                    },
                  },
                },
                {
                  name: 'quantity',
                  label: 'Liczba sztuk',
                  type: 'number',
                  admin: { width: '33%' },
                },
                {
                  name: 'deadline',
                  label: 'Oczekiwany termin',
                  type: 'text',
                  admin: { width: '33%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'material',
                  label: 'Materiał',
                  type: 'text',
                  admin: { width: '33%' },
                },
                {
                  name: 'color',
                  label: 'Kolor',
                  type: 'text',
                  admin: { width: '33%' },
                },
                {
                  name: 'unit',
                  label: 'Jednostka modelu',
                  type: 'text',
                  admin: {
                    width: '33%',
                    components:{Field:'/components/admin/ChoiceField#ChoiceField'},
                  },
                },
              ],
            },
            {
              name: 'delivery',
              label: 'Dostawa',
              type: 'text',
              admin: {
                components:{Field:'/components/admin/ChoiceField#ChoiceField'},
              },
            },
          ],
        },
        {
          label: 'Klient',
          fields: [
            {name:'privacyTools',type:'ui',admin:{components:{Field:'/components/admin/InquiryTools#InquiryTools'}}},
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Imię', type: 'text' },
                { name: 'email', label: 'E-mail', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'phone', label: 'Telefon', type: 'text' },
                { name: 'company', label: 'Firma', type: 'text' },
              ],
            },
            {
              name: 'nip',
              label: 'NIP',
              type: 'text',
              admin: {
                condition: (data) => Boolean(data?.company || data?.nip),
              },
            },
          ],
        },
        {
          label: 'Pliki',
          fields: [
            {
              name: 'files',
              label: 'Załączniki',
              type: 'relationship',
              relationTo: 'quote-files',
              hasMany: true,
              admin:{components:{Cell:'/components/admin/InquiryDetails#FilesCell'}},
            },
          ],
        },
        {
          label: 'Notatki',
          fields: [
            {name:'historyView',type:'ui',admin:{components:{Field:'/components/admin/InquiryDetails#InquiryHistory'}}},
            {
              name: 'notes',
              label: 'Notatki wewnętrzne (niewidoczne dla klienta)',
              type: 'textarea',
              admin: { rows: 10 },
            },
          ],
        },
        {
          label: 'Technicznie',
          fields: [
            {name:'snapshotView',type:'ui',admin:{components:{Field:'/components/admin/InquiryDetails#ProductSnapshot'}}},
            {
              name: 'productSnapshot',
              label: 'Produkt w chwili zapytania',
              type: 'json',
              admin: { readOnly: true, hidden:true },
            },
          ],
        },
      ],
    },
  ],
}
