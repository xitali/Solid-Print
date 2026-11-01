import type { CollectionConfig } from 'payload'
import { owner, published } from '../access'
import {
  titleField,
  slugField,
  descriptionField,
  publicationField,
  applicationsField,
  imageField,
} from '../fields'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Gotowe projekty' },
  admin: {
    group: 'Oferta',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'priceFrom', 'available', 'published'],
    description: 'Katalog produktów i gotowych modeli 3D.',
    preview:doc=>`${process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000'}/projekty/${doc.slug}`,
  },
  access: {
    read: published,
    create: owner,
    update: owner,
    delete: owner,
  },
  fields: [
    // Pasek boczny
    slugField,
    publicationField,

    // Główne zakładki bez 'name' (aby zachować płaską strukturę w bazie D1 SQLite)
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Podstawy',
          fields: [
            titleField,
            descriptionField,
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Kategoria',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'available',
                  label: 'Przyjmuj zapytania o ten produkt',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '25%' },
                },
                {
                  name: 'featured',
                  label: 'Wyróżnij na stronie głównej',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { width: '25%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Parametry',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'material',
                  label: 'Materiał',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'dimensions',
                  label: 'Wymiary (z jednostką)',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'layerHeight',
                  label: 'Wysokość warstwy',
                  type: 'text',
                  admin: { width: '33%' },
                },
                {
                  name: 'priceFrom',
                  label: 'Cena od (PLN, brutto)',
                  type: 'number',
                  min: 0,
                  admin: { width: '33%' },
                },
                {
                  name: 'leadTime',
                  label: 'Orientacyjny termin',
                  type: 'text',
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'personalization',
              label: 'Możliwości personalizacji',
              type: 'textarea',
            },
            applicationsField,
          ],
        },
        {
          label: 'Warianty',
          fields: [
            {
              name: 'variants',
              label: 'Warianty',
              labels: { singular: 'Wariant', plural: 'Warianty' },
              type: 'array',
              fields: [
                {
                  name: 'name',
                  label: 'Nazwa wariantu',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'color',
                  label: 'Kolor',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Galeria',
          fields: [
            {
              name: 'images',
              label: 'Galeria',
              labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
              type: 'array',
              fields: [
                {
                  ...imageField,
                  required: true,
                },
                {
                  name: 'caption',
                  label: 'Podpis',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
