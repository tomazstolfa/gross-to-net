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
      blurb: "Gross salary plus the employer's share of social security.",
    },
    {
      label: "Tax collected",
      value: formatEUR(cell.taxCollected),
      blurb: "Income tax, both sides of social security, surcharges.",
    },
    {
      label: "Net take-home",
      value: formatEUR(cell.net),
      blurb: "What lands in the bank after every deduction.",
    },
    {
      label: "€ per €1 of net",
      value: formatNumber(eurPerEuroNet(cell)),
      blurb: `Cost per €1 of net. Effective wedge ${formatPercent(cell.wedge)}.`,
    },
  ];

  return (
    <Section
      id="four-numbers"
      eyebrow="Selected city"
      title="What the employer pays, what the state takes, what's left."
      lede={
        <>
          <CityPicker variant="inline" />
          {hoveredSlug && hoveredSlug !== city.name && (
            <span className="ml-2 text-emerald-700">— previewing {hoveredSlug}</span>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {c.label}
            </p>
            <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">
              {c.value}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{c.blurb}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
