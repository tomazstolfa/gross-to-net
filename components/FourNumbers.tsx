"use client";

import { Section } from "./ui/Section";
import { Card } from "./ui/Card";
import { CityPicker } from "./ui/CityPicker";
import { useHighlight } from "./ui/HighlightContext";
import { findCity, eurPerEuroNet } from "@/lib/data";
import { formatEUR, formatPercent, formatNumber } from "@/lib/format";

const FALLBACK_CITY = "Ljubljana";

export function FourNumbers() {
  const { effectiveSlug, hoveredSlug, salary, profile } = useHighlight();
  const city = findCity(effectiveSlug) ?? findCity(FALLBACK_CITY)!;
  const cell = city.salaries[salary][profile];

  const cards = [
    {
      label: "Employer cost",
      value: formatEUR(cell.employerCost),
      blurb: "Total annual outlay. Gross salary plus the employer's share of social security.",
    },
    {
      label: "Tax collected",
      value: formatEUR(cell.taxCollected),
      blurb: "Everything routed to the state: income tax, employee and employer social security, surcharges.",
    },
    {
      label: "Net take-home",
      value: formatEUR(cell.net),
      blurb: "What reaches the bank account after every deduction.",
    },
    {
      label: "€ per €1 of net",
      value: formatNumber(eurPerEuroNet(cell)),
      blurb: `Euros the employer spends for every €1 the employee banks. Effective wedge: ${formatPercent(
        cell.wedge,
      )}.`,
    },
  ];

  return (
    <Section
      id="four-numbers"
      eyebrow="Four numbers, not one"
      title="Salary, tax, net, and employer outlay are different numbers."
      lede={
        <>
          Showing <CityPicker variant="inline" /> at the salary and profile selected
          below. Hover any row in the table to preview another city without losing your
          pick.
          {hoveredSlug && hoveredSlug !== city.name && (
            <span className="ml-1 text-amber-700">Previewing {hoveredSlug}.</span>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {c.label}
            </p>
            <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {c.value}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.blurb}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
