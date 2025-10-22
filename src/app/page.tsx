"use client";
import React, { useMemo, useState } from "react";

// Web Design Price Calculator – Odoo-style clone (customizable formulas)
// --------------------------------------------------------------
// Notes:
// - This variant aims to mimic the Odoo calculator layout & feel:
//   left column with grouped sections + right sticky summary card,
//   pill radios, subtle borders, large total with badge-like hints.
// - Uses a brand-ish accent similar to Odoo (purple tone) via Tailwind classes.
//   Adjust the "accent" classes below if you have a Tailwind theme.

// -----------------
// PRICING FORMULAS
// -----------------
// Tweak these numbers to your actual business logic.
const RATES = {
  baseWebsite: 600,           // base price for a simple website
  ecommerceAddon: 900,        // add-on if e-commerce is selected
  pageDesign: 120,            // per page design/implementation
  designComplexity: {         // multiplier for complexity
    simple: 1.0,
    standard: 1.25,
    advanced: 1.6,
    premium: 2.0,
  },
  logo: 350,                  // flat price if logo needed
  copywritingPerPage: 60,     // per page copywriting
  seoLevels: {                // SEO package flat price
    none: 0,
    basic: 250,
    standard: 450,
    advanced: 850,
  },
  photographySession: 220,    // per photo session
  multilingualPerLanguage: 180, // per extra language (not counting the first)
  cmsTrainingPerHour: 85,     // per hour of CMS training
  maintenance: {              // monthly maintenance plan (we'll show monthly + annualized)
    none: 0,
    basic: 49,
    pro: 129,
    enterprise: 299,
  },
  hosting: {                  // monthly hosting (informational)
    none: 0,
    basic: 12,
    pro: 24,
    enterprise: 59,
  },
};

