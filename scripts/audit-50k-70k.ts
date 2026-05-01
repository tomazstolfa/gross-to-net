/**
 * Deep validation pass for the €50k and €70k cells.
 *
 * For every city, runs the country compute function (single source of truth
 * for our PwC bracket math) at €50k and €70k, both single and family,
 * and prints engine vs dataset deltas. Flags anything outside ±3%.
 *
 * Run: npx tsx scripts/audit-50k-70k.ts
 */

import { cities, FX, type SalaryPoint, type Profile } from "../lib/data";

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

type CellRaw = { employerCost: number; net: number };

// =============================================================================
// Country compute functions (kept in sync with scripts/compute-cells.ts and
// scripts/recompute-pl-ie-gb.ts and scripts/compute-zurich.ts).
// =============================================================================

function computeSI(g: number, p: Profile): CellRaw {
  const employeeSS = g * 0.221;
  const flatHealth = 35 * 12;
  const employerSS = g * 0.161;
  const generalAllowance =
    g < 16800 ? 5000 : Math.max(1500, 5000 - (g - 16800) * 0.1);
  const familyAllowances = p === "family" ? 2610 + 5420 : 0;
  const taxBase = Math.max(0, g - employeeSS - generalAllowance - familyAllowances);
  const brackets: Bracket[] = [
    { from: 0, to: 9210, rate: 0.16 },
    { from: 9210, to: 27089, rate: 0.26 },
    { from: 27089, to: 54178, rate: 0.33 },
    { from: 54178, to: 78016, rate: 0.39 },
    { from: 78016, to: Infinity, rate: 0.5 },
  ];
  const incomeTax = sumBrackets(brackets, taxBase);
  const net = g - employeeSS - incomeTax - flatHealth;
  return { employerCost: g + employerSS, net };
}

function computeIT(g: number, p: Profile): CellRaw {
  const inpsCap = 55448;
  const inpsEmp =
    Math.min(g, inpsCap) * 0.0919 + Math.max(0, g - inpsCap) * 0.1019;
  const taxBase = g - inpsEmp;
  const brackets: Bracket[] = [
    { from: 0, to: 28000, rate: 0.23 },
    { from: 28000, to: 50000, rate: 0.33 },
    { from: 50000, to: Infinity, rate: 0.43 },
  ];
  const irpef = sumBrackets(brackets, taxBase);
  const regional = taxBase * 0.0173;
  const municipal = taxBase * 0.008;
  const familyCredit = p === "family" ? 2400 : 0;
  const totalTax = Math.max(0, irpef + regional + municipal - familyCredit);
  const net = g - inpsEmp - totalTax;
  const employerSS = g * 0.30;
  return { employerCost: g + employerSS, net };
}

function computePT(g: number, p: Profile): CellRaw {
  const employeeSS = g * 0.11;
  const taxBase = g - employeeSS;
  const brackets: Bracket[] = [
    { from: 0, to: 8342, rate: 0.125 },
    { from: 8342, to: 12587, rate: 0.157 },
    { from: 12587, to: 17838, rate: 0.212 },
    { from: 17838, to: 23089, rate: 0.241 },
    { from: 23089, to: 29397, rate: 0.311 },
    { from: 29397, to: 43090, rate: 0.349 },
    { from: 43090, to: 46566, rate: 0.431 },
    { from: 46566, to: 86634, rate: 0.446 },
    { from: 86634, to: Infinity, rate: 0.48 },
  ];
  const irs = sumBrackets(brackets, taxBase);
  const solidarity =
    Math.max(0, Math.min(g, 250000) - 80000) * 0.025 +
    Math.max(0, g - 250000) * 0.05;
  const familyCredit = p === "family" ? 1800 : 0;
  const totalTax = Math.max(0, irs + solidarity - familyCredit);
  const net = g - employeeSS - totalTax;
  const employerSS = g * 0.2375;
  return { employerCost: g + employerSS, net };
}

