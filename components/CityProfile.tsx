"use client";

import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { Controls } from "./ui/Controls";
import { findCity, eurPerEuroNet, type CityData } from "@/lib/data";
import { formatEUR, formatNumber, formatPercent } from "@/lib/format";

/**
 * Per-city editorial copy. Title + lede are hand-written for each entry so
 * the voice stays specific rather than templated. The "At a glance" card and
 * the tax-structure sidebar are derived from the data.
 */
const COPY: Record<string, { title: string; lede: string }> = {
  Ljubljana: {
    title: "A 50% bracket that starts early. No social-security ceiling.",
    lede: "Two structural choices push Slovenia's effective wedge above 60% on executive compensation. Most European systems cap social security somewhere; Slovenia does not.",
  },
  Milan: {
    title: "Top rate at €50k. Layered surcharges. Uncapped INPS.",
    lede: "Italy's IRPEF tops out earlier than most of the continent. Regional and municipal addizionali pile on, and employer contributions don't taper for executives.",
  },
  Lisbon: {
    title: "A 48% top rate, with a solidarity surcharge above €80k.",
    lede: "Portugal's headline rate is moderate; the surcharge layered on the top slice and uncapped employer TSU lift the effective wedge sharply above six figures.",
  },
  Berlin: {
    title: "Splitting and Kindergeld pull family numbers down hard.",
    lede: "Germany's progressive rates are bounded by social-security ceilings. The married-couple split plus per-child credits drive a wide gap between single and family profiles.",
  },
  Amsterdam: {
    title: "One bracket does most of the work, and it kicks in early.",
    lede: "The 49.5% top rate begins around €76k. Employer contributions plateau near €71k, which keeps the wedge nearly flat across executive bands.",
  },
  Barcelona: {
    title: "A 50% top rate, softened by the social-security cap.",
    lede: "Above the ~€59k contribution base, Spain swaps full social security for a thinner solidarity charge. The effective wedge climbs gradually rather than sharply.",
  },
  Zagreb: {
    title: "33% above €60k. The 2024 reform abolished the surtax.",
    lede: "Croatia simplified its system in 2024: brackets at 23% and 33%, no more municipal prirez. Pillar II pension caps near €81k; employer health stays uncapped.",
  },
  Dublin: {
    title: "Top rate hits at €44k. Credits do real work for families.",
    lede: "Ireland's standard rate cut-off arrives early. PAYE plus USC plus PRSI compound at executive levels; transferable bands and the home-carer credit reshape the family profile.",
  },
  Copenhagen: {
    title: "Topskat above €78k. Employer charges stay tiny.",
    lede: "Denmark layers AM-bidrag, municipal tax, and topskat to reach a 56% marginal rate. What it doesn't do is load the employer side: social contributions are essentially flat fees.",
  },
  Tallinn: {
    title: "Flat 22%. The line on the curve barely bends.",
    lede: "Estonia keeps a single income tax rate across the range. Employer social tax is heavy at 33%, but the flatness leaves the executive wedge unusually stable.",
  },
  Warsaw: {
    title: "Two-rate PIT and a ZUS cap that flattens the top.",
    lede: "Poland's 12/32% schedule is straightforward. Above the ~€60k ZUS base, contributions effectively stop, which pulls the executive wedge down despite the headline rate.",
  },
  London: {
    title: "A 60% trap between £100k and £125k. Then the ramp resumes.",
    lede: "UK rates run 20/40/45%, but the personal-allowance withdrawal between £100k and £125k creates an effective 60% band. Employer NI is 15% with no ceiling.",
  },
  "EU average": {
    title: "An aggregate, not a city. Useful as a baseline.",
    lede: "Illustrative blend of EU-27 outcomes from OECD Taxing Wages 2025. Real cities sit on either side; structural choices show up clearly in each one's panel.",
  },
};

const FALLBACK = {
  title: "How the wedge breaks down here.",
  lede: "Employer outlay, take-home, and the structure that produces them.",
};

export function CityProfile() {
  const { salary, profile, effectiveSlug } = useHighlight();
  const city: CityData = findCity(effectiveSlug) ?? findCity("Ljubljana")!;
  const cell = city.salaries[salary][profile];
  const ratio = eurPerEuroNet(cell);
  const copy = COPY[city.name] ?? FALLBACK;

  return (
    <Section
      id="city-profile"
      eyebrow={`${city.name}, ${city.country}`}
      title={copy.title}
      lede={copy.lede}
    >
      <Controls className="mb-6" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            At a glance
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            For every <span className="text-amber-600">€1</span> a {profile} employee
            banks in {city.name} at {formatEUR(salary)} gross, the employer spends{" "}
            <span className="text-amber-600">€{formatNumber(ratio)}</span>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            That comes from {formatEUR(cell.employerCost)} of total employer outlay
            against {formatEUR(cell.net)} of net take-home — a wedge of{" "}
            {formatPercent(cell.wedge)}. Change the city, salary, or profile to watch
            the ratio shift.
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-6 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {city.country} tax structure
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
