"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/** ─────────────────────────────────────────────────────────────
 *  Lightweight i18n (built-in)
 *  - Voit siirtää tämän myöhemmin esim. src/i18n.ts -tiedostoon
 *  - Persistoi kielivalinta localStorageen
 *  ────────────────────────────────────────────────────────────*/
type Lang = "en" | "fi";

const dict = {
  en: {
    title: "Website Quote Calculator",
    subtitle: "Select your needs to get an instant estimate. Pricing logic is adjustable in code.",

    projectType: "Project type",
    informational: "Informational",
    ecommerce: "E-commerce",

    sizeComplexity: "Size & complexity",
    pagesLabel: "Number of pages",
    designComplexity: "Design complexity",
    simple: "Simple",
    standard: "Standard",
    advanced: "Advanced",
    premium: "Premium",

    brandingContent: "Branding & content",
    includeLogo: "Include logo design",
    copyPages: "Copywriting pages",
    seoLevel: "SEO level",
    none: "None",
    basic: "Basic",
    standardShort: "Standard",
    advancedShort: "Advanced",

    mediaLang: "Media & languages",
    photoSessions: "Photography sessions",
    totalLanguages: "Total languages",
    firstLangNote: "First language included. Extras billed.",
    cmsTraining: "CMS training (hours)",

    carePlans: "Care plans",
    maintenancePlan: "Maintenance plan",
    hosting: "Hosting",

    reset: "Reset",
    seeTotal: "See total",

    estimate: "Estimate",
    oneOffSubtotal: "One-off subtotal",
    maintMonthly: "Maintenance (monthly)",
    hostMonthly: "Hosting (monthly)",
    firstMonthTotal: "First month total",
    disclaimer:
      "Disclaimer: This is a non-binding estimate. Adjust formulas to reflect your own rates & scope.",

    instant: "Instant",

    includesTitle: "This website includes",
    projectOneOff: "Project price (one-off)",
    monthlyOngoing: "Monthly price (ongoing)",
  },
  fi: {
    title: "Verkkosivulaskuri",
    subtitle:
      "Valitse tarpeet ja saat arvion heti. Hinnoittelulogiikkaa voi muokata koodista.",

    projectType: "Projektin tyyppi",
    informational: "Verkkosivusto",
    ecommerce: "Verkkokauppa",

    sizeComplexity: "Koko & kompleksisuus",
    pagesLabel: "Sivujen lukumäärä",
    designComplexity: "Ulkoasun kompleksisuus",
    simple: "Yksinkertainen",
    standard: "Tavallinen",
    advanced: "Edistynyt",
    premium: "Premium",

    brandingContent: "Brändi & sisältö",
    includeLogo: "Sisällytä logon suunnittelu",
    copyPages: "Copywriting-sivut",
    seoLevel: "SEO-taso",
    none: "Ei",
    basic: "Perus",
    standardShort: "Tavallinen",
    advancedShort: "Edistynyt",

    mediaLang: "Media & kielet",
    photoSessions: "Kuvaussessiot",
    totalLanguages: "Kieliä yhteensä",
    firstLangNote: "Ensimmäinen kieli sisältyy. Lisäkielet laskutetaan.",
    cmsTraining: "Koulutus (h)",

    carePlans: "Ylläpito",
    maintenancePlan: "Ylläpitosopimus",
    hosting: "Hostaus",

    reset: "Tyhjennä",
    seeTotal: "Näytä summa",

    estimate: "Arvio",
    oneOffSubtotal: "Projektikustannus",
    maintMonthly: "Ylläpito (kk)",
    hostMonthly: "Hostaus (kk)",
    firstMonthTotal: "Ensimmäisen kuun hinta yhteensä",
    disclaimer:
      "Huom: Tämä on suuntaa-antava arvio.",

    instant: "Heti",

    includesTitle: "Nämä asiat sivusto sisältää",
    projectOneOff: "Projektin hinta (kertakustannukset)",
    monthlyOngoing: "KK-hinta (jatkuvat kulut)",
  },
} as const;

function t(lang: Lang, key: keyof typeof dict["en"]) {
  return dict[lang][key] ?? key;
}