function computeDE(g: number, p: Profile): CellRaw {
  const pensionCap = 101400;
  const healthCap = 69750;
  const pensionEmp = Math.min(g, pensionCap) * 0.093;
  const unempEmp = Math.min(g, pensionCap) * 0.013;
  const healthEmp = Math.min(g, healthCap) * (0.073 + 0.0145);
  const careEmp = Math.min(g, healthCap) * 0.017;
  const employeeSS = pensionEmp + unempEmp + healthEmp + careEmp;
  const grundfreibetrag = 12096;
  const kindergeld = p === "family" ? 6120 : 0;
  const splittingFactor = p === "family" ? 2 : 1;
  const adjustedBase = Math.max(0, g - employeeSS - 4230);
  const baseForSplit = adjustedBase / splittingFactor;
  const brackets: Bracket[] = [
    { from: 0, to: grundfreibetrag, rate: 0 },
    { from: grundfreibetrag, to: 17400, rate: 0.20 },
    { from: 17400, to: 68429, rate: 0.30 },
    { from: 68429, to: 277826, rate: 0.42 },
    { from: 277826, to: Infinity, rate: 0.45 },
  ];
  let incomeTax = sumBrackets(brackets, baseForSplit) * splittingFactor;
  if (incomeTax > 19950) incomeTax += incomeTax * 0.055;
  const net = g - employeeSS - incomeTax + kindergeld;
  const pensionEmpr = Math.min(g, pensionCap) * 0.093;
  const unempEmpr = Math.min(g, pensionCap) * 0.013;
  const healthEmpr = Math.min(g, healthCap) * (0.073 + 0.0145);
  const careEmpr = Math.min(g, healthCap) * 0.017;
  const otherEmpr = g * 0.005;
  const employerSS = pensionEmpr + unempEmpr + healthEmpr + careEmpr + otherEmpr;
  return { employerCost: g + employerSS, net };
}

function computeNL(g: number, p: Profile): CellRaw {
  const niCap = 38883;
  const ni = Math.min(g, niCap) * 0.2765;
  const itBrackets: Bracket[] = [
    { from: 0, to: 38883, rate: 0.0810 },
    { from: 38883, to: 78426, rate: 0.3756 },
    { from: 78426, to: Infinity, rate: 0.495 },
  ];
  const incomeTax = sumBrackets(itBrackets, g);
  const generalCredit = Math.max(0, 3068 - Math.max(0, g - 24813) * 0.064);
  const familyCredit = p === "family" ? 2500 : 0;
  const employerSS =
    Math.min(g, 79409) * 0.0651 + Math.min(g, 79409) * 0.075;
  const totalDeduction =
    ni + Math.max(0, incomeTax - generalCredit - familyCredit);
  const net = g - totalDeduction;
  return { employerCost: g + employerSS, net };
}

function computeES(g: number, p: Profile): CellRaw {
  const ssCap = 61224;
  const employeeSS = Math.min(g, ssCap) * 0.065;
  const meiSolidarity = Math.max(0, g - ssCap) * 0.0014;
  const taxBase = g - employeeSS - meiSolidarity;
  const brackets: Bracket[] = [
    { from: 0, to: 12450, rate: 0.21 },
    { from: 12450, to: 17707, rate: 0.24 },
    { from: 17707, to: 33007, rate: 0.30 },
    { from: 33007, to: 53407, rate: 0.37 },
    { from: 53407, to: 90000, rate: 0.45 },
    { from: 90000, to: 175000, rate: 0.46 },
    { from: 175000, to: 300000, rate: 0.48 },
    { from: 300000, to: Infinity, rate: 0.50 },
  ];
  const personalAllowance = 5550;
  const adjusted = Math.max(0, taxBase - personalAllowance);
  const incomeTax = sumBrackets(brackets, adjusted);
  const familyCredit = p === "family" ? 2500 : 0;
  const net =
    g - employeeSS - meiSolidarity - Math.max(0, incomeTax - familyCredit);
  const employerSS =
    Math.min(g, ssCap) * 0.3065 + Math.max(0, g - ssCap) * 0.012;
  return { employerCost: g + employerSS, net };
}

