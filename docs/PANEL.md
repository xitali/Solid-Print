# Obsługa panelu

Otwórz `/admin`. Produkcja wymaga bramki HTTPS i logowania właściciela; dane dostępu są zapisane prywatnie, poza repozytorium.

1. **Zapytania**: numer, typ i kolorowy status, klient, liczba sztuk i data. Wyszukiwanie obejmuje e-mail, firmę i opis. Kliknięcie numeru otwiera szczegóły.
2. **Szczegóły**: status i numer są w kolumnie bocznej. Zakładki rozdzielają opis, klienta, załączniki, notatki i kopię danych produktu. E-mail i telefon w podsumowaniu są klikalne.
3. **Notatki**: zapis zmiany statusu lub notatki dopisuje zdarzenie z datą. Historia wcześniejszych zmian sprzed wdrożenia nie jest odtwarzana ani wymyślana.
4. **Pliki**: wyłącznie stan „Bezpieczny” pozwala pobierać. Kwarantanna i wykryte zagrożenie blokują dostęp. Niedostępny skaner nie oznacza czystego pliku.
5. **Dane klienta**: w zakładce Klient można eksportować JSON albo usunąć dane osobowe, opis, notatki, pocztę i załączniki. Usuwanie wymaga potwierdzenia, zachowuje numer i zamyka sprawę. Starsze kopie mogą zawierać poprzednie dane do końca okresu przechowywania.
6. **Gotowe projekty**: nazwa generuje adres strony automatycznie. Ręcznie ustawiony adres jest zachowywany. Zakładki: Podstawy, Parametry, Warianty, Galeria. „Opublikowane” decyduje o widoczności; „Przyjmuj zapytania” o dostępności. Podgląd pokazuje tylko opublikowany produkt.
7. **Ustawienia strony**: prawdziwy kontakt, sprzedawca, godziny, dokumenty i profile. Puste profile społecznościowe są ukrywane. Materiał i warstwa w hero pojawiają się tylko po ich podaniu.
8. **Panel pracowni** pokazuje ostatnie zapytania i oznacza nowe sprawy starsze niż 24 godziny. W szczegółach można zmienić status, zapisać go standardowym przyciskiem i przygotować odpowiedź do skopiowania lub otwarcia w poczcie. „Stan systemu” pokazuje rezerwacje miejsca i ostrzeżenia od 75%, stan skanera i retencji. Dane R2 dotyczą tej witryny, a limity rozliczeniowe obejmują całe konto.
9. **Kolejka poczty**: bez dostawcy wiadomości czekają. Konfiguracja HTTP przewiduje ponawianie do 8 prób; nie oznacza podłączenia Zoho. Nie ustawiaj ręcznie „wysłano”, jeśli wiadomość nie została dostarczona.
10. **Materiały, usługi i realizacje** mają podgląd karty przed zapisem. Po zmianie zdjęcia realizacji poczekaj na gotową miniaturę i zapisz formularz. W starszej realizacji użyj przycisku „Przygotuj miniaturę”. Gdy przeglądarka zgłosi błąd przygotowania, możesz zapisać zdjęcie i wrócić do tej czynności później.

Skaner jest w kontenerze `solidprint-scan` (103) na serwerze właściciela. Pobiera jedno oczekujące zadanie co około dwie minuty; nie wymaga publicznego portu. Utrata połączenia przez ponad 10 minut powoduje ostrzeżenie w panelu.
