# Audyt rozliczenia dostawy — Odylion

Samodzielny lead magnet Next.js dla firm, które chcą uporządkować warunki oferty, rozliczenia lub dokumentu dostawy przed porównaniem transakcji.

## Co robi

- prosi tylko o grupę materiału, rodzaj dokumentu i pięć szybkich odpowiedzi — bez wpisywania cen, mas i danych handlowych;
- wskazuje brakujące elementy potrzebne do uczciwego porównania: masę netto, gatunek i stawkę, potrącenia, transport oraz termin płatności;
- tworzy konkretną listę maksymalnie trzech działań, zamiast udawać wycenę lub analizę dokumentu przez OCR;
- przygotowuje zwięzłe, opcjonalne podsumowanie do WhatsApp Odylion;
- nie zapisuje danych, nie przesyła dokumentów, nie korzysta z API, map, scrapingu ani OCR.

Wynik jest kartą kontroli, nie ofertą handlową, analizą faktury ani poradą prawną. Ostateczna wycena zależy m.in. od gatunku, jakości, ilości i logistyki.

## Uruchomienie

```bash
npm install
npm run dev
```

## Weryfikacja

```bash
npm run typecheck
npm run build
```

## Prywatność i CTA

W narzędziu nie ma uploadu dokumentów. CTA prowadzi do oficjalnego numeru WhatsApp Odylion: `+48 790 686 856`; użytkownik sam decyduje, czy wysłać zanonimizowany dokument do drugiej opinii.
