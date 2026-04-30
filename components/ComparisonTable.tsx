"use client";

import { useMemo, useState } from "react";
import { Section } from "./ui/Section";
import { Controls } from "./ui/Controls";
import { useHighlight } from "./ui/HighlightContext";
import { cities, eurPerEuroNet, realNetPpp, type CityData } from "@/lib/data";
import { formatEUR, formatPercent, formatNumber } from "@/lib/format";

type SortKey =
  | "net"
  | "employerCost"
  | "taxCollected"
  | "wedge"
  | "eurPerEuroNet"
  | "realNet";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "net", label: "Net" },
  { value: "employerCost", label: "Employer cost" },
  { value: "taxCollected", label: "Tax collected" },
  { value: "wedge", label: "Wedge %" },
  { value: "eurPerEuroNet", label: "€ per €1 net" },
  { value: "realNet", label: "Real net (PPP)" },
];

export function ComparisonTable() {
  const { salary, profile, hoveredSlug, setHoveredSlug } = useHighlight();
  const [sortKey, setSortKey] = useState<SortKey>("net");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...cities];
    arr.sort((a, b) => compareCities(a, b, sortKey, salary, profile));
    if (sortDir === "asc") arr.reverse();
    return arr;
  }, [sortKey, sortDir, salary, profile]);

  return (
    <Section
      id="table"
      eyebrow="Master comparison"
      title="The whole table, sortable."
      lede="Pick a salary point and family profile up top; sort the table by any column. Hover a row to highlight that city in every chart below."
    >
      <div className="space-y-4">
        <Controls />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-key"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Sort by
            </label>
            <select
              id="sort-key"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              aria-label={`Sort ${sortDir === "desc" ? "ascending" : "descending"}`}
            >
              {sortDir === "desc" ? "↓" : "↑"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            13 entries · 12 cities + EU aggregate · all values in EUR
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3">City</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3 text-right">Employer cost</th>
                <th className="px-4 py-3 text-right">Tax collected</th>
                <th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3 text-right">Wedge</th>
                <th className="px-4 py-3 text-right">€ / €1 net</th>
                <th className="px-4 py-3 text-right">Real net (PPP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((city) => {
                const cell = city.salaries[salary][profile];
                const realNet = realNetPpp(cell, city.col);
                const eurPerNet = eurPerEuroNet(cell);
                const isHovered = hoveredSlug === city.name;
                const isAggregate = city.isAggregate ?? false;
                return (
                  <tr
                    key={city.name}
                    onMouseEnter={() => setHoveredSlug(city.name)}
                    onMouseLeave={() => setHoveredSlug(null)}
                    onFocus={() => setHoveredSlug(city.name)}
                    onBlur={() => setHoveredSlug(null)}
                    tabIndex={0}
                    className={`cursor-default outline-none transition-colors ${
                      isHovered ? "bg-amber-50" : "hover:bg-slate-50"
                    } ${isAggregate ? "italic text-slate-500" : "text-slate-700"}`}
                  >
                    <td
                      className={`sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-medium ${
                        isHovered
                          ? "bg-amber-50 text-amber-900"
                          : isAggregate
                            ? "bg-white"
                            : "bg-white text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {city.name}
                        {isAggregate && (
                          <span className="rounded-full border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            agg
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{city.country}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatEUR(cell.employerCost)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatEUR(cell.taxCollected)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {formatEUR(cell.net)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPercent(cell.wedge)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      €{formatNumber(eurPerNet)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatEUR(realNet)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

function compareCities(
  a: CityData,
  b: CityData,
  key: SortKey,
  salary: 70000 | 100000 | 150000 | 200000 | 250000,
  profile: "single" | "family",
): number {
  const ac = a.salaries[salary][profile];
  const bc = b.salaries[salary][profile];
  switch (key) {
    case "net":
      return bc.net - ac.net;
    case "employerCost":
      return bc.employerCost - ac.employerCost;
    case "taxCollected":
      return bc.taxCollected - ac.taxCollected;
    case "wedge":
      return bc.wedge - ac.wedge;
    case "eurPerEuroNet":
      return eurPerEuroNet(bc) - eurPerEuroNet(ac);
    case "realNet":
      return realNetPpp(bc, b.col) - realNetPpp(ac, a.col);
  }
}
