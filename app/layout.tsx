import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audyt rozliczenia dostawy | Odylion",
  description:
    "W 90 sekund sprawdź, jakich warunków brakuje, aby uczciwie porównać rozliczenie dostawy materiału.",
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
