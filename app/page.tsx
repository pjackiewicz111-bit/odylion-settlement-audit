"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Material = {
  id: string;
  label: string;
  hint: string;
};

type OfferKey = "a" | "b";

type OfferValues = {
  rate: string;
  deduction: string;
  transport: string;
  otherCosts: string;
  paymentTerms: string;
};

type CalculatorValues = {
  material: string;
  massPreset: string;
  customMass: string;
  offers: Record<OfferKey, OfferValues>;
};

type Calculation = {
  grossMass: number;
  settledMass: number;
  rate: number;
  knownCosts: number;
  amount: number;
  effectiveRate: number;
  unknowns: string[];
};

const materials: Material[] = [
  { id: "aluminium", label: "Aluminium", hint: "profile, odlewy, felgi" },
  { id: "miedz", label: "Miedź", hint: "Cu, granulat, milbera" },
  { id: "mosiadz-braz", label: "Mosiądz i brąz", hint: "żółty metal, M58, M63" },
  { id: "stal-nierdzewna", label: "Stal nierdzewna", hint: "CrNi i metale specjalne" },
  { id: "kable", label: "Kable i przewody", hint: "wiązki, linka Al, instalacje" },
  { id: "silniki", label: "Silniki elektryczne", hint: "wirniki, stojany, alternatory" },
  { id: "cynk-olow", label: "Cynk i ołów", hint: "blacha, znal, ołów" },
  { id: "zlom-stalowy", label: "Złom stalowy", hint: "wsad i niewsad" },
  { id: "makulatura", label: "Makulatura", hint: "karton, mix, bela" },
];

const massPresets = [
  { value: "100", label: "ok. 100 kg" },
  { value: "500", label: "ok. 500 kg" },
  { value: "1000", label: "ok. 1 t" },
  { value: "5000", label: "ok. 5 t" },
];

const initialOffer: OfferValues = {
  rate: "",
  deduction: "",
  transport: "",
  otherCosts: "",
  paymentTerms: "",
};

const initialValues: CalculatorValues = {
  material: "",
  massPreset: "500",
  customMass: "",
  offers: {
    a: { ...initialOffer },
    b: { ...initialOffer },
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(amount);

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits }).format(value);

