export type Currency = { code: string; symbol: string; locale: string };

const MAP: Record<string, Currency> = {
  "amsterdam": { code: "EUR", symbol: "€", locale: "nl-NL" },
  "rotterdam": { code: "EUR", symbol: "€", locale: "nl-NL" },
  "brussels": { code: "EUR", symbol: "€", locale: "fr-BE" },
  "antwerp": { code: "EUR", symbol: "€", locale: "nl-BE" },
  "paris": { code: "EUR", symbol: "€", locale: "fr-FR" },
  "berlin": { code: "EUR", symbol: "€", locale: "de-DE" },
  "budapest": { code: "HUF", symbol: "Ft", locale: "hu-HU" },
  "hungary": { code: "HUF", symbol: "Ft", locale: "hu-HU" },
  "london": { code: "GBP", symbol: "£", locale: "en-GB" },
  "manchester": { code: "GBP", symbol: "£", locale: "en-GB" },
  "uk": { code: "GBP", symbol: "£", locale: "en-GB" },
  "england": { code: "GBP", symbol: "£", locale: "en-GB" },
  "new york": { code: "USD", symbol: "$", locale: "en-US" },
  "los angeles": { code: "USD", symbol: "$", locale: "en-US" },
  "usa": { code: "USD", symbol: "$", locale: "en-US" },
  "united states": { code: "USD", symbol: "$", locale: "en-US" },
  "tokyo": { code: "JPY", symbol: "¥", locale: "ja-JP" },
  "japan": { code: "JPY", symbol: "¥", locale: "ja-JP" },
};

export function currencyForLocation(city?: string | null, location?: string | null): Currency {
  const key = `${city || ""} ${location || ""}`.toLowerCase();
  for (const [k, v] of Object.entries(MAP)) {
    if (key.includes(k)) return v;
  }
  // fallback to browser locale
  if (typeof navigator !== "undefined" && navigator.language) {
    const lang = navigator.language.toLowerCase();
    if (lang.includes("en-gb")) return { code: "GBP", symbol: "£", locale: "en-GB" };
    if (lang.includes("en-us")) return { code: "USD", symbol: "$", locale: "en-US" };
    if (lang.includes("ja")) return { code: "JPY", symbol: "¥", locale: "ja-JP" };
    if (lang.includes("hu")) return { code: "HUF", symbol: "Ft", locale: "hu-HU" };
  }
  return { code: "EUR", symbol: "€", locale: "nl-NL" };
}

export function formatPrice(price: number | null | undefined, city?: string | null, location?: string | null): string {
  if (price == null || isNaN(Number(price))) return "—";
  const c = currencyForLocation(city, location);
  try {
    return new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, maximumFractionDigits: c.code === "JPY" || c.code === "HUF" ? 0 : 2 }).format(Number(price));
  } catch {
    return `${c.symbol}${Number(price).toFixed(2)}`;
  }
}
