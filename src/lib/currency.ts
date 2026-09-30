export type Currency = { code: string; symbol: string; locale: string };

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "AUD", symbol: "A$", locale: "en-AU" },
  { code: "EUR", symbol: "\u20AC", locale: "de-DE" },
  { code: "GBP", symbol: "\u00A3", locale: "en-GB" },
];

const SUPPORTED_MAP: Record<string, Currency> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

// legacy location map for old tickets without currency (fallback)
const LOCATION_MAP: Record<string, Currency> = {
  amsterdam: SUPPORTED_MAP["EUR"],
  rotterdam: SUPPORTED_MAP["EUR"],
  brussels: SUPPORTED_MAP["EUR"],
  antwerp: SUPPORTED_MAP["EUR"],
  paris: SUPPORTED_MAP["EUR"],
  berlin: SUPPORTED_MAP["EUR"],
  budapest: { code: "EUR", symbol: "\u20AC", locale: "hu-HU" },
  london: SUPPORTED_MAP["GBP"],
  manchester: SUPPORTED_MAP["GBP"],
  uk: SUPPORTED_MAP["GBP"],
  england: SUPPORTED_MAP["GBP"],
  sydney: SUPPORTED_MAP["AUD"],
  melbourne: SUPPORTED_MAP["AUD"],
  australia: SUPPORTED_MAP["AUD"],
};

export function currencyFromCode(code?: string | null): Currency | null {
  if (!code) return null;
  const k = String(code).trim().toUpperCase();
  return SUPPORTED_MAP[k] || null;
}

export function currencyForLocation(city?: string | null, location?: string | null): Currency {
  const key = `${city || ""} ${location || ""}`.toLowerCase();
  for (const [k, v] of Object.entries(LOCATION_MAP)) if (key.includes(k)) return v;
  if (typeof navigator !== "undefined" && navigator.language) {
    const lang = navigator.language.toLowerCase();
    if (lang.includes("en-gb")) return SUPPORTED_MAP["GBP"];
    if (lang.includes("en-au")) return SUPPORTED_MAP["AUD"];
  }
  return SUPPORTED_MAP["EUR"];
}

export function formatPrice(
  price: number | null | undefined,
  city?: string | null,
  location?: string | null,
  currencyCode?: string | null
): string {
  if (price == null || isNaN(Number(price))) return " - ";
  let c: Currency | null = currencyFromCode(currencyCode) || null;
  if (!c) c = currencyForLocation(city, location);
  try {
    return new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, maximumFractionDigits: 2 }).format(Number(price));
  } catch {
    return `${c.symbol}${Number(price).toFixed(2)}`;
  }
}

// convenience when you have ticket.currency directly
export function formatPriceWithCurrency(price: number | null | undefined, currencyCode?: string | null): string {
  return formatPrice(price, null, null, currencyCode);
}
