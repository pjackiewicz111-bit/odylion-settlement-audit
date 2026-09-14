# Porównywarka realnej wartości partii

Samodzielny lead magnet Next.js dla firm, które chcą porównać dwa rozliczenia partii materiału bez tworzenia konta.

## Co robi

- wymaga tylko wyboru grupy materiału, przybliżonej masy oraz dwóch stawek za kilogram;
- liczy rozliczenie z podanych danych: masa po podanym potrąceniu × stawka − znane koszty;
- pokazuje efektywną stawkę za kg i różnicę między ofertami;
- nie traktuje pustych pól dodatkowych jako zera — oznacza je jako warunki nieznane;
- przygotowuje zwięzłe podsumowanie dla WhatsApp Odylion oraz prowadzi do formularza wyceny;
- nie korzysta z API, danych konkurencji, Google Maps, scrapingu ani OCR.

Wynik jest symulacją informacyjną, nie ofertą handlową. Ostateczna wycena zależy od gatunku, jakości, ilości oraz logistyki.

## Uruchomienie

Projekt jest niezależny od aplikacji w katalogu głównym repozytorium.

```bash
cd lead-magnets/porownywarka-realnej-wartosci
npm install
npm run dev
```

Następnie otwórz `http://localhost:3000`.

## Weryfikacja

```bash
npm run typecheck
npm run build
```

## Kontakt w CTA

Link WhatsApp prowadzi do oficjalnego numeru Odylion: `+48 790 686 856`. Komunikat jest tylko wstępnie wypełniony; użytkownik samodzielnie decyduje o wysłaniu wiadomości.
