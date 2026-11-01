import { SectionLabel } from '@/components/Brand'
import { ContactForm } from '@/components/ContactForm'
import { PageIntro } from '@/components/UI'
import { ArrowUpRight,Instagram } from 'lucide-react'
import Link from 'next/link'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Contact({settings:s}:SectionProps){

    return (
      <>
        <PageIntro
          label="DOBRE RZECZY ZACZYNAJĄ SIĘ OD ROZMOWY"
          title="Porozmawiajmy o Twoim pomyśle."
          description="Masz pytanie, szkic albo konkretny projekt? Napisz do pracowni. Wspólnie ustalimy następny krok."
        />
        <div className="container page-content two-column">
          <div>
            <SectionLabel>KONTAKT Z PRACOWNIĄ</SectionLabel>
            <div className="contact-page-list">
              {s.phone && (
                <div>
                  <span className="mono">TELEFON</span>
                  <a href={`tel:${s.phone}`}>{s.phone}</a>
                </div>
              )}
              {s.email && (
                <div>
                  <span className="mono">E-MAIL</span>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </div>
              )}
              {!s.phone && !s.email && (
                <div className="notice">
                  Bezpośrednie dane kontaktowe zostaną uzupełnione przed publikacją strony. Wersja lokalna umożliwia
                  przetestowanie formularza.
                </div>
              )}
              {s.hours && (
                <div>
                  <span className="mono">GODZINY KONTAKTU</span>
                  <p>{s.hours}</p>
                </div>
              )}
              {s.area && (
                <div>
                  <span className="mono">OBSZAR OBSŁUGI</span>
                  <p>{s.area}</p>
                </div>
              )}
              {s.pickupEnabled && s.address && (
                <div>
                  <span className="mono">ODBIÓR PO UZGODNIENIU</span>
                  <p>{s.address}</p>
                </div>
              )}
            </div>

            <div className="contact-page-social">
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noreferrer" className="text-link">
                  <Instagram size={20} /> Instagram <ArrowUpRight size={17} />
                </a>
              )}
              {s.facebook && (
                <a className="text-link" href={s.facebook} target="_blank" rel="noreferrer">
                  Facebook <ArrowUpRight size={17} />
                </a>
              )}
            </div>

            <div className="notice">
              Masz plik do wydruku?{' '}
              <Link href="/wycena" className="text-link">
                Przejdź do wyceny z załącznikami <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="contact-form-card">
            <ContactForm />
          </div>
        </div>
      </>
    )
  
}
