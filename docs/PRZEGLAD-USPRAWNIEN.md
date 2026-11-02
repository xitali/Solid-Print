# Kontrola planu usprawnień — 02.11.2026

Źródło wymagań: `C:\Users\emanu\Downloads\PLAN-USPRAWNIEN.md` i decyzje właściciela w czacie. Fragmenty kodu w załączniku są propozycjami, a nie dowodem wykonania.

## Decyzje

- Produkcja: Cloudflare Free, D1 i R2; PostgreSQL tylko lokalnie / w testach.
- Paleta: najnowszy kod — papier, grafit, pomarańcz. Starsze palety w dokumentach są historyczne.
- Potwierdzone pole robocze drukarki: X 340 mm, Y 320 mm, Z (wysokość) 325 mm. Wazon to ilustracja, nie model o potwierdzonych wymiarach.
- Zoho w przyszłości: kolejka musi działać bez wpisanych w kodzie adresów; brak konfiguracji nie może udawać dostarczenia wiadomości.
- Prywatny skaner ClamAV na serwerze właściciela. Brak odpowiedzi / skanu utrzymuje kwarantannę. Dostęp do serwera wymaga adresu i sposobu logowania.
- Ostrzeżenie w panelu przy wykorzystaniu >=75%; brak pomiaru oznacza „brak danych”, nigdy 0%.
- Numeracja losowa SP-ROK-XXXXXXXX: bez ujawniania liczby klientów, zgodna z dotychczasowymi potwierdzeniami; kolizje wymagają ponowienia.
- Zakres animacji E1–E13; stan końcowy czytelny bez JS i przy ograniczonym ruchu.

## Plan kontroli i napraw

- [x] Odczytać cały plan i porównać commit b5a5f9a z kodem.
- [x] Uruchomić bazowe typy i testy: 14 testów OK, 4 integracyjne pominięte.
- [x] Naprawić zapis D1 i powiadomienia; test transakcji na rzeczywistym SQLite.
- [x] Naprawić walidację i kontrolę limitów, zapewnić zgodność pól CMS ze schematem D1.
- [x] Dodać ograniczone porcje retencji, prywatny skaner i adapter przyszłej poczty; aktywować harmonogramy.
- [x] Panel: stan usług, ostrzeżenie 75%, czytelne błędy zamiast fałszywych zer.
- [x] Hero, podgląd 3D i efekty procesu; obsługa ograniczonego ruchu.
- [x] Uruchomić typy, testy, generowanie typów, build Cloudflare i kontrolę w przeglądarce.
- [x] Uzupełnić macierz z dowodami oraz ograniczeniami. Częściowe punkty poniżej nie są oznaczone jako skończone.

## Ustalenia wstępne

Commit b5a5f9a realizuje część A1–A8, B1/B2/B9, C3/C5/C7 i E1–E6/E9. Nie realizuje całego planu. Zielone dotychczasowe testy nie obejmują nowego D1 outbox, animacji ani infrastruktury produkcyjnej.

Potwierdzone błędy: adres właściciela zakodowany w D1; różne formaty dat outbox; nieużywana normalizacja telefonu; NIP z zerami akceptowany; slug wymagany przed generowaniem; pozorne zera dashboardu przy awarii; podgląd 3D renderowany stale; wyciek zasobów tafli skanera; brak bezpiecznego cyklu zadań Cloudflare.

## Wykonana weryfikacja

- Lokalne testy obejmują rzeczywistą bazę PostgreSQL oraz transakcje SQLite, kwarantannę, atomową rezerwację miejsca i zgodność pól CMS z migracjami D1.
- GitHub Actions dla `d427278`: oba zadania `check` i `integration` zakończone sukcesem, run `41490300287`. Chromium: formularz i katalog, axe: brak naruszeń w kontrolowanych widokach.
- Końcowy commit kodu `dd2871e`: GitHub Actions `41491889826` zakończone sukcesem. Lokalnie przeszły wszystkie 33 testy, w tym 4 integracyjne z PostgreSQL.
- Wdrożona wersja Cloudflare: `cf34ff94-a24e-4493-99bd-080293cd508b`. Po wdrożeniu baza potwierdziła wykonanie retencji (`cleanup: ok`, 02.11.2026 17:35:51 UTC) oraz połączenie skanera (17:34:15 UTC). To kontrola działania w tej chwili, nie stały monitoring dostępności.
- Lighthouse CI, po 3 próby: mediana LCP strony głównej 2,714 s, katalogu 2,865 s; CLS 0,0004–0,0009; TBT 54–188 ms; około 427–433 KB transferu. To pomiar lokalnego serwera produkcyjnego w CI z pustym katalogiem, nie fizycznego telefonu ani publicznej domeny z przyszłymi zdjęciami.
- Usunięto błędny wspólny fallback ładowania powodujący CLS około 0,717; mała drukarka pozostaje loaderem modelu. Nagłówek LCP jest widoczny od pierwszego renderowania.
- Cloudflare: migracje 0002/0003 zastosowane po prywatnej kopii. Odtworzenie SQL w pustym SQLite: integralność OK, brak błędów kluczy obcych. Osobno sprawdzono zachowanie transakcji przy błędzie kolejki.
- Proxmox: osobny nieuprzywilejowany kontener 103 `solidprint-scan`, 1 CPU, 2 GB RAM, 8 GB dysku; bez zmian istniejących VM i kamer. ClamAV ma aktualne sygnatury i skanuje lokalnie. Konto skanera nie ma publicznego portu do API modeli.
- Rzeczywisty test ClamAV: czysty plik OK, EICAR wykryty, czysty plik 32 MiB OK. Pełny test Cloudflare → R2 → prywatny skaner → D1: załączniki QA 3/4 otrzymały odpowiednio `clean` i `infected`.
- Workers Analytics, próbka od 02.11 17:10 UTC: 47 żądań, 0 błędów; CPU p50 16,115 ms, p99 1075,413 ms, łącznie z zimnymi startami i różnymi trasami. Wartości API są w mikrosekundach. Nie jest to dowód zapasu CPU dla każdej trasy ani test obciążenia; Free nie gwarantuje stałego czasu odpowiedzi i nadal wymaga cache oraz kontroli ruchu.

