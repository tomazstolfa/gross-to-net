"use client";

import { useMemo, useState } from "react";
import { Section } from "./ui/Section";
import { Controls } from "./ui/Controls";
import { useHighlight } from "./ui/HighlightContext";
import {
  cities,
  eurPerEuroNet,
  realNetPpp,
  type CityData,
  type SalaryPoint,
} from "@/lib/data";
import { formatEUR, formatPercent, formatNumber, isoToFlag } from "@/lib/format";

type SortKey =
  | "name"
  | "country"
  | "net"
  | "employerCost"
  | "taxCollected"
  | "wedge"
  | "eurPerEuroNet"
  | "realNet";

type SortDir = "asc" | "desc";

type ColumnDef = {
  key: SortKey;
  label: string;
  align?: "left" | "right";
  defaultDir: SortDir;
};

const COLUMNS: ColumnDef[] = [
  { key: "name", label: "City", align: "left", defaultDir: "asc" },
  { key: "country", label: "Country", align: "left", defaultDir: "asc" },
  { key: "employerCost", label: "Employer cost", align: "right", defaultDir: "desc" },
  { key: "net", label: "Net", align: "right", defaultDir: "desc" },
  { key: "taxCollected", label: "Tax collected", align: "right", defaultDir: "desc" },
  { key: "wedge", label: "Wedge", align: "right", defaultDir: "desc" },
  { key: "eurPerEuroNet", label: "€ / €1 net", align: "right", defaultDir: "desc" },
  { key: "realNet", label: "Real net (PPP)", align: "right", defaultDir: "desc" },
];

export function ComparisonTable() {
  const {
    salary,
    profile,
    hoveredSlug,
    selectedSlug,
    setHoveredSlug,
    setSelectedSlug,
  } = useHighlight();
  const [sortKey, setSortKey] = useState<SortKey>("net");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...cities];
    arr.sort((a, b) => compareCities(a, b, sortKey, salary, profile));
    if (sortDir === "asc") arr.reverse();
    return arr;
  }, [sortKey, sortDir, salary, profile]);

  const onHeaderClick = (col: ColumnDef) => {
    if (col.key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(col.key);
      setSortDir(col.defaultDir);
    }
  };

  return (
    <Section
      id="table"
      eyebrow="Comparison"
      title="Every city, every metric."
      lede="Click a column to sort, a row to pin. Pinned cities flow through every chart below."
    >
      <div className="space-y-4">
        <Controls />

        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                {COLUMNS.map((col, i) => {
                  const isActive = sortKey === col.key;
                  const ariaSort: "ascending" | "descending" | "none" = !isActive
                    ? "none"
                    : sortDir === "asc"
                      ? "ascending"
                      : "descending";
                  return (
                    <th
                      key={col.key}
                      aria-sort={ariaSort}
                      scope="col"
                      className={`select-none px-4 py-3 ${
                        col.align === "right" ? "text-right" : "text-left"
                      } ${i === 0 ? "sticky left-0 z-10 bg-stone-50" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => onHeaderClick(col)}
                        className={`group inline-flex items-center gap-1.5 ${
                          col.align === "right" ? "ml-auto" : ""
                        } cursor-pointer rounded transition hover:text-stone-900 ${
                          isActive ? "text-stone-900" : ""
                        }`}
                      >
                        <span>{col.label}</span>
                        <SortIndicator active={isActive} dir={sortDir} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sorted.map((city) => {
                const cell = city.salaries[salary][profile];
                const realNet = realNetPpp(cell, city.col);
                const eurPerNet = eurPerEuroNet(cell);
                const isPinned = selectedSlug === city.name;
                const isHovered = hoveredSlug === city.name;
                const isAggregate = city.isAggregate ?? false;
                const rowBase = isPinned
                  ? "bg-emerald-50 ring-2 ring-inset ring-emerald-400"
                  : isHovered
                    ? "bg-stone-100"
                    : "hover:bg-stone-50";
                const stickyBg = isPinned
                  ? "bg-emerald-50"
                  : isHovered
                    ? "bg-stone-100"
                    : "bg-white";
                return (
                  <tr
                    key={city.name}
                    onMouseEnter={() => setHoveredSlug(city.name)}
                    onMouseLeave={() => setHoveredSlug(null)}
                    onFocus={() => setHoveredSlug(city.name)}
                    onBlur={() => setHoveredSlug(null)}
                    onClick={() => setSelectedSlug(city.name)}
                    tabIndex={0}
                    aria-pressed={isPinned}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedSlug(city.name);
                      }
                    }}
                    className={`cursor-pointer outline-none transition-colors ${rowBase} ${
                      isAggregate ? "italic text-stone-500" : "text-stone-700"
                    }`}
                  >
                    <td
                      className={`sticky left-0 z-10 whitespace-nowrap px-4 py-3 font-medium ${stickyBg} ${
                        isPinned
                          ? "border-l-4 border-emerald-500 pl-3 text-stone-900"
                          : isHovered
                            ? "text-stone-900"
                            : isAggregate
                              ? ""
                              : "text-stone-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {city.name}
                        {isPinned && (
                          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            ★ pinned
                          </span>
                        )}
                        {isAggregate && (
                          <span className="rounded-full border border-stone-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                            agg
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-1.5" aria-hidden>
                        {isoToFlag(city.iso)}
                      </span>
                      {city.country}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatEUR(cell.employerCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-700">
                      {formatEUR(cell.net)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-700">
                      {formatEUR(cell.taxCollected)}
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

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span
        aria-hidden
        className="text-stone-300 transition group-hover:text-stone-500"
      >
        ↕
      </span>
    );
  }
  return (
    <span aria-hidden className="text-stone-700">
      {dir === "desc" ? "↓" : "↑"}
    </span>
  );
}

function compareCities(
  a: CityData,
  b: CityData,
  key: SortKey,
  salary: SalaryPoint,
  profile: "single" | "family",
): number {
  const ac = a.salaries[salary][profile];
  const bc = b.salaries[salary][profile];
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "country":
      return a.country.localeCompare(b.country);
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
