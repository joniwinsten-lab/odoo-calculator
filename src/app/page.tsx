"use client";
import React, { useMemo, useState } from "react";
<p className="text-red-500">Tailwind test: RED</p>


function currency(n: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

const RATES = {
  baseWebsite: 5000,
  ecommerceAddon: 2000,
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

export default function Page() {
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
  const update = (p: Partial<typeof inputs>) => setInputs(prev => ({ ...prev, ...p }));

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
        { label: isEcom ? "Base website + e-commerce add-on" : "Base website", amount: base },
        { label: `Pages × complexity (${pages} × ${RATES.designComplexity[inputs.complexity]}×)`, amount: pageCost },
        inputs.logoNeeded && { label: "Logo design", amount: logo },
        inputs.copywritingPages > 0 && { label: `Copywriting (${inputs.copywritingPages} pages)`, amount: copy },
        inputs.seoLevel !== "none" && { label: `SEO package (${inputs.seoLevel})`, amount: seo },
        inputs.photoSessions > 0 && { label: `Photography (${inputs.photoSessions} session${inputs.photoSessions===1?"":"s"})`, amount: photos },
        inputs.languages > 1 && { label: `Multilingual (${inputs.languages-1} extra language${inputs.languages-1===1?"":"s"})`, amount: extraLangs },
        inputs.trainingHours > 0 && { label: `CMS training (${inputs.trainingHours} h)`, amount: training },
      ].filter(Boolean) as {label: string; amount: number}[],
      oneOffSubtotal, maintMonthly, hostMonthly, grandTotalFirstMonth,
    };
  }, [inputs]);

  const reset = () => setInputs({
    websiteType: "basic", pages: 5, complexity: "standard", logoNeeded: true,
    copywritingPages: 5, seoLevel: "standard", photoSessions: 0, languages: 1,
    trainingHours: 2, maintenance: "basic", hosting: "pro",
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_420px] gap-8">
        <header className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Website Quote Calculator</h1>
          <p className="text-white/70 mt-2">Select your needs to get an instant estimate. Pricing logic is adjustable in code.</p>
        </header>

        {/* LEFT */}
        <section className="glass p-6 md:p-8 space-y-8">
          {/* Project type */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Project type</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "basic", label: "Informational" },
                { key: "ecommerce", label: "E-commerce" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => update({ websiteType: opt.key as any })}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    inputs.websiteType === opt.key
                      ? "border-purple-400 bg-purple-500/10 text-purple-200"
                      : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Size & complexity */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-white/80">Number of pages</label>
              <input
                type="range" min={1} max={30} value={inputs.pages}
                onChange={(e) => update({ pages: Number(e.target.value) })}
                className="w-full"
                style={{ accentColor: "#7c3aed" }} /* varma tapa */
              />
              <div className="mt-1 text-sm text-white/70">{inputs.pages} page{inputs.pages===1?"":"s"}</div>
            </div>

            <div>
              <label className="text-sm text-white/80">Design complexity</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["simple","standard","advanced","premium"] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => update({ complexity: key })}
                    className={`px-3 py-2 rounded-xl border text-sm capitalize ${
                      inputs.complexity === key
                        ? "border-purple-400 bg-purple-500/10 text-purple-200"
                        : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                    }`}
                  >{key}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Branding & content */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <input
                id="logo" type="checkbox"
                className="w-4 h-4"
                style={{ accentColor: "#7c3aed" }} /* varma tapa */
                checked={inputs.logoNeeded}
                onChange={(e)=>update({logoNeeded:e.target.checked})}
              />
              <label htmlFor="logo" className="text-sm text-gray-200">Include logo design</label>
            </div>
            <div>
              <label className="text-sm text-white/80">Copywriting pages</label>
              <input type="number" min={0} value={inputs.copywritingPages}
                onChange={(e)=>update({copywritingPages:Number(e.target.value)})}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80">SEO level</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["none","basic","standard","advanced"] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => update({ seoLevel: key })}
                    className={`px-3 py-2 rounded-xl border text-sm capitalize ${
                      inputs.seoLevel===key
                        ? "border-purple-400 bg-purple-500/10 text-purple-200"
                        : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                    }`}
                  >{key}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Media & languages */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-white/80">Photography sessions</label>
              <input type="number" min={0} value={inputs.photoSessions}
                onChange={(e)=>update({photoSessions:Number(e.target.value)})}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80">Total languages</label>
              <input type="number" min={1} value={inputs.languages}
                onChange={(e)=>update({languages:Number(e.target.value)})}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
              />
              <p className="text-xs text-white/60 mt-1">First language included. Extras billed.</p>
            </div>
            <div>
              <label className="text-sm text-white/80">CMS training (hours)</label>
              <input type="number" min={0} value={inputs.trainingHours}
                onChange={(e)=>update({trainingHours:Number(e.target.value)})}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Care plans */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-white/80">Maintenance plan</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(RATES.maintenance).map((key) => (
                  <button key={key} onClick={()=>update({maintenance: key as any})}
                    className={`px-3 py-2 rounded-full border text-sm capitalize ${
                      inputs.maintenance===key
                        ? "border-purple-400 bg-purple-500/10 text-purple-200"
                        : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                    }`}
                  >{key}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-white/80">Hosting</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(RATES.hosting).map((key) => (
                  <button key={key} onClick={()=>update({hosting: key as any})}
                    className={`px-3 py-2 rounded-full border text-sm capitalize ${
                      inputs.hosting===key
                        ? "border-purple-400 bg-purple-500/10 text-purple-200"
                        : "border-white/15 bg-white/0 text-white/90 hover:bg-white/5"
                    }`}
                  >{key}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={reset} className="px-4 py-2 rounded-xl border border-white/15 bg-white/0 text-white hover:bg-white/5 active:scale-[.99]">
              Reset
            </button>
            <a href="#result" className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 active:scale-[.99]">
              See total
            </a>
          </div>
        </section>

        {/* RIGHT */}
        <aside id="result" className="glass self-start lg:sticky lg:top-8 p-6 md:p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">Estimate</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-200 border border-purple-400/30">Instant</span>
          </div>

          <ul className="mt-4 space-y-2">
            {breakdown.items.map((row, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4">
                <span className="text-white/90">{row.label}</span>
                <span className="font-medium">{currency(row.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-white/10 my-6" />

          <div className="flex items-center justify-between">
            <span className="text-white font-medium">One-off subtotal</span>
            <span className="text-2xl font-bold">{currency(breakdown.oneOffSubtotal)}</span>
          </div>

          <div className="mt-4 space-y-1 text-sm text-white/80">
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
            <span className="text-white font-medium">First month total</span>
            <span className="text-3xl font-extrabold tracking-tight">{currency(breakdown.grandTotalFirstMonth)}</span>
          </div>

          <p className="text-xs text-white/60 mt-4">Disclaimer: This is a non-binding estimate. Adjust formulas to reflect your own rates & scope.</p>
        </aside>

        <footer className="lg:col-span-2 text-center text-sm text-white/60 pt-2">
          Built as an Odoo-style calculator demo.
        </footer>
      </div>
    </div>
  );
}
