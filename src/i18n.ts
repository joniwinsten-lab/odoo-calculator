export type Lang = "en" | "fi";

export const dict = {
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
    disclaimer: "Disclaimer: This is a non-binding estimate. Adjust formulas to reflect your own rates & scope.",

    instant: "Instant",
  },
  fi: {
    title: "Verkkosivulaskuri",
    subtitle: "Valitse tarpeet ja saat arvion heti. Hinnoittelulogiikkaa voi muokata koodista.",

    projectType: "Projektin tyyppi",
    informational: "Info-sivusto",
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

    mediaLang: "Media & kielet",
    photoSessions: "Kuvaussessiot",
    totalLanguages: "Kieliä yhteensä",
    firstLangNote: "Ensimmäinen kieli sisältyy. Lisäkielet laskutetaan.",
    cmsTraining: "CMS-koulutus (h)",

    carePlans: "Ylläpito",
    maintenancePlan: "Ylläpitosopimus",
    hosting: "Hostaus",

    reset: "Tyhjennä",
    seeTotal: "Näytä summa",

    estimate: "Arvio",
    oneOffSubtotal: "Kertaluontoinen välisumma",
    maintMonthly: "Ylläpito (kk)",
    hostMonthly: "Hostaus (kk)",
    firstMonthTotal: "Ensimmäisen kuun yhteensä",
    disclaimer: "Huom: Tämä on suuntaa-antava arvio. Muokkaa kaavoja omien hintojen mukaan.",

    instant: "Heti",
  },
} as const;

export function t(lang: Lang, key: keyof typeof dict["en"]) {
  return dict[lang][key] ?? key;
}