## Macierz względem załącznika

| Punkty | Stan po przeglądzie |
|---|---|
| A1–A7 | Wdrożone: lista, podsumowanie, etykiety, filtry, liczniki, grupy i generowanie slug w formularzu oraz na serwerze. |
| A8 | Zakładki, podgląd produktu i miniatura w kolumnie listy dodane. |
| A9–A11 | Czytelna kopia produktu, historia statusów/notatek, chroniony eksport i anonimizacja. Historia sprzed wdrożenia nie jest wymyślana. |
| A12 | Polski select w panelu z zachowaniem istniejących pól tekstowych; celowo bez konwersji enum PostgreSQL. |
| B1–B2 | Naprawione warunkowe noindex i hero; wymiary potwierdzone przez właściciela. |
| B3 | Dotychczasowy anonimowy cache HTML 60 s. Pełne statyczne generowanie i unieważnianie po zapisie CMS nadal niewykonane. |
| B4 | Wymiary i asynchroniczne dekodowanie głównej karty produktu dodane; pełny srcset i automatyczne miniatury Cloudflare nadal do wykonania. |
| B5 | Tokeny aktualnej palety w osobnym pliku, usunięte pozostałości niebieskiego z głównej ilustracji; część kolorów SVG i statusów pozostaje celowo lokalna. |
| B6 | LocalBusiness tylko z podaną nazwą właściciela, Product bez wymyślonej ceny, FAQPage, canonical i Open Graph produktu. Bez zewnętrznego testu Rich Results. |
| B7–B8 | Dotychczasowa podstawowa CSP oraz ochrona Origin, honeypot i rate limit pozostają. Pełna CSP z nonce i Turnstile nie zostały jeszcze wdrożone. |
| B9–B11 | Normalizacja telefonu/NIP, walidacja NIP, ograniczone importy fontów i stabilny nagłówek; osobny preload fontu nie został dodany. Wyniki LCP/CLS powyżej. |
| C0–C3 | Cloudflare jako produkcja, skaner działa; atomowy D1 outbox używa konfiguracji zamiast prywatnego adresu. Adapter HTTP poczty ma retry; rzeczywisty dostawca czeka na przyszłe Zoho. Numer losowy pozostaje zgodny ze starszymi zgłoszeniami; kolizja numeru jest ponawiana do 3 prób, bez ponawiania innych błędów. |
| C4 | Retencja jest w Workerze i harmonogram aktywny; prywatna kopia przed migracją odtworzona testowo. Niezależna automatyczna kopia D1 i obiektów R2 z pełnym testem odtworzenia nadal nie jest gotowa. |
| C5–C6 | Wersje Payload przypięte, Dependabot grupuje pakiety; brak dodatkowego wiersza rate-limits przy każdym żądaniu Cloudflare. |
| C7–C9 | Pełne próbkowanie logów, stan skanera i retencji w panelu, liczby CPU z Analytics; zewnętrzne alerty 5xx i ciągły monitoring /health jeszcze nie są skonfigurowane. Identyfikatory infrastruktury pozostają jawnie w konfiguracji — nie są sekretami. |
| D1–D3 | ESLint/Prettier dostępne, lint i typy w CI, testy integracyjne, kontrola generowanych typów; konfiguracja rozbita na kolekcje i adapter platformy. |
| D4–D5 | Wydzielono przesyłanie i potwierdzenie formularza; podstrony rozbite na 10 modułów. Formularz nadal jest duży i można dalej wydzielić pola. |
| D6–D8 | CI Chromium/axe/Lighthouse, krótkie README, instrukcje panelu i migracji, test porównujący kolumny D1 z polami CMS. Test nie sprawdza wszystkich indeksów i relacji tablicowych. |
| E1–E6 | Chłodzenie warstw, ruch przez ref, pauza poza ekranem, odsłanianie zdjęć, pasek przewijania, kroki przycisków, skan modelu, render na żądanie i zwalnianie zasobów. |
| E7–E13 | Efekt linii procesu, potwierdzenie wydrukiem, 404, loader modelu, tło za wskaźnikiem, View Transitions i spokojne wejścia panelu. Przeglądarki bez wsparcia zachowują zwykłą nawigację. Brak testu na fizycznym starszym Androidzie. |

Plan Gemini był częściowo wykonany; ten przegląd nie uznaje niewykonanych pozycji za gotowe. Do obsługi prawdziwych klientów kluczowe są jeszcze: poczta, niezależne kopie, pełniejszy monitoring, dane i dokumenty właściciela oraz sprawdzenie zużycia przy faktycznej ofercie i ruchu.