const readNumber = (value: string) => {
  const parsed = Number(value.replace(/\s/g, "").replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const readNonNegativeNumber = (value: string) => {
  const parsed = readNumber(value);
  return parsed !== undefined && parsed >= 0 ? parsed : undefined;
};

const readDeduction = (value: string) => {
  const parsed = readNonNegativeNumber(value);
  return parsed !== undefined && parsed <= 100 ? parsed : undefined;
};

const selectedMass = (values: CalculatorValues) =>
  values.massPreset === "custom" ? readNumber(values.customMass) : readNumber(values.massPreset);

const calculateOffer = (offer: OfferValues, mass: number, offerName: string): Calculation => {
  const rate = readNumber(offer.rate) ?? 0;
  const deduction = readDeduction(offer.deduction);
  const transport = readNonNegativeNumber(offer.transport);
  const otherCosts = readNonNegativeNumber(offer.otherCosts);
  const settledMass = deduction === undefined ? mass : mass * (1 - deduction / 100);
  const knownCosts = (transport ?? 0) + (otherCosts ?? 0);
  const amount = settledMass * rate - knownCosts;
  const unknowns: string[] = [];

  if (deduction === undefined) unknowns.push(`potrącenie masy w Ofercie ${offerName}`);
  if (transport === undefined) unknowns.push(`koszt transportu w Ofercie ${offerName}`);
  if (otherCosts === undefined) unknowns.push(`inne koszty w Ofercie ${offerName}`);
  if (!offer.paymentTerms.trim()) unknowns.push(`termin płatności w Ofercie ${offerName}`);

  return {
    grossMass: mass,
    settledMass,
    rate,
    knownCosts,
    amount,
    effectiveRate: amount / mass,
    unknowns,
  };
};

const offerLabel = (key: OfferKey) => (key === "a" ? "Oferta A" : "Oferta B");

export default function Home() {
  const [values, setValues] = useState<CalculatorValues>(initialValues);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const resultRef = useRef<HTMLElement>(null);

  const mass = selectedMass(values);
  const material = materials.find((item) => item.id === values.material);
  const hasValidMass = mass !== undefined && mass > 0;
  const hasValidRates =
    (readNumber(values.offers.a.rate) ?? 0) > 0 && (readNumber(values.offers.b.rate) ?? 0) > 0;
  const isReady = Boolean(material && hasValidMass && hasValidRates);

  const calculations = useMemo(() => {
    if (!hasValidMass) return undefined;

    return {
      a: calculateOffer(values.offers.a, mass, "A"),
      b: calculateOffer(values.offers.b, mass, "B"),
    };
  }, [hasValidMass, mass, values.offers]);

  const difference = calculations ? calculations.a.amount - calculations.b.amount : 0;
  const winningOffer: OfferKey = difference >= 0 ? "a" : "b";
  const unknowns = calculations ? [...calculations.a.unknowns, ...calculations.b.unknowns] : [];

  const setOfferValue = (key: OfferKey, field: keyof OfferValues, value: string) => {
    setValues((current) => ({
      ...current,
      offers: {
        ...current.offers,
        [key]: {
          ...current.offers[key],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isReady) {
      setHasCalculated(false);
      setValidationMessage("Wybierz materiał i masę oraz wpisz dwie stawki większe od zera.");
      return;
    }

    setValidationMessage("");
    setHasCalculated(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const whatsappUrl = useMemo(() => {
    if (!calculations || !material || !hasValidMass) return "https://wa.me/48790686856";

    const comparison =
      difference === 0
        ? "Wynik z podanych danych jest taki sam."
        : `${offerLabel(winningOffer)} wypada wyżej o ${formatCurrency(Math.abs(difference))}.`;
    const message = [
      "Dzień dobry, porównałem/am dwie oferty.",
      `Materiał: ${material.label}; masa: ok. ${formatNumber(mass)} kg.`,
      `A: ${values.offers.a.rate} zł/kg → ${formatCurrency(calculations.a.amount)}.`,
      `B: ${values.offers.b.rate} zł/kg → ${formatCurrency(calculations.b.amount)}.`,
      comparison,
      "Proszę o porównywalną wycenę po weryfikacji materiału.",
    ].join(" ");

    return `https://wa.me/48790686856?text=${encodeURIComponent(message)}`;
  }, [calculations, difference, hasValidMass, mass, material, values.offers, winningOffer]);

  return (
    <main>
      <a className="skip-link" href="#kalkulator">
        Przejdź do kalkulatora
      </a>

      <section className="hero" aria-labelledby="page-title">
        <div className="shell hero__inner">
          <p className="eyebrow">Narzędzie pomocnicze dla firm</p>
          <h1 id="page-title">Porównaj realne rozliczenie partii — nie tylko stawkę za kg.</h1>
          <p className="hero__lead">
            Wpisz tylko materiał, przybliżoną masę i dwie stawki. Zobaczysz różnicę w wartości
            rozliczenia oraz to, których warunków jeszcze nie znasz.
          </p>
          <div className="hero__facts" aria-label="Najważniejsze zasady narzędzia">
            <span>Bez konta</span>
            <span>Bez danych konkurencji</span>
            <span>Bez obietnicy ceny</span>
          </div>
        </div>
      </section>

      <section className="shell calculator" id="kalkulator" aria-labelledby="calculator-title">
        <div className="section-heading">
          <p className="eyebrow">3 krótkie kroki</p>
          <h2 id="calculator-title">Podaj dane, które masz pod ręką</h2>
          <p>Resztę możesz dodać później. Puste pola dodatkowe oznaczają „nie wiem”, a nie „zero”.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="form-section">
            <legend>
              <span>01</span> Jaki to materiał?
            </legend>
            <p className="field-help">Wystarczy grupa — dokładny gatunek sprawdzisz później.</p>
            <div className="material-grid">
              {materials.map((item) => (
                <button
                  className={`material-card ${values.material === item.id ? "is-selected" : ""}`}
                  key={item.id}
                  type="button"
                  aria-pressed={values.material === item.id}
                  onClick={() => setValues((current) => ({ ...current, material: item.id }))}
                >
                  <span>{item.label}</span>
                  <small>{item.hint}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>
              <span>02</span> Ile waży partia?
            </legend>
            <p className="field-help">Wybierz przybliżenie. Nie musisz znać masy co do kilograma.</p>
            <div className="mass-options" role="radiogroup" aria-label="Przybliżona masa partii">
              {massPresets.map((preset) => (
                <label className="choice-chip" key={preset.value}>
                  <input
                    checked={values.massPreset === preset.value}
                    name="mass"
                    onChange={() => setValues((current) => ({ ...current, massPreset: preset.value }))}
                    type="radio"
                    value={preset.value}
                  />
                  <span>{preset.label}</span>
                </label>
              ))}
              <label className="choice-chip choice-chip--custom">
                <input
                  checked={values.massPreset === "custom"}
                  name="mass"
                  onChange={() => setValues((current) => ({ ...current, massPreset: "custom" }))}
                  type="radio"
                  value="custom"
                />
                <span>Własna masa</span>
              </label>
            </div>
            {values.massPreset === "custom" && (
              <label className="inline-field" htmlFor="custom-mass">
                <span>Przybliżona masa w kg</span>
                <input
                  id="custom-mass"
                  inputMode="decimal"
                  onChange={(event) => setValues((current) => ({ ...current, customMass: event.target.value }))}
                  placeholder="np. 750"
                  type="text"
                  value={values.customMass}
                />
              </label>
            )}
          </fieldset>

          <fieldset className="form-section">
            <legend>
              <span>03</span> Jakie są stawki?
            </legend>
            <p className="field-help">Wpisz stawkę z obu ofert. To jedyne liczby wymagane do porównania.</p>
            <div className="offer-grid">
              {(["a", "b"] as OfferKey[]).map((key) => (
                <section className="offer-card" key={key} aria-labelledby={`offer-${key}-title`}>
                  <div className="offer-card__topline">
                    <p id={`offer-${key}-title`}>{offerLabel(key)}</p>
                    <span>stawka za kg</span>
                  </div>
                  <label htmlFor={`rate-${key}`}>
                    <span className="sr-only">Stawka za kilogram, {offerLabel(key)}</span>
                    <div className="input-with-suffix">
                      <input
                        id={`rate-${key}`}
                        inputMode="decimal"
                        onChange={(event) => setOfferValue(key, "rate", event.target.value)}
                        placeholder="np. 8,20"
                        type="text"
                        value={values.offers[key].rate}
                      />
                      <span aria-hidden="true">zł/kg</span>
                    </div>
                  </label>
                </section>
              ))}
            </div>
          </fieldset>

          <details className="advanced-fields">
            <summary>Dodaj, jeśli je znasz <span>opcjonalnie</span></summary>
            <p>
              Wpisane potrącenia i koszty zostaną uwzględnione w obliczeniu. Puste pole pozostaje
              oznaczone jako nieznane.
            </p>
            <div className="advanced-grid">
              {(["a", "b"] as OfferKey[]).map((key) => (
                <fieldset className="advanced-card" key={key}>
                  <legend>{offerLabel(key)}</legend>
                  <label htmlFor={`deduction-${key}`}>
                    Potrącenie masy (%)
                    <input
                      id={`deduction-${key}`}
                      inputMode="decimal"
                      onChange={(event) => setOfferValue(key, "deduction", event.target.value)}
                      placeholder="np. 2"
                      type="text"
                      value={values.offers[key].deduction}
                    />
                  </label>
                  <label htmlFor={`transport-${key}`}>
                    Koszt transportu (zł)
                    <input
                      id={`transport-${key}`}
                      inputMode="decimal"
                      onChange={(event) => setOfferValue(key, "transport", event.target.value)}
                      placeholder="np. 300"
                      type="text"
                      value={values.offers[key].transport}
                    />
                  </label>
                  <label htmlFor={`other-costs-${key}`}>
                    Inne jawne koszty (zł)
                    <input
                      id={`other-costs-${key}`}
                      inputMode="decimal"
                      onChange={(event) => setOfferValue(key, "otherCosts", event.target.value)}
                      placeholder="np. 100"
                      type="text"
                      value={values.offers[key].otherCosts}
                    />
                  </label>
                  <label htmlFor={`payment-${key}`}>
                    Termin płatności
                    <input
                      id={`payment-${key}`}
                      onChange={(event) => setOfferValue(key, "paymentTerms", event.target.value)}
                      placeholder="np. przelew 7 dni"
                      type="text"
                      value={values.offers[key].paymentTerms}
                    />
                  </label>
                </fieldset>
              ))}
            </div>
          </details>

          {validationMessage && (
            <p className="validation-message" role="alert">
              {validationMessage}
            </p>
          )}
          <button className="calculate-button" type="submit">
            Porównaj rozliczenie <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>

      {hasCalculated && calculations && material && hasValidMass && (
        <section className="result-section" aria-live="polite" ref={resultRef} tabIndex={-1}>
          <div className="shell">
            <div className="result-heading">
              <p className="eyebrow">Wynik z podanych danych</p>
              <h2>
                {difference === 0
                  ? "Obie oferty dają ten sam wynik."
                  : `${offerLabel(winningOffer)} wypada wyżej o ${formatCurrency(Math.abs(difference))}.`}
              </h2>
              <p>
                Dla materiału: <strong>{material.label}</strong> · masa: <strong>ok. {formatNumber(mass)} kg</strong>
              </p>
            </div>

            <div className="result-grid">
              {(["a", "b"] as OfferKey[]).map((key) => {
                const calculation = calculations[key];
                const hasKnownDeduction = values.offers[key].deduction.trim().length > 0;

                return (
                  <article className={`result-card ${winningOffer === key && difference !== 0 ? "is-winning" : ""}`} key={key}>
                    <div className="result-card__header">
                      <p>{offerLabel(key)}</p>
                      {winningOffer === key && difference !== 0 && <span>wyższy wynik</span>}
                    </div>
                    <p className="result-total">{formatCurrency(calculation.amount)}</p>
                    <p className="result-caption">rozliczenie z podanych danych</p>
                    <dl>
                      <div>
                        <dt>Masa do rozliczenia</dt>
                        <dd>
                          {formatNumber(calculation.settledMass)} kg
                          {!hasKnownDeduction && <small>bez uwzględnienia nieznanego potrącenia</small>}
                        </dd>
                      </div>
                      <div>
                        <dt>Efektywna stawka</dt>
                        <dd>{formatCurrency(calculation.effectiveRate)}/kg</dd>
                      </div>
                      <div>
                        <dt>Znane koszty</dt>
                        <dd>{formatCurrency(calculation.knownCosts)}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>

            {unknowns.length > 0 && (
              <aside className="unknowns" aria-labelledby="unknowns-title">
                <div>
                  <p className="eyebrow">Warto sprawdzić</p>
                  <h3 id="unknowns-title">Tych warunków jeszcze nie znasz</h3>
                </div>
                <ul>
                  {unknowns.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  Nie założyliśmy, że wynoszą zero. Mogą zmienić końcowe rozliczenie i różnicę między ofertami.
                </p>
              </aside>
            )}

            <div className="result-cta">
              <div>
                <p className="eyebrow">Następny krok</p>
                <h3>Chcesz porównywalną wycenę tej partii?</h3>
                <p>
                  Prześlij krótkie podsumowanie i zdjęcia materiału. Końcowa wycena zależy od gatunku,
                  jakości, ilości i logistyki.
                </p>
              </div>
              <div className="cta-actions">
                <a className="button button--primary" href={whatsappUrl} rel="noreferrer" target="_blank">
                  Napisz na WhatsApp <span aria-hidden="true">↗</span>
                </a>
                <a className="button button--secondary" href="https://www.odylion.com/wycena/" rel="noreferrer" target="_blank">
                  Przejdź do wyceny
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="shell footer">
        <p>Narzędzie pomocnicze. Nie stanowi oferty handlowej ani potwierdzenia klasyfikacji materiału.</p>
        <a href="https://www.odylion.com/" rel="noreferrer" target="_blank">
          odylion.com <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </main>
  );
}
