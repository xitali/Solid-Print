import path from 'node:path'
import type { CollectionConfig, Field } from 'payload'
import { owner,published } from '../access'
import { applicationsField,content,descriptionField,imageField,publicationField } from '../fields'

const displayOrderField: Field = {
  name: 'displayOrder',
  label: 'Kolejność na stronie',
  type: 'number',
  min: 1,
  max: 2147483647,
  validate: (value: number | null | undefined) =>
    value == null || (Number.isInteger(value) && value >= 1 && value <= 2147483647)
      ? true
      : 'Podaj dodatnią liczbę całkowitą do 2147483647.',
  admin: {
    position: 'sidebar',
    description: '1 jest pierwsze. Pozycje bez numeru wyświetlają się na końcu.',
  },
}

export function catalogCollections(cloud:boolean):CollectionConfig[]{return [{
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
          name: 'colorSamples',
          label: 'Próbki kolorów',
          labels: { singular: 'Próbka koloru', plural: 'Próbki kolorów' },
          type: 'array',
          fields: [
            { name: 'name', label: 'Nazwa koloru', type: 'text', required: true },
            {
              name: 'hex',
              label: 'Kod koloru HEX',
              type: 'text',
              admin: { placeholder: '#E06A38' },
              validate: (value: string | null | undefined) =>
                !value || /^#[0-9a-f]{6}$/i.test(value) ? true : 'Podaj kod w formacie #RRGGBB.',
            },
            imageField,
          ],
          admin: { description: 'Podaj kod koloru lub dodaj zdjęcie próbki. Jeśli dodasz oba, pokażemy zdjęcie.' },
        },
        {
          type: 'collapsible',
          label: 'Warianty wzmacniane włóknem',
          fields: [
            { name: 'glassFiber', label: 'Włókno szklane (GF)', type: 'checkbox' },
            { name: 'carbonFiber', label: 'Włókno węglowe (CF)', type: 'checkbox' },
          ],
        },
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
        displayOrderField,
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
        { name: 'requirements', label: 'Wymagania', type: 'textarea' },
        { name: 'additionalInfo', label: 'Dodatkowe informacje', type: 'textarea' },
        displayOrderField,
      ],
      'Oferta'
    ),
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
    }]}
