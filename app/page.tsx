"use client";

import { useMemo, useState } from "react";

type MaterialId =
  | "aluminium"
  | "miedz"
  | "mosiadz"
  | "nierdzewka"
  | "kable"
  | "silniki"
  | "stal"
  | "inne";

type DocumentType = "settlement" | "offer" | "delivery";
type CheckId = "weight" | "rate" | "deductions" | "transport";
type CheckAnswer = "yes" | "no" | "unknown";
type PaymentAnswer = "same-day" | "up-to-7" | "later" | "unknown";

type AuditValues = {
  material: MaterialId | "";
  documentType: DocumentType | "";
  checks: Record<CheckId, CheckAnswer>;
  payment: PaymentAnswer;
};

const materials: Array<{ id: MaterialId; label: string; note: string }> = [
  { id: "aluminium", label: "Aluminium", note: "profile, odlewy, felgi" },
  { id: "miedz", label: "Miedź", note: "Cu, granulat, milbera" },
  { id: "mosiadz", label: "Mosiądz / brąz", note: "żółty metal, M58, M63" },
  { id: "nierdzewka", label: "Nierdzewka", note: "CrNi i inne stopy" },
  { id: "kable", label: "Kable / przewody", note: "wiązki, linka Al" },
  { id: "silniki", label: "Silniki", note: "wirniki, stojany, alternatory" },
  { id: "stal", label: "Złom stalowy", note: "wsad i niewsad" },
  { id: "inne", label: "Inny materiał", note: "nie musisz znać gatunku" },
];

const documentTypes: Array<{ id: DocumentType; label: string; note: string }> = [
  { id: "settlement", label: "Rozliczenie po dostawie", note: "faktura, kwit lub zestawienie" },
  { id: "offer", label: "Otrzymana oferta", note: "wiadomość, SMS, e-mail lub PDF" },
  { id: "delivery", label: "Dokument dostawy", note: "waga, WZ albo potwierdzenie odbioru" },
];

const checkDefinitions: Array<{ id: CheckId; question: string; help: string }> = [
  {
    id: "weight",
    question: "Czy widzisz masę netto rozliczenia?",
    help: "Sama masa brutto bez tary nie pozwala porównać wyniku.",
  },
  {
    id: "rate",
    question: "Czy dokument podaje stawkę i gatunek materiału?",
    help: "„Miedź” i „miedź niesortowana” nie są tym samym w rozliczeniu.",
  },
  {
    id: "deductions",
    question: "Czy wiesz, czy zastosowano potrącenia?",
    help: "Np. z tytułu zanieczyszczeń, wilgoci lub innego ustalenia.",
  },
  {
    id: "transport",
    question: "Czy wiesz, kto i za ile rozlicza transport?",
    help: "Transport może być ustaleniem poza samą stawką za kilogram.",
  },
];

const initialValues: AuditValues = {
  material: "",
  documentType: "",
  checks: {
    weight: "unknown",
    rate: "unknown",
    deductions: "unknown",
    transport: "unknown",
  },
  payment: "unknown",
};

const answerLabels: Record<CheckAnswer, string> = {
  yes: "tak",
  no: "nie",
  unknown: "nie wiem",
};

const paymentLabels: Record<PaymentAnswer, string> = {
  "same-day": "tego samego dnia",
  "up-to-7": "do 7 dni",
  later: "później niż za 7 dni",
  unknown: "nie wiem",
};

function titleForDocument(type: DocumentType) {
  if (type === "settlement") return "rozliczenie";
  if (type === "offer") return "ofertę";
  return "dokument dostawy";
}

