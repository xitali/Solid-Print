> Aktualny stan: [przegląd 02.11.2026](PRZEGLAD-USPRAWNIEN.md). Obowiązuje paleta z najnowszego kodu: papier / grafit / pomarańcz. Starsze opisy kolorystyki i wdrożenia poniżej są historyczne.

# Solid Print — plan strony (wersja 2)

Oct 31, 2026 · @Emanuel Włoch

Solid Print wygląda jak pracownia z kartą techniczną: ciepły papier, ciemne pasy, mono-opisy parametrów i zdjęcia realnych wydruków; funkcje i architektura z poprzedniego planu zostają.

## 1. Cel i trzy ścieżki klienta

Polskojęzyczna strona pracowni projektowania i druku 3D dla firm i klientów prywatnych, która prowadzi do jednej z trzech czynności:

- **Mam model** — chcę zamówić wydruk.
- **Mam pomysł** — potrzebuję projektu i wydruku.
- **Wybieram gotowy produkt** — chcę go zamówić.

Model sprzedaży bez zmian: katalog produktów i zapytania, w których cenę i termin potwierdza właściciel. Wersja pierwsza nie ma koszyka, płatności online ani kont klientów, a automatyczną wycenę zastępuje ręczna ocena projektu.

Główny profil społecznościowy to Instagram: krótkie filmy z drukowania, „od projektu do produktu”, zdjęcia detali i zastosowań. Facebook może dojść później.

## 2. RiwoLab: co biorę, a co robię inaczej

