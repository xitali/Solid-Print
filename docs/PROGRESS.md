# Solid Print — wykonanie planu v2

Źródło: plan użytkownika z 31.10.2026, skopiowany do docs/PLAN.md.

## Zadania
- [x] 1. Podstawa Next.js, Payload, PostgreSQL i lokalne usługi.
- [x] 2. System wizualny i wszystkie publiczne podstrony.
- [x] 3. Katalog, CMS, wyszukiwarka i panel właściciela.
- [x] 4. Zapytania, prywatne pliki, podgląd, skanowanie i poczta.
- [x] 5. Kopie, retencja, testy i dokumentacja wdrożenia.

## Decyzje wykonawcze
- Pusty katalog nie jest istniejącym repozytorium: praca w D:\Solid Print na nowej gałęzi implementacyjnej; brak cudzych zmian do izolacji.
- Brak zdjęć i danych właściciela: używamy wyraźnie opisanych schematów technicznych zamiast zmyślonych realizacji; produkty, opinie i parametry pozostają puste. Publikację blokuje kontrola gotowości treści.
- Wdrożenie według planu: aplikacja Docker z PostgreSQL i S3; lokalna wersja przedprodukcyjna bez zakupu hostingu i bez publikowania nieuzupełnionych danych.
- Pre-flight: formularz → sesja plików → prywatne załączniki → zapytanie → kolejka pocztowa. Dostęp do załączników jest niezależny od publicznego CMS.

## Dowody i przegląd końcowy
- Pełna kontrola: docs/QA.md; raporty i zrzuty: artifacts/.
- Suite: 16/16 testów z RUN_INTEGRATION=true na rzeczywistym serwerze i PostgreSQL; TypeScript i build przechodzą.
- Podgląd STL/OBJ/GLB, trzy ścieżki zapytań, panel i edycja produktu sprawdzone w przeglądarce.
- Responsywność: 7 szerokości strony głównej + 42 widoki podstron, brak poziomego przepełnienia.
- Kopia odtworzona do odrębnej bazy: zgodne wartości rekordów, relacje, odzyskane logowanie i sumy kontrolne odzyskanych plików.
- Migracja początkowa i uzupełniająca działają na świeżej bazie.
- Final review: niezależny recenzent, jedna runda; poprawki wykonane i sprawdzone bez ponownego przeglądu.
- Final: fixed równoległe uploady — test odtworzył 3 zapisy i po atomowym przejęciu dopuszcza 1; wynik skanu związany z SHA-256.
- Final: fixed retencja — test 105 spraw potwierdza obsługę rekordów poza pierwszą stroną.
- Final: fixed wygaśnięcie sesji i zmiana plików — qa-recovery potwierdza odnowienie, zachowanie danych i brak duplikatu.
- Final: fixed odtwarzanie S3 — kontrola odrębnego pustego bucketu, MIME i sum odzyskanych bajtów; test automatyczny lokalny.
- Final: fixed produkcyjne robots.txt i ustawienia SMTP — robots dynamiczne, brak wymuszenia Mailpit w Compose.
- Final: fixed odnośniki pobierania — autoryzacja właściciela i podpis ważny 5 minut, test poprawności/wygaśnięcia/powiązania z plikiem.
- Final: minor (deferred): ostrzeżenie metadataBase dla automatycznej strony 404; poprawne metadane głównych stron, bez wpływu na funkcje.
- Ruling: ekran błędnego adresu zachowuje standardowe strumieniowanie Next.js (HTTP 200 + ekran 404 i noindex, gdy nagłówki już wysłano). Test sprawdza treść i noindex zamiast wymuszać kod sprzeczny z udokumentowanym zachowaniem; koszt: monitor wyłącznie statusowy może uznać taki adres za istniejący.

## Pozostaje przed publicznym uruchomieniem
Prawdziwe dane właściciela, fotografie, produkty, materiały, dokumenty i Instagram; domena/HTTPS, produkcyjny SMTP i S3; uruchomienie i test rzeczywistego ClamAV; kontrola na fizycznych telefonach. Braki są jawne w README i verify:release. Nic nie opublikowano i nie zakupiono usług.
