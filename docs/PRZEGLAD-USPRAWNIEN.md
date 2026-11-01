# Kontrola planu usprawnień — 01.11.2026

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
- [ ] Naprawić zapis D1 i powiadomienia; test transakcji na rzeczywistym SQLite.
- [ ] Naprawić walidację i kontrolę limitów, zapewnić zgodność schematów.
- [ ] Dodać zadania Cloudflare: retencja, prywatne skanowanie i gotowość poczty.
- [ ] Panel: stan usług, ostrzeżenie 75%, czytelne błędy zamiast fałszywych zer.
- [ ] Hero, podgląd 3D i pozostałe animacje; poprawna obsługa ograniczonego ruchu.
- [ ] SEO, obrazy, style, CI i instrukcje właściciela.
- [ ] Uruchomić typy, testy, generowanie typów, build Cloudflare i kontrolę w przeglądarce.
- [ ] Uzupełnić poniżej macierz A1–E13 z dowodami oraz ograniczeniami.

## Ustalenia wstępne

Commit b5a5f9a realizuje część A1–A8, B1/B2/B9, C3/C5/C7 i E1–E6/E9. Nie realizuje całego planu. Zielone dotychczasowe testy nie obejmują nowego D1 outbox, animacji ani infrastruktury produkcyjnej.

Potwierdzone błędy: adres właściciela zakodowany w D1; różne formaty dat outbox; nieużywana normalizacja telefonu; NIP z zerami akceptowany; slug wymagany przed generowaniem; pozorne zera dashboardu przy awarii; podgląd 3D renderowany stale; wyciek zasobów tafli skanera; brak bezpiecznego cyklu zadań Cloudflare.
