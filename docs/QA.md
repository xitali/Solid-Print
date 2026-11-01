# Weryfikacja Solid Print — 31.10.2026

## Sprawdzone lokalnie

- Pełny build produkcyjny Next.js i kontrola TypeScript.
- Testy jednostkowe reguł plików, formularzy, filtrów, dostępu, krótkotrwałych odnośników i protokołu skanowania.
- Testy HTTP na rzeczywistym serwerze i PostgreSQL: zapytanie bez pliku, przesyłanie, niekompletny upload, zły token, obce źródło, idempotencja, blokada prywatnych plików.
- Test równoległych PUT najpierw odtworzył błąd: trzy przejęcia tego samego pliku. Po poprawce atomowe przejęcie dopuszcza jeden zapis. Wynik skanu jest związany z SHA-256 konkretnej zawartości.
- Testy sesji: odnowienie po wygaśnięciu, odzyskanie potwierdzenia po utraconej odpowiedzi i ponowne przesłanie wszystkich plików po zmianie zestawu załączników.
- Retencja na 105 sprawach: pliki sprawy poza pierwszą stroną są usuwane, sprawy młodsze niż 365 dni pozostają.
- Poczta trafia do lokalnej skrzynki SMTP; awaria pierwszego wysłania jest ponawiana. Wiadomości nie wychodzą do zewnętrznych odbiorców.
- Kopia odtworzona do osobnej bazy `solidprint_restore_*`: liczby, wartości rekordów, relacje, logowanie odzyskanego konta QA i SHA-256 odzyskanych plików.
- Obie migracje uruchomione na świeżej oddzielnej bazie z wyłączonym automatycznym tworzeniem schematu.
- Przeglądarka Chromium: wszystkie trzy ścieżki zakończone numerem zapytania; rzeczywisty render STL, OBJ i GLB; logowanie do panelu, edycja produktu i widoczność zmiany publicznie.
- Kontrola układu: strona główna i sześć podstron przy 320, 390, 768, 1024, 1440, 1920, 2560 px; bez przewijania w poziomie. Na telefonie menu, stały kontakt i przycisk wyceny.
- Zwalnianie kwarantanny pozostaje zablokowane przy niedostępnym skanerze.
- Konfiguracja Compose sprawdzona bez uruchamiania silnika.
- Końcowa lokalna wersja uruchomiona w trybie produkcyjnym, 19 publicznych punktów aplikacji odpowiada poprawnie. Brakujący adres pokazuje ekran 404 z noindex; przy włączonym strumieniowaniu Next.js może odpowiedzieć statusem 200, zgodnie z dokumentacją frameworka.

Raporty maszynowe i zrzuty są w `artifacts/`, dane testowe w `.data/`. Oba katalogi są wykluczone z Git i obrazu Docker.

## Niezależny przegląd

Jeden niezależny recenzent przejrzał całą implementację. Naprawione: wyścig zapisu pliku, wymuszenie testowego SMTP w Compose, zalegająca retencja, izolacja odtwarzania S3, statyczny robots.txt oraz ponawianie wygasłej sesji. Dodatkowo uzupełniono relacje usług z realizacjami, zastosowania na karcie produktu i krótkotrwałe odnośniki pobierania. Wyniki zmian zweryfikowano testami, bez drugiego przeglądu.

## Granice weryfikacji

- Docker Desktop na tym komputerze ma błąd uruchamiania własnego pliku roboczego. Obraz i usługi Compose nie zostały uruchomione; lokalny test korzysta z prawdziwego przenośnego PostgreSQL, dysku i lokalnego SMTP.
- S3 jest zaimplementowane poprzez SDK i adapter CMS, ale nie sprawdzone z produkcyjnym dostawcą. Odtworzenie S3 wymaga innego, pustego bucketu; automatyczny skrypt QA jest ograniczony do lokalnego magazynu.
- Sprawdzono komunikację protokołu ClamAV na kontrolowanym serwerze testowym, nie rzeczywistą detekcję zagrożeń. Rzeczywisty ClamAV musi zostać uruchomiony i sprawdzony przed publikacją.
- Testy responsywności w Chromium nie są testami na fizycznym Androidzie/iPhonie ani w Safari i Firefox.
- Prawdziwy SMTP, HTTPS, domena, zdjęcia, dane kontaktowe, oferta, dokumenty właściciela oraz Instagram wymagają konfiguracji przed publikacją. `verify:release` poprawnie zgłasza te braki.
- Powiadomienie o braku `metadataBase` w automatycznej stronie 404 Next nie blokuje budowania; właściwe strony publiczne mają ustawiony adres bazowy i metadane.

## Decyzje wykonawcze

- Praca pozostaje lokalnie w nowym repozytorium i gałęzi implementacyjnej; brak publikacji i zakupu usług.
- Brak rzeczywistych zdjęć rozwiązano podpisaną ilustracją techniczną. Nie jest ona zdjęciem wydruku i zostaje zastąpiona przez fotografię po dodaniu jej w panelu.
- Lokalny zamiennik infrastruktury ma ścisłe ograniczenie do adresu 127.0.0.1. Nie osłabia kontroli dostępu ani kwarantanny.
- Odtwarzanie nigdy nie nadpisuje działającej bazy. W trybie S3 wymaga odrębnego pustego bucketu; w trybie lokalnym zapisuje pliki do oddzielnego katalogu.
- Wersja przedprodukcyjna ma wyłączone indeksowanie; robots.txt odczytuje konfigurację przy żądaniu, a nie podczas budowania obrazu.
- Zostawiono strumieniowanie i ekran wczytywania Next.js. Test nie wymusza HTTP 404 po rozpoczęciu strumienia; sprawdza właściwy ekran i zakaz indeksowania brakującej strony.