export default function Home() {
  const [values, setValues] = useState<AuditValues>(initialValues);
  const [copyMessage, setCopyMessage] = useState("");
  const material = materials.find((item) => item.id === values.material);
  const isReady = Boolean(material && values.documentType);

  const audit = useMemo(() => {
    if (!material || !values.documentType) return undefined;

    const missing = checkDefinitions.filter((check) => values.checks[check.id] !== "yes");
    const paymentKnown = values.payment !== "unknown";
    const totalGaps = missing.length + (paymentKnown ? 0 : 1);
    const status =
      totalGaps === 0
        ? {
            label: "można porównać",
            tone: "ready",
            lead: "Masz większość informacji potrzebnych, aby pytać o realny wynik — nie tylko stawkę za kg.",
          }
        : totalGaps <= 2
          ? {
              label: "prawie gotowe",
              tone: "partial",
              lead: "Brakuje kilku warunków, ale już wiesz dokładnie, o co dopytać przed podjęciem decyzji.",
            }
          : {
              label: "wymaga wyjaśnienia",
              tone: "attention",
              lead: "Samej stawki nie da się jeszcze uczciwie porównać. Najpierw uporządkuj warunki rozliczenia.",
            };

    const actions: string[] = [];

    if (values.checks.weight !== "yes") {
      actions.push("Ustal masę netto oraz — jeśli dotyczy — tarę i sposób ważenia.");
    }
    if (values.checks.rate !== "yes") {
      actions.push("Poproś o stawkę przypisaną do konkretnego gatunku materiału.");
    }
    if (values.checks.deductions !== "yes") {
      actions.push("Dopytaj o potrącenia i warunek, od którego są liczone.");
    }
    if (values.checks.transport !== "yes") {
      actions.push("Potwierdź, czy transport zmienia kwotę końcowego rozliczenia.");
    }
    if (!paymentKnown) {
      actions.push("Potwierdź formę i termin płatności, zanim porównasz dwie propozycje.");
    }
    if (actions.length === 0) {
      actions.push("Porównaj końcową kwotę, masę netto i warunki płatności — razem, nie osobno.");
      actions.push("Przy nieoczywistym stopie zachowaj zdjęcie partii lub opis gatunku do weryfikacji.");
    }

    const summary = [
      "Dzień dobry, korzystam z Audytu rozliczenia dostawy Odylion.",
      `Materiał: ${material.label}. Analizuję: ${titleForDocument(values.documentType)}.`,
      `Masa netto: ${answerLabels[values.checks.weight]}; stawka i gatunek: ${answerLabels[values.checks.rate]}; potrącenia: ${answerLabels[values.checks.deductions]}; transport: ${answerLabels[values.checks.transport]}; płatność: ${paymentLabels[values.payment]}.`,
      "Chcę przesłać zanonimizowany dokument do drugiej opinii i zapytać o porównywalną wycenę.",
    ].join(" ");

    return { materialLabel: material.label, status, actions: actions.slice(0, 3), summary };
  }, [material, values]);

  const whatsappUrl = audit
    ? `https://wa.me/48790686856?text=${encodeURIComponent(audit.summary)}`
    : "https://wa.me/48790686856";

  const copySummary = async () => {
    if (!audit) return;
    try {
      await navigator.clipboard.writeText(audit.summary);
      setCopyMessage("Podsumowanie skopiowane.");
    } catch {
      setCopyMessage("Nie udało się skopiować. Zaznacz tekst ręcznie.");
    }
  };

  return (
    <main>
      <a className="skip-link" href="#audyt">
        Przejdź do audytu
      </a>

      <header className="site-header shell">
        <a className="brand" href="https://www.odylion.com/" aria-label="Odylion — strona główna">
          <span className="brand-mark" aria-hidden="true">O</span>
          ODYLION
        </a>
        <p>Audyt rozliczenia dostawy</p>
      </header>

      <section className="hero">
        <div className="shell hero__inner">
          <p className="eyebrow">DLA FIRM · 90 SEKUND · BEZ KONTA</p>
          <h1>Nie pytaj tylko o stawkę. Sprawdź, czego brakuje w rozliczeniu.</h1>
          <p>
            Przejdź przez kartę kontroli dla jednej oferty, faktury lub dostawy. Dostaniesz listę
            pytań, które pomagają porównać realny wynik transakcji — zanim materiał wyjedzie.
          </p>
          <div className="hero__facts" aria-label="Najważniejsze zasady">
            <span>bez wpisywania kwot</span>
            <span>bez przesyłania dokumentu</span>
            <span>bez pozornej wyceny</span>
          </div>
        </div>
      </section>

      <section className="workspace shell" id="audyt" aria-label="Audyt rozliczenia">
        <div className="form-column">
          <div className="section-heading">
            <p className="eyebrow">KARTA KONTROLI</p>
            <h2>Co masz przed sobą?</h2>
            <p>Wybierasz tylko to, co już widać w dokumencie. Nie podajesz danych handlowych ani cen.</p>
          </div>

          <section className="step-card" aria-labelledby="material-title">
            <div className="step-title">
              <span>01</span>
              <div>
                <p className="eyebrow">MATERIAŁ</p>
                <h3 id="material-title">Jaka partia jest na dokumencie?</h3>
              </div>
            </div>
            <div className="choice-grid material-grid" role="radiogroup" aria-label="Wybierz materiał">
              {materials.map((item) => {
                const selected = values.material === item.id;
                return (
                  <label
                    className={`choice-card ${selected ? "is-selected" : ""}`}
                    key={item.id}
                  >
                    <input
                      checked={selected}
                      name="material"
                      onChange={() => setValues((current) => ({ ...current, material: item.id }))}
                      type="radio"
                      value={item.id}
                    />
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="step-card" aria-labelledby="document-title">
            <div className="step-title">
              <span>02</span>
              <div>
                <p className="eyebrow">DOKUMENT</p>
                <h3 id="document-title">Co sprawdzasz?</h3>
              </div>
            </div>
            <div className="choice-grid document-grid" role="radiogroup" aria-label="Wybierz rodzaj dokumentu">
              {documentTypes.map((item) => {
                const selected = values.documentType === item.id;
                return (
                  <label
                    className={`choice-card choice-card--document ${selected ? "is-selected" : ""}`}
                    key={item.id}
                  >
                    <input
                      checked={selected}
                      name="document-type"
                      onChange={() => setValues((current) => ({ ...current, documentType: item.id }))}
                      type="radio"
                      value={item.id}
                    />
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="step-card" aria-labelledby="checks-title">
            <div className="step-title">
              <span>03</span>
              <div>
                <p className="eyebrow">PIĘĆ SZYBKICH SPRAWDZEŃ</p>
                <h3 id="checks-title">Co naprawdę widać w warunkach?</h3>
              </div>
            </div>
            <div className="check-list">
              {checkDefinitions.map((check) => (
                <fieldset className="check-row" key={check.id}>
                  <legend>{check.question}</legend>
                  <p>{check.help}</p>
                  <div className="answer-options">
                    {(["yes", "no", "unknown"] as CheckAnswer[]).map((answer) => (
                      <label key={answer}>
                        <input
                          checked={values.checks[check.id] === answer}
                          name={check.id}
                          onChange={() =>
                            setValues((current) => ({
                              ...current,
                              checks: { ...current.checks, [check.id]: answer },
                            }))
                          }
                          type="radio"
                        />
                        <span>{answerLabels[answer]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <fieldset className="check-row">
                <legend>Jaki termin płatności widzisz?</legend>
                <p>To część warunków transakcji, nawet gdy stawka wygląda dobrze.</p>
                <div className="answer-options answer-options--payment">
                  {(["same-day", "up-to-7", "later", "unknown"] as PaymentAnswer[]).map((answer) => (
                    <label key={answer}>
                      <input
                        checked={values.payment === answer}
                        name="payment"
                        onChange={() => setValues((current) => ({ ...current, payment: answer }))}
                        type="radio"
                      />
                      <span>{paymentLabels[answer]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        </div>

        <aside className="result-panel" aria-live="polite" aria-atomic="true">
          {!isReady || !audit ? (
            <div className="empty-result">
              <span aria-hidden="true">⌁</span>
              <p className="eyebrow">TWOJA KARTA KONTROLI</p>
              <h2>Wybierz materiał i rodzaj dokumentu.</h2>
              <p>Potem wynik będzie aktualizował się po każdym kliknięciu — bez wysyłania formularza.</p>
            </div>
          ) : (
            <div className="audit-result">
              <div className="result-topline">
                <p className="eyebrow">KARTA KONTROLI GOTOWA</p>
                <span className={`status-badge status-badge--${audit.status.tone}`}>{audit.status.label}</span>
              </div>
              <h2>{audit.materialLabel}: co sprawdzić przed porównaniem?</h2>
              <p className="result-lead">{audit.status.lead}</p>

              <ol className="action-list">
                {audit.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ol>

              <div className="privacy-note">
                <span aria-hidden="true">◌</span>
                <p>
                  Chcesz drugą opinię? Przed wysłaniem dokumentu zamaskuj numery rachunków,
                  adresy i inne dane, których nie trzeba pokazywać do oceny warunków.
                </p>
              </div>

              <div className="cta-box">
                <p className="eyebrow">NASTĘPNY KROK</p>
                <h3>Wyślij zanonimizowany dokument do drugiej opinii.</h3>
                <p>Wiadomość otworzy się z gotowym kontekstem. Ty decydujesz, czy i co dołączasz.</p>
                <a className="primary-button" href={whatsappUrl} rel="noreferrer" target="_blank">
                  Zapytaj Odylion na WhatsApp <span aria-hidden="true">↗</span>
                </a>
                <button className="secondary-button" onClick={() => void copySummary()} type="button">
                  Skopiuj podsumowanie
                </button>
                {copyMessage && <p className="copy-message" role="status">{copyMessage}</p>}
                <a className="text-link" href="https://www.odylion.com/wycena/">
                  Wolę formularz wyceny na odylion.com <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          )}
        </aside>
      </section>

      <footer className="shell footer">
        <p>
          Narzędzie porządkuje pytania do rozliczenia — nie jest ofertą handlową ani audytem prawnym.
          Ostateczna wycena materiału zależy m.in. od gatunku, jakości, ilości i logistyki.
        </p>
        <a href="https://www.odylion.com/">Odylion.com</a>
      </footer>
    </main>
  );
}
