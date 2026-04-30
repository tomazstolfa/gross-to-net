"use client";

import { Section } from "./ui/Section";
import { Card } from "./ui/Card";
import { useHighlight } from "./ui/HighlightContext";
import { findCity, eurPerEuroNet } from "@/lib/data";
import { formatEUR, formatPercent, formatNumber } from "@/lib/format";

const DEFAULT_CITY = "Ljubljana";

export function FourNumbers() {
  const { hoveredSlug, salary, profile } = useHighlight();
  const cityName = hoveredSlug ?? DEFAULT_CITY;
  const city = findCity(cityName) ?? findCity(DEFAULT_CITY)!;
  const cell = city.salaries[salary][profile];

  const cards = [
    {
      label: "Employer cost",
      value: formatEUR(cell.employerCost),
      blurb: "Total annual outlay: gross salary plus employer social security.",
    },
    {
      label: "Tax collected",
      value: formatEUR(cell.taxCollected),
      blurb: "Income tax, employee SS, employer SS, and surcharges going to the state.",
    },
    {
      label: "Net in pocket",
      value: formatEUR(cell.net),
      blurb: "What lands in the bank after every deduction.",
    },
    {
      label: "€ per €1 net",
      value: formatNumber(eurPerEuroNet(cell)),
      blurb: `Employer spends this many euros for every €1 you bank. Wedge: ${formatPercent(
        cell.wedge,
      )}.`,
    },
  ];

  return (
    <Section
      id="four-numbers"
      eyebrow="The four numbers that matter"
      title="Most salary debates confuse these. They are not the same."
      lede={`Live preview for ${city.name}, ${city.country}. Hover any city in the comparison below to swap the values.`}
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