Z [riwolab.pl](https://riwolab.pl/) znam strukturę i treść, ale nie widziałem kolorów ani układu graficznego, więc inspiracja dotyczy tylko podejścia, nie wyglądu.

| Element | Co robi RiwoLab | Co robi Solid Print |
| --- | --- | --- |
| Nawigacja | Krótkie menu z kotwicami: Jak to działa, Zastosowania, Realizacje, FAQ | Zostaje krótkie menu, ale dochodzą Gotowe projekty i O pracowni |
| Pierwszy ekran | Jedno hasło i dwa przyciski do wyceny | Hasło, trzy ścieżki klienta i zdjęcie z opisem parametrów |
| Proces | Trzy kroki z listą cech | Cztery stacje: zapytanie, ocena, wykonanie, odbiór |
| Realizacje | Siatka zdjęć z materiałem w podpisie | Układ problem, projekt, efekt z materiałem i wymiarami |
| Zastosowania | Sześć kategorii z jednym zdaniem | Zastosowania połączone z katalogiem i filtrami |
| Zaufanie | Obietnice: wycena w minutę, 2–3 dni | Prawdziwe zdjęcia pracowni i właściciela; terminy tylko po potwierdzeniu |
| Zakup | Automatyczna wycena i płatność online | Zapytanie i ręczna wycena, bez płatności w wersji pierwszej |

Przejmuję zasadę, że strona jest krótka, rzeczowa i szybko prowadzi do wyceny. Reszta wyglądu i układu jest własna.

## 3. Tożsamość wizualna: pracownia z kartą techniczną

Strona ma wyglądać jak dobrze prowadzony warsztat: papierowe tło, ciemne pasy dla rytmu i opisy parametrów w stylu karty technicznej, a nie jak sklep z gadżetami ani laboratorium.

- **Papier i grafit.** Kremowe tło sekcji jasnych na przemian z ciemnymi pasami w głębokim petrolu. Pomarańcz tylko na przyciskach i znacznikach.
- **Karta techniczna.** Wymiary, materiał i warstwa są pisane czcionką monospace w małych etykietach, jak na rysunku technicznym. To rozpoznawalny znak strony i naturalny sposób pokazania parametrów produktu.
- **Warstwy.** Motyw trzech cienkich, narastających linii przy nagłówkach sekcji i jako delikatne tło pierwszego ekranu. Nawiązuje do warstw wydruku i działa jako znak graficzny.
- **Narożniki rysunkowe.** Zdjęcia produktów mają małe znaczniki w rogach, jak ramka na rysunku. Zdjęcia są w proporcji 4:3 na neutralnym tle.
- **Prawdziwe zdjęcia.** Makro warstw, detale, drukarki, właściciel przy pracy. Bez zdjęć stockowych i bez renderów udających wydruk.

Znak marki: napis **Solid Print** z symbolem trzech warstw, czytelny jako favicon i awatar na Instagramie.

## 4. Tokeny: kolory, typografia, kształty, ruch

Kontrasty policzone orientacyjnie, ostateczne sprawdzenie w testach dostępności.

| Element | Specyfikacja |
| --- | --- |
| Tło jasnych sekcji | Papier `#F6F4EF` |
| Karty i formularze | Biel `#FFFFFF`, ramka 1 px `#E3DFD5` |
| Ciemne pasy | Petrol `#0F3D3E`, tekst `#F6F4EF` |
| Tekst i nagłówki | Grafit `#17191A` |
| Tekst pomocniczy | `#5B605C` (ok. 5,7:1 na papierze) |
| Akcent: przyciski i znaczniki | Pomarańcz `#C2410C` z białym tekstem (ok. 5,2:1), po najechaniu `#9A3412` |
| Akcent na ciemnym pasie | Jasny pomarańcz `#FF8A5B` jako tekst i odnośniki; na petrolu `#C2410C` nie służy do tekstu |
| Wyróżnik | Żółty `#F2C14E` tylko jako podkreślenie i tło małych etykiet, nigdy tekst |
| Nagłówki | Space Grotesk 600–700 |
| Tekst i formularze | Inter 400–600 |
| Parametry techniczne | JetBrains Mono 500, wersaliki, 12–13 px, przy etykietach i kartach |
| Przyciski | Wysokość min. 48 px, zaokrąglenie 8 px; główny pomarańczowy, drugi z ramką grafitu |
| Karty | Zaokrąglenie 12 px, cienka ramka, bez cieni; po najechaniu ramka grafitowa |
| Zdjęcia produktów | Proporcja 4:3, neutralne tło, narożniki rysunkowe |
| Rytm sekcji | Papier, biel i petrol na przemian; odstępy pionowe 72 px na telefonie i 120 px na komputerze |
| Ruch | Wejście sekcji 300 ms (przesunięcie 12 px i pojawienie się), rysowanie linii warstw 600 ms; wyłączone przy ograniczonym ruchu |

Fonty są hostowane lokalnie. Pasy petrolowe pojawiają się najwyżej trzy razy na stronie głównej, żeby ciemność była akcentem, a nie motywem przewodnim.

## 5. Strona główna: układ sekcji

1. **Pierwszy ekran (papier).** Po lewej nagłówek „Od pomysłu do gotowego wydruku 3D”, dwa zdania opisu i przyciski „Wyceń projekt” oraz „Zobacz gotowe projekty”. Po prawej duże zdjęcie wydruku z narożnikami rysunkowymi i dwiema etykietami parametrów (materiał, wysokość warstwy), wpisanymi z rzeczywistych danych. W tle ledwo widoczne linie warstw.
2. **Trzy ścieżki (ciemny pas petrolowy).** Trzy duże karty: „Mam model”, „Mam pomysł”, „Gotowe produkty”. Każda ma ikonę z cienkich linii, jedno zdanie i przycisk do właściwego formularza.
3. **Wybrane produkty (papier).** Do sześciu kart z fotografią, nazwą, zastosowaniem, linią parametrów w mono i przyciskiem.
4. **Jak to wygląda (biel).** Cztery stacje w poziomej linii: zapytanie, ocena i wycena, wykonanie, odbiór lub wysyłka. Pod nią informacja, że cenę i termin potwierdza właściciel.
5. **Realizacje (papier).** Trzy–cztery przykłady w układzie problem, projekt, efekt: zdjęcie, jedno zdanie, materiał i wymiary. Link do wszystkich realizacji.
6. **Zastosowania i materiały (biel).** Kafelki zastosowań, np. prototypy, części zamienne, obudowy, upominki, z odnośnikami do katalogu i materiałów. Lista wyłącznie z rzeczywistej oferty.
7. **Pracownia (papier).** Zdjęcie właściciela, krótki opis doświadczenia, dwie drukarki na prawdziwych zdjęciach.
8. **FAQ i kontakt (ciemny pas petrolowy).** Rozwijane pytania po lewej, po prawej telefon, e-mail, krótki formularz i Instagram, jeśli adres jest uzupełniony.
9. **Stopka.** Menu, dane sprzedawcy, regulamin, prywatność, ustawienia cookies.

Bez automatycznie przesuwanych banerów. Sekcja opinii pojawia się dopiero po zdobyciu prawdziwych rekomendacji.

## 6. Nagłówek, kontakt i ekrany

**Nagłówek:** przyklejony, na papierowym tle z cienką linią u dołu. Logo, Usługi, Gotowe projekty, Materiały, O pracowni, Kontakt oraz pomarańczowy przycisk „Wyceń projekt”. Telefon widoczny na komputerze, a na telefonie dostępny bez otwierania menu. Menu mobilne z dużymi obszarami dotyku i pełnymi nazwami. Dolny pasek mobilny z „Zadzwoń” i „Wyceń projekt” nie może zasłaniać formularzy, komunikatów ani ustawień prywatności.

| Zakres | Zasada |
| --- | --- |
| Szerokości | Od 320 px do 2560 px i więcej, treść do 1440 px, wyśrodkowana |
| Marginesy boczne | 16 px telefon, 24 px tablet, 40 px komputer |
| Katalog | 1 kolumna do 639 px, 2 od 640 px, 3 od 1024 px, 4 od 1440 px |
| Pierwszy ekran i karta produktu | Dwie kolumny od 1024 px, poniżej układ pionowy |
| Formularze | Jedna kolumna na telefonie, pola grupowane na komputerze |
| Tekst | Podstawowy min. 16 px; nagłówek główny ok. 36 px na telefonie i 64 px na komputerze |
| Etykiety mono | Nie mniej niż 12 px i nigdy jedyny nośnik ważnej informacji |
| Dostępność | Widoczny fokus, obsługa klawiaturą, ograniczony ruch, kontrast min. 4,5:1 dla tekstu |

## 7. Podstrony i funkcje

**Usługi i oferta dla firm.** Osobne opisy projektowania 3D, druku z pliku, prototypowania i małych serii, zgodnie z rzeczywistą ofertą. Każda usługa ma zastosowania, informacje potrzebne do wyceny, etapy, powiązane realizacje i przycisk do właściwego zapytania. Oferta dla firm uwzględnia nazwę firmy, opcjonalny NIP, liczbę sztuk i powtarzalną współpracę.

**Gotowe projekty.** Katalog z wyszukiwaniem po nazwie i opisie oraz filtrami kategorii i zastosowania; filtry zapisują się w adresie. Karta produktu: galeria z powiększeniem, zastosowanie, wymiary i materiał w linii mono, kolory i warianty, personalizacja, orientacyjny termin i cena „od” (jeśli właściciel je poda), ilość i przycisk „Zapytaj o zamówienie”. Wybrany produkt, wariant i ilość trafiają do formularza, a zapytanie zachowuje ich kopię. Produkty na zamówienie mają osobne oznaczenie, a niedostępne projekty zostają jako realizacje bez przycisku.

**Wycena: trzy formularze.** Druk z pliku, projektowanie (bez wymaganego modelu, ze zdjęciami lub szkicem) i gotowy produkt (dane uzupełnia wybrana pozycja). Wspólne pola: imię, e-mail, opcjonalnie telefon i firma, liczba sztuk, zastosowanie, materiał i kolor z opcją „Doradź mi”, termin, uwagi, wysyłka lub odbiór. Przy plikach klient wskazuje jednostkę: mm, cm, m lub „Nie wiem”. Przed wysłaniem widoczny komunikat: „Przesłanie zapytania nie oznacza złożenia płatnego zamówienia. Cenę i termin potwierdzimy po sprawdzeniu projektu.”

**Przesyłanie plików.** Duże pole z przerywanym obramowaniem „Przeciągnij i upuść pliki tutaj”, przycisk „Wybierz pliki”, limity i rozwijana lista rozszerzeń. Formaty: `.step`, `.stp`, `.stl`, `.3mf`, `.obj`, `.igs`, `.iges`, `.dxf`, `.dwg`, `.acad`, `.wrl`, `.glb`, `.gltf`, `.3ds`, `.ply`, `.off`, `.3dm`, `.fbx`, `.dae`, `.ifc`, `.brep`, `.fcstd`, `.bim`, `.amf`. Przyjęcie pliku nie potwierdza poprawności modelu ani możliwości wydruku, także dla mniej jednoznacznych rozszerzeń jak `.acad` i `.bim`.

| Limit | Wartość domyślna |
| --- | --- |
| Modele | do 5 |
| Rozmiar pliku | do 100 MiB |
| Razem | do 250 MiB |
| Materiały pomocnicze (JPG, PNG, PDF) | do 3, po max. 10 MiB |

Lista załączników pokazuje nazwę, rozmiar, stan, usuwanie i ponawianie błędu. Dane formularza przetrwają nieudaną próbę, a wysyłanie rusza po „Wyślij zapytanie”.

**Podgląd 3D.** STL, OBJ i GLB na czytnikach Three.js, w ciemnej ramce petrolowej z neutralną powierzchnią modelu. Obracanie, przybliżanie i przywrócenie widoku, mysz i dotyk, bez zewnętrznych tekstur. Limit podglądu 25 MiB i 500 tys. trójkątów, przetwarzanie poza głównym wątkiem. Przekroczony limit, brak WebGL lub uszkodzony model dają komunikat i nie blokują wysyłki. Pozostałe formaty pokazują kartę: „Plik zostanie oceniony przez pracownię”. Podgląd nie liczy ceny i nie potwierdza wymiarów, skali ani wykonalności.

**Materiały, poradnik, kontakt.** Materiały to karty z zastosowaniami, ograniczeniami, kolorami i dostępnością, z filtrami (dekoracyjne, techniczne, elastyczne, do użytku zewnętrznego), tylko z rzeczywistej oferty. Poradnik pomaga przygotować zapytanie i wybrać materiał; wyszukiwarka obejmuje produkty, usługi, materiały i artykuły. Kontakt: klikalny telefon, e-mail, godziny, obszar obsługi, odbiór i wysyłka, krótki formularz, adres pracowni tylko przy przyjmowaniu klientów. Profile społecznościowe właściciel wpisuje w panelu, puste są ukryte, bez pobierania wpisów z Instagrama.

## 8. Panel właściciela, technika, prywatność

**Panel.** Właściciel sam zarządza produktami, wariantami, kategoriami i zdjęciami, materiałami i dostępnością, usługami, realizacjami, poradnikiem i FAQ, kontaktem, godzinami, social mediami i treścią strony głównej oraz zapytaniami z prywatnymi załącznikami. Statusy zapytań: Nowe, W ocenie, Oferta wysłana, W realizacji, Zamknięte, a także Odrzucone. Notatki wewnętrzne widać tylko w panelu. Klient po wysłaniu widzi numer zapytania i dostaje potwierdzenie e-mailem, a właściciel powiadomienie z odnośnikiem do panelu.

| Warstwa | Rozwiązanie |
| --- | --- |
| Strona i formularze | Next.js i TypeScript |
| Panel i treści | Payload CMS z logowaniem właściciela |
| Dane | PostgreSQL: produkty, ustawienia, zapytania |
| Pliki | Magazyn zgodny z S3, osobno publiczne zdjęcia i prywatne modele |
| Poczta | SMTP z kolejką ponowień |
| Wdrożenie | Docker na hostingu obsługującym aplikację i bazę |

Publicznie dostępne są: odczyt opublikowanego katalogu, utworzenie sesji przesyłania i wysłanie zapytania z identyfikatorami załączników. Zapytanie powstaje dopiero po potwierdzeniu przesłania wszystkich plików, a ponowienie nie tworzy duplikatu. Źródła: [Payload](https://payloadcms.com/docs/getting-started/what-is-payload), [wdrażanie Next.js](https://nextjs.org/docs/app/getting-started/deploying), [Three.js](https://threejs.org/docs/).

**Prywatność i niezawodność:**

- Modele klientów tylko po zalogowaniu właściciela, pobieranie krótkotrwałymi autoryzowanymi odnośnikami, brak publicznej rejestracji administratorów.
- Limity sprawdzane na serwerze, ochrona przed spamem i skanowanie załączników; plik podejrzany lub czekający na niedostępny skaner zostaje w kwarantannie.
- Błąd wysyłki e-mail nie usuwa zapytania z panelu.
- Osierocone pliki znikają po 24 godzinach.
- Domyślna retencja: załączniki 90 dni od zamknięcia sprawy, dane zapytania 12 miesięcy; ustawienia i wygaszanie kopii potwierdza właściciel przed publikacją.
- Codzienne kopie z przechowywaniem 30 dni i sprawdzonym odtworzeniem.

## 9. Testy, kolejność i dane przed startem

**Kolejność realizacji:**

1. System wizualny (tokeny, logo, karta techniczna) i projekt strony głównej, produktu i wyceny na telefon i komputer.
2. Katalog, treści i panel właściciela.
3. Formularze, prywatne pliki, podgląd 3D i powiadomienia.
4. Uzupełnienie materiałów, testy i wersja przedprodukcyjna.
5. Publikacja, sprawdzenie rzeczywistego zapytania i instrukcja obsługi dla właściciela.

**Scenariusze odbioru:**

- Każda z trzech ścieżek tworzy zapytanie; projektowanie działa bez pliku 3D.
- Wszystkie wymienione rozszerzenia przechodzą, a niedozwolone typy i przekroczone limity są odrzucane.
- Przerwane wysyłanie da się ponowić bez utraty pól i bez duplikatu.
- STL, OBJ i GLB działają w podglądzie także dotykiem; błąd modelu lub brak WebGL nie blokuje zapytania.
- Osoba niezalogowana nie odczyta zapytań ani nie pobierze modeli.
- Klient i właściciel dostają prawdziwe wiadomości testowe, sprawdzone są ponowienia po błędzie.
- Właściciel sam dodaje produkt, zmienia kontakt i prowadzi zapytanie przez statusy.
- Widoki sprawdzone przy 320, 390, 768, 1024, 1440, 1920 i 2560 px, na prawdziwym Androidzie i iPhonie oraz w aktualnych przeglądarkach komputerowych.
- Kontrola klawiatury, kontrastu (w tym pomarańczu na petrolu), powiększenia tekstu, szybkości ładowania i odtworzenia kopii.

Strona dostaje własne tytuły, opisy, adresy, mapę witryny i podglądy linków. Zapytania i modele nie są indeksowane.

**Założenia i dane od właściciela:**

- Nazwa Solid Print; sprzedawane są fizyczne wydruki, katalog przyjmuje zapytania, a wycenę i termin potwierdza właściciel.
- Właściciel dostarcza dane kontaktowe i sprzedawcy, zdjęcia (w tym makro warstw i pracownię), produkty, parametry drukarek, materiały i zasady realizacji.
- Nie publikujemy wymyślonych opinii, cen, terminów, certyfikatów ani możliwości sprzętu; etykiety parametrów na zdjęciach pochodzą z faktycznych danych.
- Puste sekcje poradnika, opinii i profili społecznościowych pozostają ukryte.
- Przed publikacją potrzebne zasady zamówień, prywatności i cookies zgodne z działaniem strony.
- Domena, hosting i poczta to konfiguracja wdrożenia, plan nie zakłada ich zakupu.
