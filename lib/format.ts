const eurFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-GB", {
  style: "percent",
  maximumFractionDigits: 0,
});

const percentFormatter1dp = new Intl.NumberFormat("en-GB", {
  style: "percent",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 2,
});

export const formatEUR = (n: number): string => eurFormatter.format(n);

// Deterministic compact EUR formatter — avoids Intl compact-notation
// drift between Node ICU and browser ICU (server "€70.0k" vs client "€70.0K").
export const formatEURCompact = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    const rendered = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `${sign}€${rendered}M`;
  }
  if (abs >= 1_000) {
    return `${sign}€${Math.round(abs / 1_000)}k`;
  }
  return `${sign}€${Math.round(abs)}`;
};

export const formatPercent = (n: number): string => percentFormatter.format(n);

export const formatPercent1dp = (n: number): string => percentFormatter1dp.format(n);

export const formatNumber = (n: number): string => numberFormatter.format(n);

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// ISO 3166-1 alpha-2 → flag emoji via regional indicator symbols.
// "EU" maps via the same formula to 🇪🇺 (officially a user-assigned code).
export const isoToFlag = (iso: string): string => {
  if (iso.length !== 2) return "";
  const codePoints = iso
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
};
