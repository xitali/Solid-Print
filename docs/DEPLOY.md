# Wdrożenie Cloudflare

Cel produkcyjny to Cloudflare, bez Workers Paid. PostgreSQL, lokalny magazyn i testowy SMTP nie są produkcyjną infrastrukturą tej strony.

## Kolejność

1. `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`.
2. `npm run generate:types` i `npm run payload -- generate:importmap`; przejrzyj różnice.
3. Wykonaj prywatny eksport bazy: `npx wrangler d1 export solid-print-test --remote --output .data/backups/przed-zmiana.sql`.
4. `npx wrangler d1 migrations apply solid-print-test --remote`.
5. `npm run cloud:build`, następnie `npx wrangler deploy`.
6. Sprawdź stronę, bramkę `/admin`, formularz i stan usług. Sam build nie jest dowodem działania usług produkcyjnych.

Harmonogram co 5 minut uruchamia ograniczoną porcję retencji i kolejkę poczty. Pierwsza aktywacja Cron wymaga technicznej subdomeny konta `workers.dev`; publiczna trasa witryny pozostaje własną domeną. Zmiany harmonogramów mogą propagować się kilkanaście minut.

## Źródła schematów

- `migrations-d1/*.sql`: źródło prawdy do wdrażania D1 przez Wrangler, w kolejności numerów.
- `src/migrations-d1/`: początkowy schemat wygenerowany przez Payload; materiał do porównania, nie drugi niezależny proces wdrożeniowy. Nie uruchamiaj obu ścieżek na tej samej bazie.
- `src/migrations/`: migracje PostgreSQL dla środowiska lokalnego. Nie wolno ich stosować na D1.
- `sp_system_state`, `sp_storage_budget` i triggery budżetu są własnością Workera, poza schematem Payload. `ALLOW_SCHEMA_PUSH=false` w Cloudflare musi pozostać wyłączone.
- Test `tests/d1-schema.test.ts` porównuje przechowywane pola CMS z rzeczywistą bazą SQLite z wszystkich migracji. Testy D1 sprawdzają zapis i wycofanie transakcji.

## Skaner

Pliki `server/` instaluje się wyłącznie wewnątrz dedykowanego kontenera. Nie instaluj usług aplikacji bezpośrednio na hoście Proxmox. `SCANNER_TOKEN` znajduje się w Workers Secrets i prywatnym `/etc/solidprint-scanner.env`, nigdy w Git. ClamAV musi mieć aktualne sygnatury, limit strumienia powyżej maksymalnego pliku oraz `AlertExceedsMax yes`.

## Odtwarzanie

D1 Free zapewnia krótsze okno Time Travel niż plan płatny. Przed operacją sprawdź aktualne limity w dokumentacji. Dodatkowy eksport SQL odtwarzaj najpierw do pustej bazy testowej, z weryfikacją integralności, relacji i liczby rekordów. Dla eksportu Wrangler w zwykłym SQLite wyłącz kontrolę kluczy obcych na czas importu, potem włącz i uruchom `foreign_key_check`.

Eksport bazy nie zastępuje kopii obiektów R2. Automatyczna niezależna kopia D1 i R2 z odtwarzaniem całego zestawu nadal wymaga dokończenia; nie opisujemy jej jako działającej.

Źródła: [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
