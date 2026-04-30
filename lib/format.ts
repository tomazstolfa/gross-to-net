const eurFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurFormatterCompact = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
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

export const formatEURCompact = (n: number): string => eurFormatterCompact.format(n);

export const formatPercent = (n: number): string => percentFormatter.format(n);

export const formatPercent1dp = (n: number): string => percentFormatter1dp.format(n);

export const formatNumber = (n: number): string => numberFormatter.format(n);

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
