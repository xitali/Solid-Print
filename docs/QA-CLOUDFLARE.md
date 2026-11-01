# Sprawdzenie Cloudflare — 01.11.2026

- npm test: 14 testów zaliczonych, 4 testy integracyjne PostgreSQL celowo pominięte.
- Paczka OpenNext: budowanie i kontrola typów zaliczone.
- Silnik Workers (lokalny workerd, D1 i R2): health 200; formularz tworzy sesję i zapytanie 201; ponowienie zwraca ten sam numer bez duplikatu; załącznik trafia do R2 (200), pozostaje w kwarantannie z SHA-256 długości 64; pobranie bez właściciela 401.
- Bramka przed CMS: prywatne API bez logowania 401, formularz z obcego Origin 403.
- Główna gałąź na GitHubie przeszła początkowe sprawdzanie CI. Aktualizacje Dependabot wymagają osobnego sprawdzenia, w szczególności nowe główne wersje bibliotek.
- W zależnościach po aktualizacji brak zgłoszeń high/critical; pozostają 10 low i 11 moderate. To wynik npm audit, a nie pełny audyt bezpieczeństwa.

Wyniki lokalnego workerd nie są potwierdzeniem wdrożenia ani limitów CPU darmowego planu na serwerach Cloudflare. Testy fizycznych telefonów, dużych plików, skanera AV, dostarczania poczty i odtworzenia kopii pozostają do wykonania.

Przy przeglądzie UI usunięto przepełnienie czterokolumnowej sekcji procesu na telefonach oraz poprawiono kontrast przycisku dodatkowego.
