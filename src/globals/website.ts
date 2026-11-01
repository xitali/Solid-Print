import type { GlobalConfig, Field } from 'payload'
import { owner } from '../access'
import { imageField } from '../fields'

export const Website: GlobalConfig = {
  slug: 'website',
  label: 'Ustawienia strony',
  admin: {
    group: 'System',
    description: 'Globalne ustawienia strony głównej, pracowni, kontaktu i dokumentów prawnych.',
  },
  access: {
    read: () => true,
    update: owner,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Strona główna',
          fields: [
            {
              name: 'heroTitle',
              label: 'Nagłówek',
              type: 'text',
              defaultValue: 'Od pomysłu do gotowego wydruku 3D',
            },
            {
              name: 'heroDescription',
              label: 'Wprowadzenie',
              type: 'textarea',
              defaultValue:
                'Projektowanie i druk 3D dla Twojego pomysłu. Od pojedynczej części po gotowy produkt — porozmawiajmy o tym, czego potrzebujesz.',
            },
            {
              name: 'heroImage',
              label: 'Prawdziwe zdjęcie wydruku',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heroMaterial',
              label: 'Materiał na zdjęciu',
              type: 'text',
            },
            {
              name: 'heroLayer',
              label: 'Warstwa na zdjęciu',
              type: 'text',
            },
          ],
        },
        {
          label: 'Pracownia',
          fields: [
            {
              name: 'aboutTitle',
              label: 'Nagłówek',
              type: 'text',
              defaultValue: 'Za każdym wydrukiem stoi człowiek.',
            },
            {
              name: 'aboutText',
              label: 'Opis doświadczenia',
              type: 'textarea',
            },
            {
              name: 'ownerImage',
              label: 'Zdjęcie właściciela',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'workshopImages',
              label: 'Zdjęcia pracowni i drukarek',
              type: 'array',
              fields: [{ ...imageField, required: true }],
            },
          ],
        },
        {
          label: 'Kontakt i profile',
          fields: [
            ...(['phone', 'email', 'hours', 'area', 'address', 'sellerName', 'nip'].map(
              (name): Field =>
                ({
                  name,
                  label: ({
                    phone: 'Telefon',
                    email: 'E-mail',
                    hours: 'Godziny dostępności',
                    area: 'Obszar obsługi',
                    address: 'Adres do odwiedzin',
                    sellerName: 'Pełna nazwa sprzedawcy',
                    nip: 'NIP',
                  } as Record<string, string>)[name],
                  type: name === 'email' ? 'email' : 'text',
                } as Field)
            )),
            {
              name: 'pickupEnabled',
              label: 'Umożliwiaj odbiór osobisty',
              type: 'checkbox',
            },
            {
              name: 'instagram',
              label: 'Adres profilu Instagram (https://...)',
              type: 'text',
              validate: (v: unknown) =>
                !v ||
                (typeof v === 'string' && /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(v)) ||
                'Wpisz poprawny adres profilu Instagram.',
            },
            {
              name: 'facebook',
              label: 'Adres strony Facebook (https://...)',
              type: 'text',
              validate: (v: unknown) =>
                !v ||
                (typeof v === 'string' && /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_./-]+$/.test(v)) ||
                'Wpisz poprawny adres Facebook.',
            },
          ],
        },
        {
          label: 'Dokumenty i publikacja',
          fields: [
            {
              name: 'privacyText',
              label: 'Polityka prywatności',
              type: 'textarea',
            },
            {
              name: 'termsText',
              label: 'Zasady zamówień',
              type: 'textarea',
            },
            {
              name: 'cookiesText',
              label: 'Informacje o cookies',
              type: 'textarea',
            },
            {
              name: 'launchReady',
              label: 'Dane i dokumenty sprawdzone — gotowe do publikacji',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}
