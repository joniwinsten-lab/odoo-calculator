"use client";
import React, { useMemo, useState } from "react";

// Web Design Price Calculator – Odoo-style clone (customizable formulas)
// --------------------------------------------------------------
// How to use in Next.js (App Router):
// 1) Create a new Next.js project: npx create-next-app@latest my-calculator --ts
// 2) Add Tailwind (follow Next.js + Tailwind guide) or use a CSS reset. This file uses Tailwind classes.
// 3) Create app/page.tsx and paste this component there OR import it into your page.
// 4) Deploy to Vercel. Adjust FORMULAS below to match your pricing.

// -----------------
// PRICING FORMULAS
// -----------------
// Tweak these numbers to your actual business logic.
const RATES = {
  baseWebsite: 2600,           // base price for a simple website
  ecommerceAddon: 2900,        // add-on if e-commerce is selected
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
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-6">
        <header className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Web Design Price Calculator</h1>
          <p className="text-gray-600 mt-2">Select options to estimate your project cost. Adjust formulas in code to match your pricing.</p>
        </header>

        {/* LEFT: Form */}
        <section className="bg-white rounded-2xl shadow p-5 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Project details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Website type */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Website type</label>
              <select
                className="border rounded-xl px-3 py-2"
                value={inputs.websiteType}
                onChange={(e) => update({ websiteType: e.target.value as any })}
              >
                <option value="basic">Informational</option>
                <option value="ecommerce">E‑commerce</option>
              </select>
            </div>

            {/* Pages */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Number of pages</label>
              <input
                type="number"
                min={1}
                className="border rounded-xl px-3 py-2"
                value={inputs.pages}
                onChange={(e) => update({ pages: Number(e.target.value) })}
              />
            </div>

            {/* Complexity */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Design complexity</label>
              <select
                className="border rounded-xl px-3 py-2"
                value={inputs.complexity}
                onChange={(e) => update({ complexity: e.target.value as any })}
              >
                <option value="simple">Simple</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-3 mt-6">
              <input
                id="logo"
                type="checkbox"
                className="size-4"
                checked={inputs.logoNeeded}
                onChange={(e) => update({ logoNeeded: e.target.checked })}
              />
              <label htmlFor="logo" className="text-sm text-gray-700">Include logo design</label>
            </div>

            {/* Copywriting */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Copywriting pages</label>
              <input
                type="number"
                min={0}
                className="border rounded-xl px-3 py-2"
                value={inputs.copywritingPages}
                onChange={(e) => update({ copywritingPages: Number(e.target.value) })}
              />
            </div>

            {/* SEO */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">SEO level</label>
              <select
                className="border rounded-xl px-3 py-2"
                value={inputs.seoLevel}
                onChange={(e) => update({ seoLevel: e.target.value as any })}
              >
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Photography */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Photography sessions</label>
              <input
                type="number"
                min={0}
                className="border rounded-xl px-3 py-2"
                value={inputs.photoSessions}
                onChange={(e) => update({ photoSessions: Number(e.target.value) })}
              />
            </div>

            {/* Languages */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Total languages</label>
              <input
                type="number"
                min={1}
                className="border rounded-xl px-3 py-2"
                value={inputs.languages}
                onChange={(e) => update({ languages: Number(e.target.value) })}
              />
            </div>

            {/* Training */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">CMS training (hours)</label>
              <input
                type="number"
                min={0}
                className="border rounded-xl px-3 py-2"
                value={inputs.trainingHours}
                onChange={(e) => update({ trainingHours: Number(e.target.value) })}
              />
            </div>

            {/* Maintenance */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Maintenance plan (monthly)</label>
              <select
                className="border rounded-xl px-3 py-2"
                value={inputs.maintenance}
                onChange={(e) => update({ maintenance: e.target.value as any })}
              >
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Hosting */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Hosting (monthly)</label>
              <select
                className="border rounded-xl px-3 py-2"
                value={inputs.hosting}
                onChange={(e) => update({ hosting: e.target.value as any })}
              >
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={reset} className="px-4 py-2 rounded-xl border hover:bg-gray-50 active:scale-[.99]">Reset</button>
            <a
              href="#result"
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 active:scale-[.99]"
            >See total</a>
          </div>
        </section>

        {/* RIGHT: Summary */}
        <aside id="result" className="bg-white rounded-2xl shadow p-5 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Estimate</h2>
          <ul className="space-y-2">
            {breakdown.items.map((row, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4">
                <span className="text-gray-700">{row.label}</span>
                <span className="font-medium">{currency(row.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-gray-200 my-4" />

          <div className="flex items-center justify-between">
            <span className="text-gray-800 font-medium">One‑off subtotal</span>
            <span className="text-xl font-semibold">{currency(breakdown.oneOffSubtotal)}</span>
          </div>

          <div className="mt-4 space-y-1 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Maintenance (monthly)</span>
              <span>{currency(breakdown.maintMonthly)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hosting (monthly)</span>
              <span>{currency(breakdown.hostMonthly)}</span>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          <div className="flex items-center justify-between">
            <span className="text-gray-800 font-medium">First month total (incl. monthly)</span>
            <span className="text-2xl font-bold">{currency(breakdown.grandTotalFirstMonth)}</span>
          </div>

          <p className="text-xs text-gray-500 mt-3">Disclaimer: This is a non‑binding estimate. Adjust formulas in code to reflect your rates and scope.</p>
        </aside>

        <footer className="lg:col-span-2 text-center text-sm text-gray-500 pt-2">
          <p>
            Built as an Odoo calculator look‑alike for demo purposes.
            Replace the formula constants (RATES) with your own logic.
          </p>
        </footer>
      </div>
    </div>
  );
}