function computeHR(g: number, p: Profile): CellRaw {
  const pillarIICap = 81000;
  const pension = g * 0.15 + Math.min(g, pillarIICap) * 0.05;
  const personalAllowance = 7200;
  const familyAllowance = p === "family" ? 6720 : 0;
  const taxBase = Math.max(0, g - pension - personalAllowance - familyAllowance);
  const brackets: Bracket[] = [
    { from: 0, to: 60000, rate: 0.23 },
    { from: 60000, to: Infinity, rate: 0.33 },
  ];
  const incomeTax = sumBrackets(brackets, taxBase);
  const net = g - pension - incomeTax;
  const employerSS = g * 0.165;
  return { employerCost: g + employerSS, net };
}

function computeIE(g: number, p: Profile): CellRaw {
  const standardCutoff = p === "family" ? 53000 : 44000;
  const itBrackets: Bracket[] = [
    { from: 0, to: standardCutoff, rate: 0.20 },
    { from: standardCutoff, to: Infinity, rate: 0.40 },
  ];
  let incomeTax = sumBrackets(itBrackets, g);
  const personalCredit = 2000;
  const payeCredit = 2000;
  const marriedCredit = p === "family" ? 2000 : 0;
  const homeCarerCredit = p === "family" ? 1950 : 0;
  const totalCredits = personalCredit + payeCredit + marriedCredit + homeCarerCredit;
  incomeTax = Math.max(0, incomeTax - totalCredits);
  const uscBrackets: Bracket[] = [
    { from: 0, to: 12012, rate: 0.005 },
    { from: 12012, to: 27700, rate: 0.02 },
    { from: 27700, to: 70044, rate: 0.03 },
    { from: 70044, to: Infinity, rate: 0.08 },
  ];
  const usc = sumBrackets(uscBrackets, g);
  const prsi = g * 0.04275;
  const net = g - incomeTax - usc - prsi;
  const employerSS = g * 0.11325;
  return { employerCost: g + employerSS, net };
}

function computeDK(g: number, p: Profile): CellRaw {
  const am = g * 0.08;
  const personalAllowance = 6150;
  const taxBase = Math.max(0, g - am - personalAllowance);
  const bottomBracket = taxBase * 0.1201;
  const municipal = taxBase * 0.2365;
  const mellemskatBase = Math.max(0, Math.min(taxBase, 113000) - 79000);
  const mellemskat = mellemskatBase * 0.075;
  const topskatBase = Math.max(0, taxBase - 113000);
  const topskat = topskatBase * 0.075;
  let totalIncomeTax = bottomBracket + municipal + mellemskat + topskat;
  const familyCredit = p === "family" ? 800 : 0;
  totalIncomeTax = Math.max(0, totalIncomeTax - familyCredit);
  const net = g - am - totalIncomeTax;
  const employerSS = 2500;
  return { employerCost: g + employerSS, net };
}

function computeEE(g: number, p: Profile): CellRaw {
  const employeeUnemployment = g * 0.016;
  const fundedPension = g * 0.02;
  const taxBase = g - employeeUnemployment - fundedPension;
  const allowance =
    g >= 25200 ? 0 : Math.max(0, 7848 - (g - 14400) * (7848 / 10800));
  const adjustedBase = Math.max(0, taxBase - allowance);
  const incomeTax = adjustedBase * 0.22;
  const net = g - employeeUnemployment - fundedPension - incomeTax;
  const employerSS = g * 0.338;
  return { employerCost: g + employerSS, net };
}

function computePL(g: number, p: Profile): CellRaw {
  const zusCap = 282600 / FX.PLN_PER_EUR;
  const employeeSS =
    Math.min(g, zusCap) * 0.1371 + Math.max(0, g - zusCap) * 0.0245;
  const healthBase = g - employeeSS;
  const health = healthBase * 0.09;
  const taxBase = g - employeeSS;
  const pitThreshold = 120000 / FX.PLN_PER_EUR;
  const brackets: Bracket[] = [
    { from: 0, to: pitThreshold, rate: 0.12 },
    { from: pitThreshold, to: Infinity, rate: 0.32 },
  ];
  const taxFreeReduction = 3600 / FX.PLN_PER_EUR;
  let pit = sumBrackets(brackets, taxBase) - taxFreeReduction;
  pit = Math.max(0, pit);
  const familyCredit = p === "family" ? (1112 * 2) / FX.PLN_PER_EUR : 0;
  pit = Math.max(0, pit - familyCredit);
  const solidarity = Math.max(0, g - 1000000 / FX.PLN_PER_EUR) * 0.04;
  const net = g - employeeSS - health - pit - solidarity;
  const employerSS =
    Math.min(g, zusCap) * 0.2 + Math.max(0, g - zusCap) * 0.04;
  return { employerCost: g + employerSS, net };
}