function currency(n: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export default function WebDesignCalculator() {
  const [inputs, setInputs] = useState({
    websiteType: "basic" as "basic" | "ecommerce",
    pages: 5,
    complexity: "standard" as keyof typeof RATES.designComplexity,
    logoNeeded: true,
    copywritingPages: 5,
    seoLevel: "standard" as keyof typeof RATES.seoLevels,
    photoSessions: 0,
    languages: 1, // total languages; first is included, extras billed
    trainingHours: 2,
    maintenance: "basic" as keyof typeof RATES.maintenance,
    hosting: "pro" as keyof typeof RATES.hosting,
  });

  const update = (patch: Partial<typeof inputs>) => setInputs(prev => ({ ...prev, ...patch }));

  const breakdown = useMemo(() => {
    const isEcom = inputs.websiteType === "ecommerce";

    const base = RATES.baseWebsite + (isEcom ? RATES.ecommerceAddon : 0);
    const pages = Math.max(1, inputs.pages);
    const pageCost = pages * RATES.pageDesign * RATES.designComplexity[inputs.complexity];

    const logo = inputs.logoNeeded ? RATES.logo : 0;
    const copy = Math.max(0, inputs.copywritingPages) * RATES.copywritingPerPage;
    const seo = RATES.seoLevels[inputs.seoLevel];
    const photos = Math.max(0, inputs.photoSessions) * RATES.photographySession;
    const extraLangs = Math.max(0, inputs.languages - 1) * RATES.multilingualPerLanguage;
    const training = Math.max(0, inputs.trainingHours) * RATES.cmsTrainingPerHour;

    const oneOffSubtotal = base + pageCost + logo + copy + seo + photos + extraLangs + training;

    const maintMonthly = RATES.maintenance[inputs.maintenance];
    const hostMonthly = RATES.hosting[inputs.hosting];

    const grandTotalFirstMonth = oneOffSubtotal + maintMonthly + hostMonthly;

    return {
      items: [
        { label: isEcom ? "Base website + e‑commerce add‑on" : "Base website", amount: base },
        { label: `Pages × complexity (${pages} × ${RATES.designComplexity[inputs.complexity]}×)`, amount: pageCost },
        inputs.logoNeeded && { label: "Logo design", amount: logo },
        inputs.copywritingPages > 0 && { label: `Copywriting (${inputs.copywritingPages} pages)`, amount: copy },
        inputs.seoLevel !== "none" && { label: `SEO package (${inputs.seoLevel})`, amount: seo },
        inputs.photoSessions > 0 && { label: `Photography (${inputs.photoSessions} session${inputs.photoSessions===1?"":"s"})`, amount: photos },
        inputs.languages > 1 && { label: `Multilingual (${inputs.languages-1} extra language${inputs.languages-1===1?"":"s"})`, amount: extraLangs },
        inputs.trainingHours > 0 && { label: `CMS training (${inputs.trainingHours} h)`, amount: training },
      ].filter(Boolean) as {label: string; amount: number}[],
      oneOffSubtotal,
      maintMonthly,
      hostMonthly,
      grandTotalFirstMonth,
    };
  }, [inputs]);

  const reset = () => setInputs({
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
    <div className="min-h-screen w-full bg-wave-dark flex flex-col items-center py-10 px-4 text-white">
      <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_420px] gap-8">
        <header className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Website Quote Calculator</h1>
          <p className="text-gray-300 mt-2">Select your needs to get an instant estimate. Pricing logic is adjustable in code.</p>
        </header>

        {/* LEFT: Form */}
        <section className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 md:p-8 space-y-8">
          {/* Group: Project Type */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Project type</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "basic", label: "Informational" },
                { key: "ecommerce", label: "E‑commerce" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => update({ websiteType: opt.key as any })}
                  className={
                    `px-4 py-2 rounded-full border text-sm transition ${
                      inputs.websiteType === opt.key
                        ? "border-purple-400 bg-purple-300/20 text-purple-200"
                        : "border-white/20 bg-white/10 hover:bg-white/20"
                    }`
                  }
                >{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Group: Size & complexity */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-200">Number of pages</label>
              <input
                type="range"
                min={1}
                max={30}
                value={inputs.pages}
                onChange={(e) => update({ pages: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
              <div className="mt-1 text-sm text-gray-300">{inputs.pages} page{inputs.pages===1?"":"s"}</div>
            </div>

            <div>
              <label className="text-sm text-gray-200">Design complexity</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["simple","standard","advanced","premium"] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => update({ complexity: key })}
                    className={
                      `px-3 py-2 rounded-xl border text-sm capitalize ${
                        inputs.complexity === key
                          ? "border-purple-400 bg-purple-300/20 text-purple-200"
                          : "border-white/20 bg-white/10 hover:bg-white/20"
                      }`
                    }
                  >{key}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Group: Branding & content */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <input id="logo" type="checkbox" className="w-4 h-4 accent-purple-400" checked={inputs.logoNeeded} onChange={(e)=>update({logoNeeded:e.target.checked})} />
              <label htmlFor="logo" className="text-sm text-gray-200">Include logo design</label>
            </div>
            <div>
              <label className="text-sm text-gray-200">Copywriting pages</label>
              <input type="number" min={0} value={inputs.copywritingPages} onChange={(e)=>update({copywritingPages:Number(e.target.value)})} className="mt-1 w-full border border-white/20 bg-white/5 rounded-xl px-3 py-2 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="text-sm text-gray-200">SEO level</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["none","basic","standard","advanced"] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => update({ seoLevel: key })}
                    className={`px-3 py-2 rounded-xl border text-sm capitalize ${inputs.seoLevel===key?"border-purple-400 bg-purple-300/20 text-purple-200":"border-white/20 bg-white/10 hover:bg-white/20"}`}
                  >{key}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Group: Media & languages */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-200">Photography sessions</label>
              <input type="number" min={0} value={inputs.photoSessions} onChange={(e)=>update({photoSessions:Number(e.target.value)})} className="mt-1 w-full border border-white/20 bg-white/5 rounded-xl px-3 py-2 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="text-sm text-gray-200">Total languages</label>
              <input type="number" min={1} value={inputs.languages} onChange={(e)=>update({languages:Number(e.target.value)})} className="mt-1 w-full border border-white/20 bg-white/5 rounded-xl px-3 py-2 placeholder:text-gray-400" />
              <p className="text-xs text-gray-300 mt-1">First language included. Extras billed.</p>
            </div>
            <div>
              <label className="text-sm text-gray-200">CMS training (hours)</label>
              <input type="number" min={0} value={inputs.trainingHours} onChange={(e)=>update({trainingHours:Number(e.target.value)})} className="mt-1 w-full border border-white/20 bg-white/5 rounded-xl px-3 py-2 placeholder:text-gray-400" />
            </div>
          </div>

          {/* Group: Care plans */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-200">Maintenance plan</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(RATES.maintenance).map((key) => (
                  <button key={key}
                    onClick={()=>update({maintenance: key as any})}
                    className={`px-3 py-2 rounded-full border text-sm capitalize ${inputs.maintenance===key?"border-purple-400 bg-purple-300/20 text-purple-200":"border-white/20 bg-white/10 hover:bg-white/20"}`}
                  >{key}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-200">Hosting</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(RATES.hosting).map((key) => (
                  <button key={key}
                    onClick={()=>update({hosting: key as any})}
                    className={`px-3 py-2 rounded-full border text-sm capitalize ${inputs.hosting===key?"border-purple-400 bg-purple-300/20 text-purple-200":"border-white/20 bg-white/10 hover:bg-white/20"}`}
                  >{key}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={reset} className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 active:scale-[.99]">Reset</button>
            <a href="#result" className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 active:scale-[.99]">See total</a>
          </div>
        </section>

        {/* RIGHT: Sticky Summary */}
        <aside id="result" className="self-start lg:sticky lg:top-8 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 md:p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">Estimate</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Instant</span>
          </div>

          <ul className="mt-4 space-y-2">
            {breakdown.items.map((row, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4">
                <span className="text-gray-200">{row.label}</span>
                <span className="font-medium">{currency(row.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-white/10 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-gray-100 font-medium">One‑off subtotal</span>
            <span className="text-2xl font-bold">{currency(breakdown.oneOffSubtotal)}</span>
          </div>

          <div className="mt-4 space-y-1 text-sm text-gray-200">
            <div className="flex items-center justify-between">
              <span>Maintenance (monthly)</span>
              <span>{currency(breakdown.maintMonthly)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hosting (monthly)</span>
              <span>{currency(breakdown.hostMonthly)}</span>
            </div>
          </div>

          <div className="h-px bg-white/10 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-gray-100 font-medium">First month total</span>
            <span className="text-3xl font-extrabold tracking-tight">{currency(breakdown.grandTotalFirstMonth)}</span>
          </div>

          <p className="text-xs text-gray-300 mt-4">Disclaimer: This is a non‑binding estimate. Adjust formulas to reflect your own rates & scope.</p>
        </aside>

        <footer className="lg:col-span-2 text-center text-sm text-gray-300 pt-2">
          <p>
            Built as an Odoo‑style calculator demo. You can theme it further via Tailwind config (use brand purple accents).
          </p>
        </footer>
      </div>
    </div>
  );
}
