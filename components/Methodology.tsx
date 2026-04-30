import { Section } from "./ui/Section";
import { DATA_VINTAGE, FX, PPP_BASELINE } from "@/lib/data";

type Source = { name: string; url: string };

const SOURCES: Source[] = [
  {
    name: "PwC Worldwide Tax Summaries 2025/2026",
    url: "https://taxsummaries.pwc.com/",
  },
  {
    name: "KPMG Individual Income Tax tables 2025/2026",
    url: "https://kpmg.com/xx/en/our-insights/tax/individual-income-tax-rates-table.html",
  },
  {
    name: "Slovenia FURS — official 2026 brackets",
    url: "https://www.fu.gov.si/davki_in_druge_dajatve/podrocja/dohodnina/",
  },
  {
    name: "Estonia EMTA — flat tax, MTÜ social tax",
    url: "https://www.emta.ee/en",
  },
  {
    name: "Ireland Revenue.ie — PAYE/USC/PRSI 2026",
    url: "https://www.revenue.ie/en/jobs-and-pensions/calculating-your-income-tax/index.aspx",
  },
  {
    name: "UK HMRC — income tax + NIC schedule (post-April 2025)",
    url: "https://www.gov.uk/income-tax-rates",
  },
  {
    name: "Netherlands Belastingdienst — Box 1 + Zvw",
    url: "https://www.belastingdienst.nl/",
  },
  {
    name: "Germany Bundeszentralamt für Steuern — federal brackets + Soli",
    url: "https://www.bundesfinanzministerium.de/Web/EN/Issues/Taxation/taxation.html",
  },
  {
    name: "Spain Agencia Tributaria + Catalonia regional table",
    url: "https://sede.agenciatributaria.gob.es/",
  },
  {
    name: "Italy — Comune di Milano addizionale + Regione Lombardia + INPS",
    url: "https://www.agenziaentrate.gov.it/portale/web/english",
  },
  {
    name: "Portugal Autoridade Tributária — IRS + TSU",
    url: "https://www.portaldasfinancas.gov.pt/",
  },
  {
    name: "Poland KIS — PIT + ZUS",
    url: "https://www.podatki.gov.pl/",
  },
  {
    name: "Croatia Porezna Uprava — 2024 reform tables",
    url: "https://www.porezna-uprava.hr/",
  },
  {
    name: "Workplace.hr Slovenia 2026 calculator",
    url: "https://www.workplace.hr/",
  },
  {
    name: "Numbeo April 2026 cost-of-living indices",
    url: "https://www.numbeo.com/cost-of-living/",
  },
  {
    name: "Eurofast Croatia Tax Card 2025",
    url: "https://eurofast.eu/",
  },
  {
    name: "EY Estonia 2025-2026 tax alert",
    url: "https://www.ey.com/en_ee/tax",
  },
];

export function Methodology() {
  return (
    <Section
      id="methodology"
      eyebrow="Methodology"
      title="How the numbers were built."
      lede="Plain prose, click to expand. The intent is to be wrong less than the alternative — none of these numbers replace your accountant."
    >
      <div className="space-y-3">
        <Detail summary="Sources">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.name} className="flex gap-2 text-sm">
                <span className="text-slate-400">·</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-slate-700 underline-offset-2 transition hover:text-amber-700 hover:underline"
                >
                  {s.name}
                  <span aria-hidden className="ml-1 text-slate-400">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Detail>
        <Detail summary="Profiles">
          <p>
            <strong className="text-slate-900">Single</strong> = one earner, no
            children, age 30, standard employment contract, no special expat/researcher
            regime.
          </p>
          <p>
            <strong className="text-slate-900">Family</strong> = married single-earner
            with two children under 12. Spousal allowance and child-related credits
            (e.g. German Kindergeld + Ehegattensplitting, Irish home-carer credit,
            Slovenian otroški dodatek) applied where standard.
          </p>
        </Detail>
        <Detail summary="Currency and FX">
          <p>
            All values normalized to EUR. Two FX inputs are used — GBP/EUR ={" "}
            <span className="font-mono">{FX.GBP_PER_EUR}</span> and PLN/EUR ={" "}
            <span className="font-mono">{FX.PLN_PER_EUR}</span> — snapshot dated{" "}
            {DATA_VINTAGE}. Daily noise is not modelled.
          </p>
        </Detail>
        <Detail summary="PPP normalization">
          <p>
            The Numbeo cost-of-living-ex-rent index is used because rent is a choice
            while groceries, transit and services are roughly fixed for comparable
            lifestyles. The baseline of {PPP_BASELINE} is a stand-in for the EU-27
            average. A city with index 75 (London) divides nominal net by 75/
            {PPP_BASELINE}; a city with index 42 (Warsaw) multiplies it.
          </p>
        </Detail>
        <Detail summary="Caveats">
          <ul className="space-y-2">
            <li>
              <strong className="text-slate-900">Special regimes excluded</strong>: NL
              30% ruling, ES Beckham law, IT impatriati, PL IP-Box. These materially
              change the picture for many readers; we plan to add a toggle.
            </li>
            <li>
              <strong className="text-slate-900">Estonia</strong>: the 24% rate planned
              for 2026 was cancelled by the Riigikogu in December 2025. The 22% flat
              rate is used.
            </li>
            <li>
              <strong className="text-slate-900">Employer SS</strong> uses the statutory
              rate where it applies; in regimes with a cap (DE, NL, ES, PL, HR) the cap
              is honoured and any solidarity-style charge above the cap is included.
            </li>
            <li>
              <strong className="text-slate-900">No church tax</strong> (DE, DK), no
              compulsory private health on top, no equity comp.
            </li>
          </ul>
        </Detail>
        <Detail summary="Update cadence">
          <p>
            Snapshots track major changes only — annual brackets, headline
            social-security rate moves. The current vintage is{" "}
            <span className="font-mono">{DATA_VINTAGE}</span>. PRs welcome.
          </p>
        </Detail>
      </div>
    </Section>
  );
}

function Detail({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-slate-900">
        <span>{summary}</span>
        <span aria-hidden className="text-slate-400 transition group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </details>
  );
}
