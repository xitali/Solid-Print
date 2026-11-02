# Solid Print

Strona i panel pracowni druku 3D. Produkcja: **Cloudflare Workers Free + D1 + prywatny R2**. PostgreSQL i lokalny SMTP służą do rozwoju i testów.

- [Strona testowa](https://solidprint.emanuelwloch.pl/)
- [Panel właściciela](https://solidprint.emanuelwloch.pl/admin)
- [Stan przeglądu i pozostałe ograniczenia](docs/PRZEGLAD-USPRAWNIEN.md)
- [Instrukcja panelu](docs/PANEL.md)
- [Wdrożenie i migracje](docs/DEPLOY.md)
- [Konfiguracja Cloudflare i koszty](docs/CLOUDFLARE.md)
- [Uruchamianie lokalne](docs/LOKALNIE.md)

Wymagany Node.js 24.22.1+. Projekt zawiera lokalną wersję Node uruchamianą przez npm.

```powershell
npm ci
npm run local:services
# W drugim terminalu:
npm run dev
```

```powershell
npm run lint
npm run typecheck
npm test
npm run cloud:build
```

Przy działających usługach lokalnych: `$env:RUN_INTEGRATION='true'; npm test`.
CI sprawdza również formularz w Chromium, dostępność axe i budżety Lighthouse.

Paleta: papier, grafit i pomarańcz. Pole robocze drukarki: **340 × 320 × 325 mm** (ostatni wymiar to wysokość). Ilustracja wazonu nie potwierdza wymiarów modelu ani parametrów materiału.

Pliki pozostają w kwarantannie do pozytywnego wyniku ClamAV. Skaner działa na prywatnym serwerze właściciela; awaria skanera nie zwalnia plików. Poczta automatyczna czeka na konfigurację dostawcy.

Wersja testowa pozostaje wyłączona z indeksowania. Dane sprzedawcy, kontakt, dokumenty oraz prawdziwe produkty i zdjęcia trzeba uzupełnić przed przyjmowaniem rzeczywistych zleceń.

Kod nie jest udostępniany na licencji open source. Prawa do zależności i zapożyczonych efektów: `THIRD_PARTY_NOTICES.md`. Sekrety, bazy, kopie i pliki klientów są wykluczone z Git.
