"use client";

import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { findCity, eurPerEuroNet } from "@/lib/data";
import { formatEUR, formatNumber, formatPercent } from "@/lib/format";

export function SloveniaPanel() {
  const { salary, profile } = useHighlight();
  const city = findCity("Ljubljana");
  if (!city) return null;
  const cell = city.salaries[salary][profile];
  const ratio = eurPerEuroNet(cell);

  return (
    <Section
      id="slovenia"
      eyebrow="Slovenia"
      title="A 50% bracket that starts early. No social-security ceiling."
      lede="Two structural choices push Slovenia's effective wedge above 60% on executive compensation. Most European systems cap social security somewhere; Slovenia does not."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            At a glance
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            For every <span className="text-amber-600">€1</span> a {profile} employee
            banks at {formatEUR(salary)} gross, the employer spends{" "}
            <span className="text-amber-600">€{formatNumber(ratio)}</span>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            That comes from {formatEUR(cell.employerCost)} of total employer outlay
            against {formatEUR(cell.net)} of net take-home — a wedge of{" "}
            {formatPercent(cell.wedge)}. Move the salary or profile control to watch
            the ratio shift; it stays above half across the range.
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-6 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Slovenia tax structure
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            {city.taxStructure.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="text-amber-600">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