function computeGB(g: number, p: Profile): CellRaw {
  const grossGBP = g * FX.GBP_PER_EUR;
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
  const marriageCredit = p === "family" ? 252 : 0;
  const childBenefitGBP =
    p === "family" && grossGBP < 60000 ? 1331 + 881 : 0;
  const netGBP = grossGBP - incomeTax - ni + marriageCredit + childBenefitGBP;
  const employerNI = Math.max(0, grossGBP - 5000) * 0.15;
  const employerCostGBP = grossGBP + employerNI;
  return {
    employerCost: employerCostGBP / FX.GBP_PER_EUR,
    net: netGBP / FX.GBP_PER_EUR,
  };
}

function computeCH(g: number, p: Profile): CellRaw {
  const grossCHF = g * FX.CHF_PER_EUR;
  const ALV_CAP = 148200;
  const ahvIvEo = grossCHF * 0.053;
  const alv =
    Math.min(grossCHF, ALV_CAP) * 0.011 +
    Math.max(0, grossCHF - ALV_CAP) * 0.005;
  const nbu = grossCHF * 0.01;
  const employeeSS = ahvIvEo + alv + nbu;
  const personalDeduction = p === "family" ? 5400 + 2 * 9000 : 2700;
  const taxBase = Math.max(0, grossCHF - employeeSS - personalDeduction);
  const fedSingle: Bracket[] = [
    { from: 0, to: 14500, rate: 0 },
    { from: 14500, to: 31600, rate: 0.0077 },
    { from: 31600, to: 41400, rate: 0.0088 },
    { from: 41400, to: 55200, rate: 0.0264 },
    { from: 55200, to: 72500, rate: 0.0297 },
    { from: 72500, to: 78100, rate: 0.0594 },
    { from: 78100, to: 103600, rate: 0.066 },
    { from: 103600, to: 134600, rate: 0.088 },
    { from: 134600, to: 176000, rate: 0.11 },
    { from: 176000, to: 755200, rate: 0.132 },
    { from: 755200, to: Infinity, rate: 0.115 },
  ];
  const fedMarried: Bracket[] = [
    { from: 0, to: 28800, rate: 0 },
    { from: 28800, to: 51800, rate: 0.01 },
    { from: 51800, to: 59400, rate: 0.02 },
    { from: 59400, to: 76800, rate: 0.03 },
    { from: 76800, to: 92000, rate: 0.04 },
    { from: 92000, to: 112200, rate: 0.05 },
    { from: 112200, to: 130000, rate: 0.06 },
    { from: 130000, to: 148800, rate: 0.07 },
    { from: 148800, to: 167200, rate: 0.08 },
    { from: 167200, to: 189000, rate: 0.09 },
    { from: 189000, to: 216600, rate: 0.10 },
    { from: 216600, to: 261200, rate: 0.11 },
    { from: 261200, to: 310000, rate: 0.12 },
    { from: 310000, to: 401000, rate: 0.13 },
    { from: 401000, to: Infinity, rate: 0.115 },
  ];
  const zhSingle: Bracket[] = [
    { from: 0, to: 7500, rate: 0 },
    { from: 7500, to: 13000, rate: 0.02 },
    { from: 13000, to: 19200, rate: 0.03 },
    { from: 19200, to: 26000, rate: 0.04 },
    { from: 26000, to: 37000, rate: 0.05 },
    { from: 37000, to: 49500, rate: 0.06 },
    { from: 49500, to: 65000, rate: 0.07 },
    { from: 65000, to: 83500, rate: 0.08 },
    { from: 83500, to: 105000, rate: 0.09 },
    { from: 105000, to: 130000, rate: 0.10 },
    { from: 130000, to: 260000, rate: 0.11 },
    { from: 260000, to: 300000, rate: 0.12 },
    { from: 300000, to: Infinity, rate: 0.13 },
  ];
  const zhMarried: Bracket[] = [
    { from: 0, to: 13500, rate: 0 },
    { from: 13500, to: 19600, rate: 0.02 },
    { from: 19600, to: 27300, rate: 0.03 },
    { from: 27300, to: 36700, rate: 0.04 },
    { from: 36700, to: 47400, rate: 0.05 },
    { from: 47400, to: 61300, rate: 0.06 },
    { from: 61300, to: 92100, rate: 0.07 },
    { from: 92100, to: 122900, rate: 0.08 },
    { from: 122900, to: 169300, rate: 0.09 },
    { from: 169300, to: 224700, rate: 0.10 },
    { from: 224700, to: 284800, rate: 0.11 },
    { from: 284800, to: 354100, rate: 0.12 },
    { from: 354100, to: Infinity, rate: 0.13 },
  ];
  const fedBrackets = p === "family" ? fedMarried : fedSingle;
  const zhBrackets = p === "family" ? zhMarried : zhSingle;
  const federalTax = sumBrackets(fedBrackets, taxBase);
  const cantonalBasis = sumBrackets(zhBrackets, taxBase);
  const cantonalCommunal = cantonalBasis * 2.18;
  const totalIncomeTax = federalTax + cantonalCommunal;
  const netCHF = grossCHF - employeeSS - totalIncomeTax;
  const employerSS =
    grossCHF * 0.053 +
    Math.min(grossCHF, ALV_CAP) * 0.011 +
    Math.max(0, grossCHF - ALV_CAP) * 0.005 +
    grossCHF * 0.018;
  return {
    employerCost: (grossCHF + employerSS) / FX.CHF_PER_EUR,
    net: netCHF / FX.CHF_PER_EUR,
  };
}

