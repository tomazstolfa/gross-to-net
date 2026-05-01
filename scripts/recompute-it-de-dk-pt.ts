/**
 * Deep-validation recompute for Italy (Milan), Germany (Berlin), Denmark
 * (Copenhagen), and Portugal (Lisbon 70k family).
 *
 * Sources verified May 2026:
 *   - Italy: PwC Worldwide Tax Summaries + INPS Circolare 6/2026 +
 *     Comune di Milano addizionali. Authoritative net per agent + own
 *     calc: 50k single €32,472 / 70k single €42,351.
 *     Engine adds AUU (Assegno Unico Universale, ~€1,400/yr for 2 kids
 *     at €50–70k income) to family net per the methodology choice that
 *     government cash transfers count toward take-home (same as Germany
 *     Kindergeld, UK Child Benefit, Ireland Child Benefit).
 *   - Germany: lohntastik.de 2026 brutto-netto-rechner for 50k/70k
 *     (authoritative). 100k+ computed from PwC 2026 Lohnsteuertarif.
 *     Steuerklasse III applied for family (single-earner married),
 *     Kindergeld €259/mo × 2 × 12 = €6,216/yr added to family net.
 *   - Denmark: salaryaftertax.com/dk + klarpay.dk Copenhagen calculator
 *     (real calcs). Includes beskæftigelsesfradrag (12.30% capped at
 *     DKK 55,600) which prior dataset values omitted. Family adds
 *     spouse personfradrag transfer (~DKK 13k) + børneydelse 7-14
 *     (DKK 13,380/kid × 2 = DKK 26,760).
 *   - Portugal: PwC 2026 IRS brackets + dependent deductions
 *     (€600/dependent age >3 from coleta). Authoritative net per
 *     PwC math and Coverflex/Doutor Finanças simulators.
 *
 * Run: npx tsx scripts/recompute-it-de-dk-pt.ts
 */

type Cell = {
  employerCost: number;
  net: number;
  taxCollected: number;
  wedge: number;
};

const finishCell = (employerCost: number, net: number): Cell => {
  const ec = Math.round(employerCost / 100) * 100;
  const n = Math.round(net / 100) * 100;
  const taxCollected = ec - n;
  const wedge = Math.round((taxCollected / ec) * 100) / 100;
  return { employerCost: ec, net: n, taxCollected, wedge };
};

type Bracket = { from: number; to: number; rate: number };
const sumBrackets = (b: Bracket[], base: number) => {
  if (base <= 0) return 0;
  let t = 0;
  for (const x of b) {
    if (base <= x.from) break;
    t += (Math.min(base, x.to) - x.from) * x.rate;
  }
  return t;
};

// ============================================================================
// Italy (Milan) — full bracket math with corrections
// ============================================================================

function computeIT(g: number, profile: "single" | "family"): Cell {
  // INPS employee 2026: 9.19% to threshold 56,224, then +1% above (10.19%
  // total) up to massimale contributivo 122,295. No contributions above.
  const inpsThreshold = 56224;
  const inpsCap = 122295;
  const inpsEmp =
    Math.min(g, inpsThreshold) * 0.0919 +
    Math.max(0, Math.min(g, inpsCap) - inpsThreshold) * 0.1019;

  // IRPEF 2026 brackets (post Legge di Bilancio 2026): 23/33/43
  const taxBase = g - inpsEmp;
  const irpefBrackets: Bracket[] = [
    { from: 0, to: 28000, rate: 0.23 },
    { from: 28000, to: 50000, rate: 0.33 },
    { from: 50000, to: Infinity, rate: 0.43 },
  ];
  const irpefGross = sumBrackets(irpefBrackets, taxBase);

  // Detrazione lavoro dipendente — phases out linearly between €28k and €50k
  let detrazione = 0;
  if (taxBase < 28000 && taxBase >= 15000) {
    detrazione = 1910 + 1190 * ((28000 - taxBase) / 13000);
  } else if (taxBase < 50000) {
    detrazione = (1910 * (50000 - taxBase)) / 22000;
  }
  if (taxBase >= 25000 && taxBase <= 35000) detrazione += 65;

  const irpefAfterWorkCredit = Math.max(0, irpefGross - detrazione);

  // Coniuge a carico (spouse credit) — €690 in the €40-80k band, simplified
  const spouseCredit = profile === "family" ? 690 : 0;
  const irpefNet = Math.max(0, irpefAfterWorkCredit - spouseCredit);

  // Regional + municipal addizionali (Lombardia 1.73%, Milano 0.8% above €21k)
  const regional = taxBase * 0.0173;
  const municipal = taxBase > 21000 ? taxBase * 0.008 : 0;

  // Assegno Unico Universale 2026: €58.30/mo/child for 2 kids at ISEE >€46,582
  // = €1,399/yr for 2 kids. Paid by INPS, separately from payroll. Counted
  // toward family net per methodology (consistent with DE Kindergeld, UK Child
  // Benefit, IE Child Benefit).
  const assegnoUnico = profile === "family" ? 1399 : 0;

  const totalTax = irpefNet + regional + municipal;
  const net = g - inpsEmp - totalTax + assegnoUnico;

  // Employer INPS ~30% (general employee). Dirigenti add Previndai/FASI on
  // top, but methodology is "general employee" — exclude dirigente extras.
  const employerSS = g * 0.30;
  return finishCell(g + employerSS, net);
}

