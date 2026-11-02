> Dokumentacja środowiska lokalnego i wcześniejszego wariantu Docker. Automatyczne kopie i retencja opisane dla workera Node nie są dowodem działania tych usług na Cloudflare. Aktualne granice: [przegląd](PRZEGLAD-USPRAWNIEN.md).

# Solid Print

Strona i panel pracowni projektowania i druku 3D według [planu v2](docs/PLAN.md). Wersja Cloudflare: Next.js, Payload CMS, Workers, D1 i prywatny R2. Lokalnie dostępny jest też PostgreSQL.

Konfiguracja, koszty i ograniczenia wersji testowej: [Cloudflare](docs/CLOUDFLARE.md).

## Otwórz lokalnie

Po zainstalowaniu zależności i zbudowaniu strony można kliknąć **Uruchom.cmd**. Uruchamia lokalną bazę, stronę i worker w tle; adresy oraz logi wypisuje w oknie. Ręczny wariant poniżej.

Wymagany Node.js 24.22.1 lub nowszy z linii 24. Projekt zawiera też lokalną wersję Node uruchamianą przez polecenia npm.

```powershell
npm install
npm run local:services
```

Pierwsze polecenie usług tworzy prywatny `.env` z losowymi hasłami i uruchamia osobną bazę PostgreSQL. W kolejnych dwóch terminalach:

```powershell
npm run dev
```

```powershell
npm run worker
```

- Strona: **http://127.0.0.1:3000**
- Panel: **http://127.0.0.1:3000/admin**
- Lokalna skrzynka: **http://127.0.0.1:3000/admin/collections/outbox** (po zalogowaniu); dostarczone wiadomości są także w `.data/mail/*.eml`.

Kiedy nie ma żadnego właściciela, panel umożliwia utworzenie pierwszego konta. Nie ma publicznej rejestracji kolejnych kont. Utwórz konto przed wystawieniem aplikacji poza komputer.

Lokalna alternatywa dla Dockera wykorzystuje pełny PostgreSQL i przechowywanie plików na dysku. Jest dozwolona wyłącznie przy `LOCAL_DEVELOPMENT=true` oraz adresie `127.0.0.1`. Produkcja korzysta z S3. Nie zmienia to kontroli dostępu ani wymogu skanowania.

## Obsługa panelu

1. **Ustawienia strony** — kontakt, godziny, obszar obsługi, dane sprzedawcy, opis pracowni, dokumenty i profile społecznościowe. Puste profile są ukryte.
2. **Zdjęcia** — dodaj rzeczywiste fotografie i opisy alternatywne. W ustawieniach wybierz zdjęcie główne i zdjęcie właściciela.
3. **Gotowe projekty** — opis, galeria, kategoria, zastosowania, parametry, warianty, cena „od” brutto, dostępność. Zaznacz „Opublikowane”; „Wyróżnij” pokazuje produkt na stronie głównej.
4. **Materiały / Usługi / Realizacje / Poradnik / FAQ** — treści pojawiają się publicznie po publikacji. Adresy wpisuj małymi literami bez polskich znaków, np. `uchwyt-na-narzedzia`.
5. **Zapytania** — dane klienta, kopia produktu z chwili wysłania, załączniki, status i prywatne notatki. Cenę oraz termin uzgadniasz poza stroną.
6. **Prywatne pliki** — pobieranie działa dopiero po wyniku skanowania „Bezpieczny”. Niedostępny skaner zachowuje kwarantannę.
7. **Kolejka pocztowa** — sprawdź wysłane wiadomości i błędy. Worker ponawia wysyłkę maksymalnie 8 razy z rosnącym odstępem. Aby ręcznie ponowić po usunięciu problemu, ustaw stan `pending` i datę następnej próby w przeszłości.

Przy braku zdjęć strona pokazuje podpisany schemat poglądowy. Nie udaje on prawdziwej realizacji. Brakujące produkty, opinie i parametry nie są wymyślane.

## Pliki klientów

24 rozszerzenia modeli z planu, maksymalnie 5 plików po 100 MiB i 250 MiB łącznie. Dodatkowo do 3 plików JPG/PNG/PDF po 10 MiB. Klient wysyła wszystkie pliki dopiero przy „Wyślij zapytanie”.

STL, OBJ i GLB mają lokalny podgląd geometrii, maks. 25 MiB / 500 tys. trójkątów / 12 sekund przetwarzania w osobnym wątku. Pliki z teksturami lub zewnętrznymi zasobami GLB są kierowane do ręcznej oceny. OBJ nie wymaga MTL i pokazuje samą geometrię. Błąd podglądu nie blokuje przesłania. Jednostkę deklaruje klient; podgląd nie potwierdza wymiarów ani ceny.

ClamAV wymaga usługi TCP opisanej w `.env`. **Na tym komputerze Docker nie uruchomił silnika z powodu błędu własnego pliku roboczego. Nie potwierdzono rzeczywistej detekcji przez ClamAV.** Sprawdzono protokół skanowania i zachowanie kwarantanny przy niedostępnym skanerze. Nie stosujemy obejścia zwalniającego pliki bez skanu.

## Testy i kontrola

