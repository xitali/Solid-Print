# Cloudflare — wersja testowa

Adres docelowy: https://solidprint.emanuelwloch.pl
Repozytorium: https://github.com/xitali/Solid-Print

## Architektura

Next.js + Payload na Workers przez OpenNext. D1 przechowuje treści, zapytania i sesje. Osobne prywatne buckety R2 przechowują zdjęcia oraz pliki klientów. PostgreSQL i usługi lokalne pozostają do rozwoju; skrypty PostgreSQL nie są narzędziami kopii D1. Nie udostępniamy publicznych adresów R2.

## Bezpieczeństwo

- Panel i prywatne API są objęte dodatkowym logowaniem Basic przez HTTPS, również przed utworzeniem pierwszego właściciela. Potem obowiązuje także logowanie Payload.
- Dane bramki są wyłącznie w lokalnym, ignorowanym pliku .data/admin-access.txt. PAYLOAD_SECRET i hasło bramki trafiają do Workers Secrets.
- Formularze sprawdzają Origin, walidację danych, losowy token sesji, jednorazowy identyfikator zapytania i limity prób. Dodatkowy limit na brzegu poprzedza uruchomienie CMS.
- D1 zapisuje komplet zapytania i relacji w atomowym batchu; indeksy unikalne zapobiegają powielaniu zapytań. Przesłanie pliku jest przejmowane przez pojedyncze żądanie.
- Cache HTML działa przez 60 sekund tylko dla publicznych, anonimowych stron bez parametrów. Panel, API, cookies, autoryzacja i RSC omijają cache.
- Wersja testowa ma noindex; nagłówki ograniczają osadzanie strony, uprawnienia przeglądarki i sniffing typów plików.

## Koszty i granice

Workers Free i D1 mają limity; po ich wykorzystaniu aplikacja może przestać obsługiwać żądania. Nie przełączamy konta na Workers Paid. R2 ma bezpłatny przydział, ale po jego przekroczeniu nalicza opłaty — nie ma gwarancji bezwarunkowego kosztu 0 zł. Należy monitorować użycie w panelu.

Źródła: https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.cloudflare.com/d1/platform/pricing/ ; https://developers.cloudflare.com/r2/pricing/

## Uruchamianie zmian

Wymagany Node 24.22.1+. Po npm ci: npm test, npm run cloud:build, npx wrangler d1 migrations apply D1 --remote, npm run cloud:deploy. Nie uruchamiać migracji PostgreSQL na D1. Windows używa kontrolowanego zastąpienia symlinków katalogów junctionami podczas budowania; kod aplikacji nie jest tym modyfikowany.

## Do uzupełnienia przed obsługą prawdziwych klientów

- Konto właściciela, dane sprzedawcy i kontaktu, zdjęcia i produkty, dokumenty prywatności oraz zamówień.
- Poczta wychodząca: ta wersja zapisuje zapytania w panelu, ale nie wysyła automatycznych potwierdzeń. Nie loguje tokenów resetowania haseł.
- Skaner załączników: pliki pozostają w kwarantannie i nie mogą być pobierane przez panel bez pozytywnego skanu. Cloudflare WAF nie zastępuje skanowania plików.
- Retencja oraz odtwarzanie kopii D1 i R2: lokalny worker PostgreSQL nie działa w Workers. Zaplanowanie tych procesów i próba odtworzenia są wymagane przed produkcją.
- Monitoring limitów i odrębny przegląd bezpieczeństwa przed produkcją.

Repozytorium zawiera kod i przykładową konfigurację, bez lokalnych baz, sekretów, kopii i danych klientów.
