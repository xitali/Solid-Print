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
              <div className="notice">
                Dokument do uzupełnienia przez właściciela przed publikacją strony. Ta lokalna wersja służy do testów.
              </div>
              {section === 'cookies' && (
                <p>
                  Strona nie korzysta z narzędzi reklamowych ani analitycznych. Panel właściciela używa niezbędnego pliku
                  cookies do logowania. Modele w podglądzie są przetwarzane lokalnie i przesyłane dopiero po wysłaniu
                  zapytania.
                </p>
              )}
              {section === 'zasady-zamowien' && (
                <p>
                  Formularze służą do składania zapytań. Cenę, zakres i termin wykonania potwierdza właściciel po
                  sprawdzeniu projektu. Wysłanie formularza nie jest złożeniem płatnego zamówienia.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