```powershell
npm test
npm run typecheck
npm run build
```

Przy uruchomionej stronie i usługach:

```powershell
$env:RUN_INTEGRATION='true'
npm test
```

Testy integracyjne tworzą jednoznacznie oznaczone lokalne zapytania QA. Skrypty `scripts/qa-*.ts` sprawdzają panel, pocztę, przykładowe modele i kopie. `qa-cms.ts` tworzy tymczasowe konto i produkt; `qa-cleanup.ts` usuwa wyłącznie oznaczone dane QA. Nie uruchamiaj skryptów QA przeciwko rzeczywistej witrynie.

Raporty i zrzuty z wykonanej kontroli: `artifacts/`. Dane testowe i sekrety: `.data/` i `.env`, wykluczone z Git oraz obrazu Docker.

## Kopie i odtwarzanie

Worker tworzy logiczną kopię treści i danych CMS oraz plików raz na dobę. Zachowuje 30 dni kopii; każda ma manifest, liczby rekordów i sumy SHA-256. Kopia obejmuje również dane uwierzytelniania właścicieli, więc katalog kopii musi być prywatny i chroniony. Ustaw `BACKUP_DIR` na trwały katalog; dodatkowo kopiuj go na niezależny nośnik.

```powershell
npm run backup
npm exec -- tsx scripts/qa-restore.ts
```

Drugi skrypt tworzy odrębną bazę `solidprint_restore_*`, odtwarza dane i porównuje liczby rekordów oraz sumy plików. Nigdy nie nadpisuje działającej bazy.

Ręczne odtworzenie: ustaw `DATABASE_URL` na pustą bazę o nazwie `solidprint_restore_*`, zastosuj migracje (lub w lokalnym teście `ALLOW_SCHEMA_PUSH=true`), następnie `npm exec -- tsx scripts/restore.ts <katalog-kopii>`. W wariancie S3 użyj osobnego pustego bucketu odtworzeniowego. Lokalne pliki są kopiowane do `.data/restored/<nazwa-bazy>/`; przełączenie działającej witryny na odzyskane dane wymaga oddzielnej, kontrolowanej operacji.

Retencja zgłoszeń: pliki 90 dni od zamknięcia/odrzucenia, dane zgłoszenia 365 dni. Kopie wygasają po 30 dniach, więc usunięte dane mogą pozostać w starszej kopii przez ten okres. Osierocone pliki są usuwane po 24 godzinach. Datę zamknięcia zapisuje panel. Właściciel potwierdza te zasady przed publikacją.

## Wdrożenie Docker

1. Przygotuj `.env` na podstawie `.env.example`: mocne losowe hasła, właściwy adres strony, prawdziwa poczta SMTP i prywatny bucket. Nigdy nie używaj lokalnego `.env` jako konfiguracji produkcyjnej.
2. `docker compose up -d postgres minio clamav` — lokalny zestaw infrastruktury. Mailpit jest wyłącznie testową pocztą: `docker compose up -d mailpit`.
3. `docker compose --profile production build`.
4. W `.env` ustaw `ALLOW_SCHEMA_PUSH=false`. Zastosuj migracje: `docker compose --profile production run --rm app node node_modules/payload/bin.js migrate`. Utwórz bucket: `docker compose --profile production run --rm app node --import tsx scripts/setup.ts`.
5. Uruchom aplikację i worker: `docker compose --profile production up -d app worker`. Przed publicznym dostępem utwórz konto właściciela.
6. Umieść aplikację za odwrotnym proxy z HTTPS. Publiczny dostęp kieruj tylko do aplikacji; PostgreSQL, S3, skaner i poczta pozostają prywatne. Proxy ma nadpisywać `X-Forwarded-For`, zachować `Origin`, przekazywać strumień uploadu i umożliwiać minimum 110 MiB na żądanie oraz 5 minut przesyłania. Uruchamiaj **jedną** instancję workera.
7. Uzupełnij dane, zdjęcia, produkty i dokumenty. `npm run verify:release` wylicza brakujące elementy. Włącz `SITE_INDEXABLE=true` dopiero na gotowej publicznej stronie.
8. Na docelowym hostingu sprawdź prawdziwy SMTP, zapis i odczyt S3, ClamAV, odtworzenie kopii oraz telefony. Sam lokalny build nie potwierdza tych usług.

Zmienne aplikacji i workera w Compose nadpisują wyłącznie lokalizacje PostgreSQL, MinIO i ClamAV wewnątrz sieci kontenerów. Ustawienia SMTP pochodzą z `.env`; dla Mailpit użyj hosta `mailpit` i portu `1025`, dla produkcji własnego dostawcy.

## Zakres sprawdzenia tej wersji

Implementacja obejmuje stronę, katalog, formularze, panel, prywatne pliki, podgląd 3D, kolejkę poczty, retencję, kopie i migrację schematu. Testy przeglądarkowe wykonano w lokalnym Chromium i przy zadanych szerokościach ekranu. Nie zastępuje to testów na fizycznym Androidzie i iPhonie ani uruchomienia na docelowym hostingu. Zdjęcia, oferta, kontakt, dokumenty i adres Instagrama wymagają prawdziwych danych właściciela.
