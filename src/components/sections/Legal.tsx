import { PageIntro,Paragraphs } from '@/components/UI'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Legal({section,settings:s,title}:SectionProps){
const text = section === 'prywatnosc' ? s.privacyText : section === 'zasady-zamowien' ? s.termsText : s.cookiesText
return (
    <>
      <PageIntro label="DOKUMENTY I ZASADY" title={title} />
      <div className="container page-content">
        <div className="prose">
          {section==='prywatnosc'&&<p>Załączniki do zapytań są przechowywane w prywatnym magazynie Cloudflare R2. W celu sprawdzenia bezpieczeństwa pobiera je automatyczny skaner ClamAV na prywatnym serwerze właściciela. Pliki nie są przekazywane do publicznych serwisów skanujących; kopia robocza jest usuwana po skanowaniu, również po błędzie. Do czasu pozytywnego wyniku załącznik pozostaje niedostępny do pobrania w panelu.</p>}
          {text ? (
            <Paragraphs text={text} />
          ) : (
            <>
              {section === 'prywatnosc' && <section>
                <h2>Dane z formularzy</h2>
                <p>Informacje podane w formularzu wykorzystujemy do odpowiedzi, uzgodnienia szczegółów i przygotowania wyceny. W sprawie przesłanych danych możesz skorzystać z <a href="/kontakt">formularza kontaktowego</a>.</p>
              </section>}
              {section === 'cookies' && (
                <section><h2>Logowanie i szkic wyceny</h2><p>Panel właściciela używa pliku cookie do utrzymania sesji. Formularz może zapisać szkic w pamięci karty przeglądarki, aby ułatwić powrót po odświeżeniu. Pliki z modelami trzeba wtedy wybrać ponownie.</p></section>
              )}
              {section === 'zasady-zamowien' && (
                <section><h2>Od zapytania do wyceny</h2><p>
                  Formularze służą do składania zapytań. Cenę, zakres i termin wykonania potwierdza właściciel po
                  sprawdzeniu projektu. Wysłanie formularza nie jest złożeniem płatnego zamówienia.
                </p></section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
