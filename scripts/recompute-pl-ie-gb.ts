/**
 * One-shot: recompute Warsaw, Dublin, London cells at all 6 salary points using
 * PwC bracket math. Output is paste-ready for lib/data.ts.
 *
 * Why these three? The compute-cells.ts calibration check showed >5% deltas
 * between authoritative bracket math and the existing dataset for these cities:
 *   - Warsaw: dataset omitted the 9% non-deductible health levy (~+€6-9k net)
 *   - Dublin: dataset bundled auto-enrol pension as "tax collected" (~−€5-6k net)
 *   - London: same auto-enrol bundling (~−€3k net)
 * Pension is the employee's retirement money, not state revenue, and so it
 * should not be counted as tax. Health is real state revenue and must be.
 *
 * Run: npx tsx scripts/recompute-pl-ie-gb.ts
 */

import { FX } from "../lib/data";

type Bracket = { from: number; to: number; rate: number };

const sumBrackets = (brackets: Bracket[], base: number): number => {
  if (base <= 0) return 0;
  let tax = 0;
  for (const b of brackets) {
    if (base <= b.from) break;
    const top = Math.min(base, b.to);
    tax += (top - b.from) * b.rate;
  }
  return tax;
};

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

function computePL(gross: number, profile: "single" | "family") {
  const zusCap = 282600 / FX.PLN_PER_EUR;
  const employeeSS =
    Math.min(gross, zusCap) * 0.1371 + Math.max(0, gross - zusCap) * 0.0245;
  const healthBase = gross - employeeSS;
  const health = healthBase * 0.09;
  const taxBase = gross - employeeSS;
  const pitThreshold = 120000 / FX.PLN_PER_EUR;
  const brackets: Bracket[] = [
    { from: 0, to: pitThreshold, rate: 0.12 },
    { from: pitThreshold, to: Infinity, rate: 0.32 },
  ];
  const taxFreeReduction = 3600 / FX.PLN_PER_EUR;
  let pit = sumBrackets(brackets, taxBase) - taxFreeReduction;
  pit = Math.max(0, pit);
  const familyCredit = profile === "family" ? (1112 * 2) / FX.PLN_PER_EUR : 0;
  pit = Math.max(0, pit - familyCredit);
  const solidarity = Math.max(0, gross - 1000000 / FX.PLN_PER_EUR) * 0.04;
  const net = gross - employeeSS - health - pit - solidarity;
  const employerSS =
    Math.min(gross, zusCap) * 0.2 + Math.max(0, gross - zusCap) * 0.04;
  return { employerCost: gross + employerSS, net };
}

function computeIE(gross: number, profile: "single" | "family") {
  const standardCutoff = profile === "family" ? 53000 : 44000;
  const itBrackets: Bracket[] = [
    { from: 0, to: standardCutoff, rate: 0.20 },
    { from: standardCutoff, to: Infinity, rate: 0.40 },
  ];
  let incomeTax = sumBrackets(itBrackets, gross);
  const personalCredit = 2000;
  const payeCredit = 2000;
  const marriedCredit = profile === "family" ? 2000 : 0;
  const homeCarerCredit = profile === "family" ? 1950 : 0;
  const totalCredits = personalCredit + payeCredit + marriedCredit + homeCarerCredit;
  incomeTax = Math.max(0, incomeTax - totalCredits);
  const uscBrackets: Bracket[] = [
    { from: 0, to: 12012, rate: 0.005 },
    { from: 12012, to: 27700, rate: 0.02 },
    { from: 27700, to: 70044, rate: 0.03 },
    { from: 70044, to: Infinity, rate: 0.08 },
  ];
  const usc = sumBrackets(uscBrackets, gross);
  const prsi = gross * 0.04275;
  const net = gross - incomeTax - usc - prsi;
  const employerSS = gross * 0.11325;
  return { employerCost: gross + employerSS, net };
}

function computeGB(gross: number, profile: "single" | "family") {
  const grossGBP = gross * FX.GBP_PER_EUR;
  const personalAllowanceFull = 12570;
  const taperStart = 100000;
  const taperEnd = 125140;
  let pa: number;
  if (grossGBP <= taperStart) pa = personalAllowanceFull;
  else if (grossGBP >= taperEnd) pa = 0;
  else pa = Math.max(0, personalAllowanceFull - (grossGBP - taperStart) / 2);
  const taxBase = Math.max(0, grossGBP - pa);
  const brackets: Bracket[] = [
    { from: 0, to: 37700, rate: 0.20 },
    { from: 37700, to: 125140 - personalAllowanceFull, rate: 0.40 },
    { from: 125140 - personalAllowanceFull, to: Infinity, rate: 0.45 },
  ];
  const incomeTax = sumBrackets(brackets, taxBase);
  const niBase1 = Math.max(0, Math.min(grossGBP, 50270) - 12570);
  const niBase2 = Math.max(0, grossGBP - 50270);
  const ni = niBase1 * 0.08 + niBase2 * 0.02;
  const marriageCredit = profile === "family" ? 252 : 0;
  const childBenefitGBP =
    profile === "family" && grossGBP < 60000 ? 1331 + 881 : 0;
  const netGBP = grossGBP - incomeTax - ni + marriageCredit + childBenefitGBP;
  const employerNI = Math.max(0, grossGBP - 5000) * 0.15;
  const employerCostGBP = grossGBP + employerNI;
  return {
    employerCost: employerCostGBP / FX.GBP_PER_EUR,
    net: netGBP / FX.GBP_PER_EUR,
  };
}

const SALARY_POINTS = [50000, 70000, 100000, 150000, 200000, 250000];
const CITIES = [
  { name: "Warsaw", fn: computePL },
  { name: "Dublin", fn: computeIE },
  { name: "London", fn: computeGB },
];

for (const c of CITIES) {
  console.log(`\n// ${c.name}`);
  for (const sp of SALARY_POINTS) {
    const sRaw = c.fn(sp, "single");
    const fRaw = c.fn(sp, "family");
    const s = finishCell(sRaw.employerCost, sRaw.net);
    const f = finishCell(fRaw.employerCost, fRaw.net);
    console.log(`  ${sp}: {`);
    console.log(
      `    single: { employerCost: ${s.employerCost}, net: ${s.net}, taxCollected: ${s.taxCollected}, wedge: ${s.wedge} },`,
    );
    console.log(
      `    family: { employerCost: ${f.employerCost}, net: ${f.net}, taxCollected: ${f.taxCollected}, wedge: ${f.wedge} },`,
    );
    console.log(`  },`);
  }
}
