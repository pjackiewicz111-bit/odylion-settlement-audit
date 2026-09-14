import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Porównaj realne rozliczenie partii | Odylion",
  description:
    "Proste porównanie dwóch ofert skupu: wartość rozliczenia, koszty i efektywna stawka za kilogram.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