const COMPUTE: Record<string, (g: number, p: Profile) => CellRaw> = {
  Ljubljana: computeSI,
  Milan: computeIT,
  Lisbon: computePT,
  Berlin: computeDE,
  Amsterdam: computeNL,
  Barcelona: computeES,
  Zagreb: computeHR,
  Dublin: computeIE,
  Copenhagen: computeDK,
  Tallinn: computeEE,
  Warsaw: computePL,
  London: computeGB,
  Zurich: computeCH,
};

const SALARY_POINTS: SalaryPoint[] = [50000, 70000];

const round100 = (n: number) => Math.round(n / 100) * 100;

console.log(
  "City         Profile  Sal     EngineEC  EngineNet  DataEC    DataNet   ΔEC%   ΔNet%  Flag",
);
console.log(
  "─".repeat(110),
);

for (const city of cities) {
  if (city.isAggregate) continue;
  const fn = COMPUTE[city.name];
  if (!fn) continue;
  for (const sp of SALARY_POINTS) {
    for (const profile of ["single", "family"] as const) {
      const raw = fn(sp, profile);
      const engineEC = round100(raw.employerCost);
      const engineNet = round100(raw.net);
      const dataset = city.salaries[sp][profile];
      const dEC = ((engineEC - dataset.employerCost) / dataset.employerCost) * 100;
      const dNet = ((engineNet - dataset.net) / dataset.net) * 100;
      const flag = Math.abs(dNet) > 3 || Math.abs(dEC) > 3 ? "⚠️" : "  ";
      console.log(
        `${city.name.padEnd(12)} ${profile.padEnd(7)} €${(sp / 1000).toString().padStart(3)}k   ` +
          `${engineEC.toString().padStart(7)}   ${engineNet.toString().padStart(7)}   ` +
          `${dataset.employerCost.toString().padStart(7)}   ${dataset.net.toString().padStart(7)}   ` +
          `${dEC.toFixed(1).padStart(5)}%  ${dNet.toFixed(1).padStart(5)}%  ${flag}`,
      );
    }
  }
}
