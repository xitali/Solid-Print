import type { Field, CollectionConfig, UploadField } from 'payload'
import { owner, published } from './access'

const ascii = (s: string) =>
  s
    .replace(/ą/g, 'a')
    .replace(/Ą/g, 'A')
    .replace(/ć/g, 'c')
    .replace(/Ć/g, 'C')
    .replace(/ę/g, 'e')
    .replace(/Ę/g, 'E')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/ń/g, 'n')
    .replace(/Ń/g, 'N')
    .replace(/ó/g, 'o')
    .replace(/Ó/g, 'O')
    .replace(/ś/g, 's')
    .replace(/Ś/g, 'S')
    .replace(/ź/g, 'z')
    .replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z')
    .replace(/Ż/g, 'Z')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const slugify = (s: string) =>
  ascii(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const titleField: Field = {
  name: 'title',
  label: 'Nazwa / tytuł',
  type: 'text',
  required: true,
}

export const slugField: Field = {
  name: 'slug',
  label: 'Adres (np. uchwyt-do-lampy)',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Generuje się automatycznie z nazwy. Zmieniaj tylko w razie potrzeby.',
    components: { Field:'/components/admin/SlugField#SlugField' },
  },
  hooks: {
    beforeValidate: [({ value, data }) => value || (data?.title ? slugify(String(data.title)) : value)],
  },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : 'Użyj małych liter bez polskich znaków oraz cyfr i myślników.',
}

export const descriptionField: Field = {
  name: 'description',
  label: 'Opis',
  type: 'textarea',
  required: true,
}

export const publicationField: Field = {
  name: 'published',
  label: 'Opublikowane',
  type: 'checkbox',
  defaultValue: false,
  admin: { position: 'sidebar' },
}

export const applicationsField: Field = {
  name: 'applications',
  label: 'Zastosowania',
  labels: { singular: 'Zastosowanie', plural: 'Zastosowania' },
  type: 'array',
  fields: [{ name: 'value', label: 'Zastosowanie', type: 'text', required: true }],
}

export const imageField: UploadField = {
  name: 'image',
  label: 'Zdjęcie',
  type: 'upload',
  relationTo: 'media',
}

export const content = (
  slugName: string,
  singular: string,
  plural: string,
  fields: Field[],
  group = 'Treści'
): CollectionConfig => ({
  slug: slugName,
  labels: { singular, plural },
  admin: {
    useAsTitle: 'title',
    group,
    defaultColumns: ['title', 'published', 'updatedAt'],
  },
  access: { read: published, create: owner, update: owner, delete: owner },
  fields: [titleField, slugField, ...fields, publicationField],
})

export const privateCollection = (
  slugName: string,
  label: string,
  fields: Field[],
  group = 'Sprzedaż'
): CollectionConfig => ({
  slug: slugName,
  labels: { singular: label, plural: label },
  admin: { group },
  access: { read: owner, create: () => false, update: owner, delete: owner },
  fields,
})