// ============================================================================
// Germany (Berlin) — hardcoded from lohntastik 2026 (50k/70k authoritative)
// + PwC formula-based for 100k+. Steuerklasse III for family. Kindergeld
// €6,216/yr added to family net.
// ============================================================================

const BERLIN_CELLS: Record<number, { single: Cell; family: Cell }> = {
  50000: {
    single: finishCell(60800, 32337),
    family: finishCell(60800, 42531), // incl. Kindergeld 6,216
  },
  70000: {
    single: finishCell(85100, 42583),
    family: finishCell(85100, 54067),
  },
  100000: {
    single: finishCell(119650, 62340),
    family: finishCell(119650, 77846), // 71,630 net + 6,216 Kindergeld
  },
  150000: {
    single: finishCell(171650, 88010),
    family: finishCell(171650, 108066),
  },
  200000: {
    single: finishCell(221650, 112640),
    family: finishCell(221650, 135116),
  },
  250000: {
    single: finishCell(271650, 138380),
    family: finishCell(271650, 160276),
  },
};

// ============================================================================
// Denmark (Copenhagen) — calculator-cluster values (salaryaftertax.com,
// klarpay.dk, danskat). Includes beskæftigelsesfradrag and Copenhagen
// kommune 23.50%. Family adds børneydelse for 2 kids age 7-14
// (DKK 26,760 = €3,587) plus spouse personfradrag transfer (~DKK 13k =
// €1,742). Employer SS effectively flat ~€1,340/yr.
// ============================================================================

const COPENHAGEN_CELLS: Record<number, { single: Cell; family: Cell }> = {
  50000: {
    single: finishCell(51340, 34156),
    family: finishCell(51340, 39485), // single + €1,742 spouse + €3,587 børneydelse
  },
  70000: {
    single: finishCell(71340, 45469),
    family: finishCell(71340, 50799),
  },
  100000: {
    single: finishCell(101340, 61595),
    family: finishCell(101340, 66925),
  },
  150000: {
    single: finishCell(151340, 86367),
    family: finishCell(151340, 91697),
  },
  200000: {
    single: finishCell(201340, 110375),
    family: finishCell(201340, 115705),
  },
  250000: {
    single: finishCell(251340, 134370),
    family: finishCell(251340, 139700),
  },
};

// ============================================================================
// Driver: emit paste-ready cells
// ============================================================================

const SALARY_POINTS = [50000, 70000, 100000, 150000, 200000, 250000];

const emit = (label: string, cells: Record<number, { single: Cell; family: Cell }>) => {
  console.log(`\n// ${label}`);
  for (const sp of SALARY_POINTS) {
    const c = cells[sp];
    console.log(`  ${sp}: {`);
    console.log(
      `    single: { employerCost: ${c.single.employerCost}, net: ${c.single.net}, taxCollected: ${c.single.taxCollected}, wedge: ${c.single.wedge} },`,
    );
    console.log(
      `    family: { employerCost: ${c.family.employerCost}, net: ${c.family.net}, taxCollected: ${c.family.taxCollected}, wedge: ${c.family.wedge} },`,
    );
    console.log(`  },`);
  }
};

// Italy
console.log(`\n// ============================================================`);
console.log(`// ITALY (Milan) — recomputed from PwC 2026 + INPS Circolare 6/2026`);
console.log(`// ============================================================`);
const italyCells: Record<number, { single: Cell; family: Cell }> = {};
for (const sp of SALARY_POINTS) {
  italyCells[sp] = {
    single: computeIT(sp, "single"),
    family: computeIT(sp, "family"),
  };
}
emit("Milan", italyCells);

console.log(`\n// ============================================================`);
console.log(`// GERMANY (Berlin) — lohntastik 2026 (50k/70k) + PwC formula (100k+)`);
console.log(`// Family includes Kindergeld €6,216/yr (2 × €259/mo × 12)`);
console.log(`// ============================================================`);
emit("Berlin", BERLIN_CELLS);

console.log(`\n// ============================================================`);
console.log(`// DENMARK (Copenhagen) — calculator-cluster, includes beskæftigelses-`);
console.log(`// fradrag. Family adds spouse transfer + børneydelse 7-14 (€3,587/yr).`);
console.log(`// ============================================================`);
emit("Copenhagen", COPENHAGEN_CELLS);

console.log(`\n// ============================================================`);
console.log(`// PORTUGAL (Lisbon) 70k family — single-cell patch`);
console.log(`// PwC math + €1,200 dependent deduction → €44,156 (was €47,100)`);
console.log(`// ============================================================`);
console.log(`// 70k family: { employerCost: 86600, net: 44200, taxCollected: 42400, wedge: 0.49 }`);
