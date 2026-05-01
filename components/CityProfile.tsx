"use client";

import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { Controls } from "./ui/Controls";
import { findCity, eurPerEuroNet, type CityData } from "@/lib/data";
import { formatEUR, formatNumber, formatPercent, isoToFlag } from "@/lib/format";

/**
 * Per-city editorial copy. Title + lede are hand-written for each entry so
 * the voice stays specific rather than templated. The "At a glance" card and
 * the tax-structure sidebar are derived from the data.
 */
const COPY: Record<string, { title: string; lede: string }> = {
  Ljubljana: {
    title: "A 50% bracket that starts early. No social-security ceiling.",
    lede: "Most European systems cap social security somewhere. Slovenia does not. Combined with the 50% bracket above €78k, the effective wedge clears 60% on executive pay.",
  },
  Milan: {
    title: "Top rate at €50k. Layered surcharges. Uncapped INPS.",
    lede: "IRPEF tops out earlier than most of the continent. Regional and municipal addizionali stack on top, and employer contributions don't taper for executives.",
  },
  Lisbon: {
    title: "A 48% top rate, plus a solidarity surcharge above €80k.",
    lede: "The headline rate is moderate. The surcharge on the top slice and the uncapped employer TSU lift the effective wedge sharply above six figures.",
  },
  Berlin: {
    title: "Splitting and Kindergeld pull family numbers down hard.",
    lede: "Progressive rates are bounded by social-security ceilings. Married-couple splitting plus per-child credits drive a wide gap between single and family profiles.",
  },
  Amsterdam: {
    title: "One bracket does most of the work, and it kicks in early.",
    lede: "The 49.5% rate starts around €78k. Employer contributions plateau near €71k, keeping the wedge nearly flat across executive bands.",
  },
  Barcelona: {
    title: "A 50% top rate, softened by the social-security cap.",
    lede: "Above the ~€59k contribution base, Spain swaps full social security for a thinner solidarity charge. The wedge climbs gradually rather than sharply.",
  },
  Zagreb: {
    title: "33% above €60k. The 2024 reform abolished the surtax.",
    lede: "Two brackets at 23% and 33%; no more municipal prirez. Pillar II pension caps near €81k; employer health stays uncapped.",
  },
  Dublin: {
    title: "Top rate hits at €44k. Credits do real work for families.",
    lede: "The standard rate cut-off arrives early. PAYE, USC, and PRSI compound at executive levels; transferable bands and the home-carer credit reshape the family profile.",
  },
  Copenhagen: {
    title: "Topskat above €113k after the 2026 reform. Employer charges stay tiny.",
    lede: "AM-bidrag, municipal tax, and the new mellemskat/topskat schedule layer to a 60.5% marginal cap. The employer side is essentially flat fees — unusual in Europe.",
  },
  Tallinn: {
    title: "Flat 22%. The curve barely bends.",
    lede: "One income tax rate across the range. Employer social tax is heavy at 33%, but the flatness leaves the executive wedge unusually stable.",
  },
  Warsaw: {
    title: "Two-rate PIT, ZUS cap, and an uncapped 9% health levy.",
    lede: "12/32% above ~€28k. ZUS contributions taper above the ~€66k cap, but the 9% non-deductible health levy applies to the full base — keeping the executive wedge in the high-40s rather than below the top bracket.",
  },
  London: {
    title: "A 60% trap between £100k and £125k. Then the ramp resumes.",
    lede: "Rates run 20/40/45%, but the personal-allowance withdrawal between £100k and £125k creates an effective 60% band. Employer NI is 15% with no ceiling.",
  },
  Zurich: {
    title: "Federal + canton + city stack, but the wedge stays under 40% even at €250k.",
    lede: "Combined Swiss income tax (federal direct tax + Zurich canton at 99% × basis + Zurich city at 119% × basis) is far below most of the EU. Mandatory 2nd-pillar pension and accident insurance live outside the wedge but still reduce take-home.",
  },
  "EU average": {
    title: "An aggregate, not a city. Useful as a baseline.",
    lede: "An illustrative blend of EU-27 outcomes from OECD Taxing Wages 2025. Real cities sit on either side; structural choices show up clearly in each one's panel.",
  },
};

const FALLBACK = {
  title: "How the wedge breaks down here.",
  lede: "Employer outlay, take-home, and the structure that produces them.",
};

export function CityProfile() {
  const { salary, profile, selectedSlug } = useHighlight();
  const city: CityData = findCity(selectedSlug) ?? findCity("Ljubljana")!;
  const cell = city.salaries[salary][profile];
  const ratio = eurPerEuroNet(cell);
  const copy = COPY[city.name] ?? FALLBACK;

  return (
    <Section
      id="city-profile"
      eyebrow={`${isoToFlag(city.iso)} ${city.name}, ${city.country}`}
      title={copy.title}
      lede={copy.lede}
    >
      <Controls className="mb-6" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            At a glance
          </p>
          <p className="mt-3 font-serif text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">
            For every <span className="text-emerald-600">€1</span> you bank as a{" "}
            {profile} employee in {city.name} at {formatEUR(salary)} gross, your
            employer spends{" "}
            <span className="text-emerald-600">€{formatNumber(ratio)}</span>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            {formatEUR(cell.employerCost)} of employer outlay buys you{" "}
            {formatEUR(cell.net)} of net take-home — a wedge of{" "}
            <span className="font-semibold text-red-700">
              {formatPercent(cell.wedge)}
            </span>
            .
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/60 p-6 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            {city.country} tax structure
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-stone-700">
            {city.taxStructure.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="text-emerald-600">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