/** ─────────────────────────────────────────────────────────────
 *  Pricing formulas (muokkaa vapaasti)
 *  ────────────────────────────────────────────────────────────*/
const RATES = {
  baseWebsite: 5900,
  ecommerceAddon: 4500,
  pageDesign: 500,
  designComplexity: { simple: 1.0, standard: 1.25, advanced: 1.6, premium: 2.0 },
  logo: 1500,
  copywritingPerPage: 60,
  seoLevels: { none: 0, basic: 500, standard: 800, advanced: 1500 },
  photographySession: 220,
  multilingualPerLanguage: 180,
  cmsTrainingPerHour: 119,
  maintenance: { none: 0, basic: 199, pro: 399, enterprise: 699 },
  hosting: { none: 0, basic: 100, pro: 199, enterprise: 399 },
};

function currency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Page() {
  // Kielivalinta
  const [lang, setLang] = useState<Lang>("fi");
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("lang")) as Lang | null;
    if (saved === "en" || saved === "fi") setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
  }, [lang]);

  const [showSummary, setShowSummary] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSeeTotal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowSummary(true);
    // pieni viive että DOM ehtii renderöityä ennen scrollausta
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };


  // Laskurin inputit
  const [inputs, setInputs] = useState({
    websiteType: "basic" as "basic" | "ecommerce",
    pages: 5,
    complexity: "standard" as keyof typeof RATES.designComplexity,
    logoNeeded: true,
    copywritingPages: 5,
    seoLevel: "standard" as keyof typeof RATES.seoLevels,
    photoSessions: 0,
    languages: 1,
    trainingHours: 2,
    maintenance: "basic" as keyof typeof RATES.maintenance,
    hosting: "pro" as keyof typeof RATES.hosting,
  });
  const update = (p: Partial<typeof inputs>) =>
    setInputs((prev) => ({ ...prev, ...p }));

  // Erittely
  const breakdown = useMemo(() => {
    const isEcom = inputs.websiteType === "ecommerce";
    const base = RATES.baseWebsite + (isEcom ? RATES.ecommerceAddon : 0);
    const pages = Math.max(1, inputs.pages);
    const pageCost =
      pages * RATES.pageDesign * RATES.designComplexity[inputs.complexity];
    const logo = inputs.logoNeeded ? RATES.logo : 0;
    const copy =
      Math.max(0, inputs.copywritingPages) * RATES.copywritingPerPage;
    const seo = RATES.seoLevels[inputs.seoLevel];
    const photos =
      Math.max(0, inputs.photoSessions) * RATES.photographySession;
    const extraLangs =
      Math.max(0, inputs.languages - 1) * RATES.multilingualPerLanguage;
    const training =
      Math.max(0, inputs.trainingHours) * RATES.cmsTrainingPerHour;

    const oneOffSubtotal =
      base + pageCost + logo + copy + seo + photos + extraLangs + training;

    const maintMonthly = RATES.maintenance[inputs.maintenance];
    const hostMonthly = RATES.hosting[inputs.hosting];
    const grandTotalFirstMonth =
      oneOffSubtotal + maintMonthly + hostMonthly;

    return {
      items: [
        {
          label: isEcom
            ? "Base website + e-commerce add-on"
            : "Base website",
          amount: base,
        },
        {
          label: `Pages × complexity (${pages} × ${
            RATES.designComplexity[inputs.complexity]
          }×)`,
          amount: pageCost,
        },
        inputs.logoNeeded && { label: "Logo design", amount: logo },
        inputs.copywritingPages > 0 && {
          label: `Copywriting (${inputs.copywritingPages} pages)`,
          amount: copy,
        },
        inputs.seoLevel !== "none" && {
          label: `SEO package (${inputs.seoLevel})`,
          amount: seo,
        },
        inputs.photoSessions > 0 && {
          label: `Photography (${inputs.photoSessions} session${
            inputs.photoSessions === 1 ? "" : "s"
          })`,
          amount: photos,
        },
        inputs.languages > 1 && {
          label: `Multilingual (${
            inputs.languages - 1
          } extra language${inputs.languages - 1 === 1 ? "" : "s"})`,
          amount: extraLangs,
        },
        inputs.trainingHours > 0 && {
          label: `CMS training (${inputs.trainingHours} h)`,
          amount: training,
        },
      ].filter(Boolean) as { label: string; amount: number }[],
      oneOffSubtotal,
      maintMonthly,
      hostMonthly,
      grandTotalFirstMonth,
    };
  }, [inputs]);

  const reset = () =>
    setInputs({
      websiteType: "basic",
      pages: 5,
      complexity: "standard",
      logoNeeded: true,
      copywritingPages: 5,
      seoLevel: "standard",
      photoSessions: 0,
      languages: 1,
      trainingHours: 2,
      maintenance: "basic",
      hosting: "pro",
    });

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_420px] gap-8">
        {/* Header + kielivalitsin */}
        <header className="lg:col-span-2 flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {t(lang, "title")}
            </h1>
            <p className="text-white/70 mt-2">{t(lang, "subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLang("fi")}
              className={`px-3 py-1.5 rounded-full border text-sm ${
                lang === "fi"
                  ? "border-purple-400 bg-purple-500/10 text-purple-200"
                  : "border-white/15 text-white/90 hover:bg-white/5"
              }`}
              aria-pressed={lang === "fi"}
            >
              FI
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-full border text-sm ${
                lang === "en"
                  ? "border-purple-400 bg-purple-500/10 text-purple-200"
                  : "border-white/15 text-white/90 hover:bg-white/5"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </header>

        {/* LEFT: Form */}
        <section className="glass p-6 md:p-8 space-y-8">
          {/* Project type */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {t(lang, "projectType")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "basic", label: t(lang, "informational") },
                { key: "ecommerce", label: t(lang, "ecommerce") },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => update({ websiteType: opt.key as any })}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    inputs.websiteType === opt.key
                      ? "border-purple-400 bg-purple-500/10 text-purple-200"
                      : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size & complexity */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {t(lang, "sizeComplexity")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "pagesLabel")}
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={inputs.pages}
                  onChange={(e) => update({ pages: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: "#7c3aed" }}
                />
                <div className="mt-1 text-sm text-white/70">
                  {inputs.pages} page{inputs.pages === 1 ? "" : "s"}
                </div>
              </div>

              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "designComplexity")}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["simple", "standard", "advanced", "premium"] as const).map(
                    (key) => (
                      <button
                        key={key}
                        onClick={() => update({ complexity: key })}
                        className={`px-3 py-2 rounded-xl border text-sm capitalize ${
                          inputs.complexity === key
                            ? "border-purple-400 bg-purple-500/10 text-purple-200"
                            : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                        }`}
                      >
                        {t(lang, key as any)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Branding & content */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {t(lang, "brandingContent")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <input
                  id="logo"
                  type="checkbox"
                  className="w-4 h-4"
                  style={{ accentColor: "#7c3aed" }}
                  checked={inputs.logoNeeded}
                  onChange={(e) => update({ logoNeeded: e.target.checked })}
                />
                <label htmlFor="logo" className="text-sm text-gray-200">
                  {t(lang, "includeLogo")}
                </label>
              </div>
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "copyPages")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={inputs.copywritingPages}
                  onChange={(e) =>
                    update({ copywritingPages: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "seoLevel")}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["none", "basic", "standard", "advanced"] as const).map(
                    (key) => (
                      <button
                        key={key}
                        onClick={() => update({ seoLevel: key })}
                        className={`px-3 py-2 rounded-xl border text-sm capitalize ${
                          inputs.seoLevel === key
                            ? "border-purple-400 bg-purple-500/10 text-purple-200"
                            : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                        }`}
                      >
                        {/* localize button labels */}
                        {key === "none"
                          ? t(lang, "none")
                          : key === "basic"
                          ? t(lang, "basic")
                          : key === "standard"
                          ? t(lang, "standardShort")
                          : t(lang, "advancedShort")}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media & languages */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {t(lang, "mediaLang")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "photoSessions")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={inputs.photoSessions}
                  onChange={(e) =>
                    update({ photoSessions: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "totalLanguages")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={inputs.languages}
                  onChange={(e) =>
                    update({ languages: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
                />
                <p className="text-xs text-white/60 mt-1">
                  {t(lang, "firstLangNote")}
                </p>
              </div>
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "cmsTraining")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={inputs.trainingHours}
                  onChange={(e) =>
                    update({ trainingHours: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Care plans */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {t(lang, "carePlans")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "maintenancePlan")}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.keys(RATES.maintenance).map((key) => (
                    <button
                      key={key}
                      onClick={() => update({ maintenance: key as any })}
                      className={`px-3 py-2 rounded-full border text-sm capitalize ${
                        inputs.maintenance === key
                          ? "border-purple-400 bg-purple-500/10 text-purple-200"
                          : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80">
                  {t(lang, "hosting")}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.keys(RATES.hosting).map((key) => (
                    <button
                      key={key}
                      onClick={() => update({ hosting: key as any })}
                      className={`px-3 py-2 rounded-full border text-sm capitalize ${
                        inputs.hosting === key
                          ? "border-purple-400 bg-purple-500/10 text-purple-200"
                          : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl border border-white/15 bg-white/0 text-white hover:bg-white/5 active:scale-[.99]"
            >
              {t(lang, "reset")}
            </button>
            <button
  onClick={handleSeeTotal}
  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 active:scale-[.99]"
>
  {t(lang, "seeTotal")}
</button>
          </div>
        </section>

        {/* RIGHT: Summary */}
        <aside
          id="result"
          className="glass self-start lg:sticky lg:top-8 p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{t(lang, "estimate")}</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-200 border border-purple-400/30">
              {t(lang, "instant")}
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {breakdown.items.map((row, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="text-white/90">{row.label}</span>
                <span className="font-medium">{currency(row.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-white/10 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              {t(lang, "oneOffSubtotal")}
            </span>
            <span className="text-2xl font-bold">
              {currency(breakdown.oneOffSubtotal)}
            </span>
          </div>

          <div className="mt-4 space-y-1 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span>{t(lang, "maintMonthly")}</span>
              <span>{currency(breakdown.maintMonthly)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t(lang, "hostMonthly")}</span>
              <span>{currency(breakdown.hostMonthly)}</span>
            </div>
          </div>

          <div className="h-px bg-white/10 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              {t(lang, "firstMonthTotal")}
            </span>
            <span className="text-3xl font-extrabold tracking-tight">
              {currency(breakdown.grandTotalFirstMonth)}
            </span>
          </div>

          <p className="text-xs text-white/60 mt-4">
            {t(lang, "disclaimer")}
          </p>
        </aside>


      </div>
      {showSummary && (
  <div ref={bottomRef} className="w-full max-w-6xl mx-auto mt-8 px-4 lg:px-0">
    <section className="glass p-6 md:p-8 space-y-6 relative">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{t(lang, "includesTitle")}</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-200 border border-purple-400/30">
          {t(lang, "instant")}
        </span>
      </div>

      {/* Sama erittelylista kuin oikealla */}
      <ul className="space-y-2">
        {breakdown.items.map((row, i) => (
          <li key={i} className="flex items-baseline justify-between gap-4">
            <span className="text-white/90">{row.label}</span>
            <span className="font-medium">{currency(row.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="h-px bg-white/10" />

      {/* Hintajako */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{t(lang, "projectOneOff")}</span>
            <span className="text-2xl font-bold">{currency(breakdown.oneOffSubtotal)}</span>
          </div>
          <p className="text-xs text-white/60 mt-1">{t(lang, "oneOffSubtotal")}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{t(lang, "monthlyOngoing")}</span>
            <span className="text-xl font-semibold">
              {currency(breakdown.maintMonthly + breakdown.hostMonthly)}
            </span>
          </div>
          <div className="text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span>{t(lang, "maintMonthly")}</span>
              <span>{currency(breakdown.maintMonthly)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t(lang, "hostMonthly")}</span>
              <span>{currency(breakdown.hostMonthly)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <div className="flex items-center justify-between">
        <span className="text-white font-medium">{t(lang, "firstMonthTotal")}</span>
        <span className="text-3xl font-extrabold tracking-tight">
          {currency(breakdown.grandTotalFirstMonth)}
        </span>
      </div>

      <p className="text-xs text-white/60">{t(lang, "disclaimer")}</p>
    </section>
  </div>
)}
    </div>
  );
}
