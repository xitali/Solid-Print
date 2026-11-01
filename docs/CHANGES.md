# Zmiany po planie v2

## 01.11.2026 — paleta Navy / Lavender / Black

Na prośbę właściciela projektu wdrożono nowoczesną ciemną paletę: głęboka czerń (`#080B12`, `#030508`), ciemny granat dla kart i sekcji (`#0F172A`, `#1E293B`) oraz lawendowy fiolet (`#8B5CF6`, `#A78BFA`, `#C4B5FD`) jako kolor akcentów, przycisków, znaczników i materiału w podglądzie 3D.

## 31.10.2026 — animacje CSS i paleta grafitowa

Na prośbę właściciela projektu usunięto zielony/petrolowy akcent. Nowa paleta: ciepły papier, neutralny grafit `#232326`, pomarańcz `#C2410C`. Zmiana obejmuje ciemne sekcje, ikony i podpisy, ilustrację, podgląd modeli 3D, potwierdzenia formularzy oraz grafikę udostępniania.

Dodano wejścia elementów z Animista i przesuwającą się warstwę przycisków na podstawie Codrops Pan. Karty pojawiają się kolejno, strzałki i podkreślenia reagują na wskazanie, a schemat 3D otrzymał skończoną animację rysowania. Źródła i licencje: `THIRD_PARTY_NOTICES.md`.

Ruch respektuje `prefers-reduced-motion`. Nie ma stale zapętlonych animacji. Treść pozostaje czytelna przy braku JavaScript, a obserwator uwzględnia nawigację i treści doładowywane przez Next.js.
