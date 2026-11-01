import type { z } from 'zod'
import type { inquirySchema } from './rules'

export function inquiryMessages(data: z.infer<typeof inquirySchema>, number: string) {
  const messages = [{
    to: data.email,
    subject: `Solid Print — zapytanie ${number}`,
    text: `Cześć ${data.name},\n\nDziękujemy za wiadomość. Twoje zapytanie ma numer ${number}.\nSprawdzimy szczegóły i skontaktujemy się z Tobą w sprawie ceny i terminu.\nPrzesłanie zapytania nie jest płatnym zamówieniem.\n\nSolid Print`,
  }]
  if (process.env.OWNER_EMAIL) messages.push({
    to: process.env.OWNER_EMAIL,
    subject: `Nowe zapytanie ${number}`,
    text: `W panelu pojawiło się nowe zapytanie.\nNumer: ${number}\nOtwórz: ${process.env.NEXT_PUBLIC_SERVER_URL}/admin/collections/inquiries\n\nZałączniki dostępne są po zalogowaniu i pozytywnym wyniku skanowania.`,
  })
  return messages
}
