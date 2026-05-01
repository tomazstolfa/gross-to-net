/**
 * Compute Zurich (Switzerland) cells at all 6 salary points using PwC 2026
 * brackets for federal direct tax and Zurich cantonal/communal tax.
 *
 * Methodology decisions:
 *  - BVG (mandatory 2nd-pillar pension) is excluded from `taxCollected`,
 *    matching Ireland's My Future Fund and the UK's auto-enrol pension.
 *    Pension is the employee's retirement money, not state revenue.
 *  - AHV/IV/EO (1st pillar) IS state revenue, included on both sides.
 *  - ALV (unemployment) capped at CHF 148,200 (2026 ceiling).
 *  - Cantonal+communal multiplier for City of Zurich = 218% × cantonal
 *    basis tax (99% canton + 119% city, 2026 multipliers).
 *  - Personal/family deductions: CHF 2,700 single, CHF 5,400 married,
 *    CHF 9,000 per child.
 *
 * Run: npx tsx scripts/compute-zurich.ts
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

const finishCell = (employerCost: number, net: number) => {
  const ec = Math.round(employerCost / 100) * 100;
  const n = Math.round(net / 100) * 100;
  const taxCollected = ec - n;
  const wedge = Math.round((taxCollected / ec) * 100) / 100;
  return { employerCost: ec, net: n, taxCollected, wedge };
};

// Federal direct tax (Switzerland) — single, 2026
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

// Federal direct tax — married/family, 2026
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

// Zurich cantonal basis tax — single, 2025 schedule
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

// Zurich cantonal basis tax — married, 2025 schedule
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

const ZH_MULTIPLIER = 2.18; // canton 99% + city 119%
const ALV_CAP = 148200;

function computeCH(grossEUR: number, profile: "single" | "family") {
  const grossCHF = grossEUR * FX.CHF_PER_EUR;

  // Employee 1st-pillar SS (state revenue, counted as tax).
  const ahvIvEo = grossCHF * 0.053;
  const alv =
    Math.min(grossCHF, ALV_CAP) * 0.011 + Math.max(0, grossCHF - ALV_CAP) * 0.005;
  const nbu = grossCHF * 0.01; // non-occupational accident, employee share
  const employeeSS = ahvIvEo + alv + nbu;

  // Personal + family deductions
  const personalDeduction =
    profile === "family" ? 5400 + 2 * 9000 : 2700;
  const taxBase = Math.max(0, grossCHF - employeeSS - personalDeduction);

  const fedBrackets = profile === "family" ? fedMarried : fedSingle;
  const zhBrackets = profile === "family" ? zhMarried : zhSingle;
  const federalTax = sumBrackets(fedBrackets, taxBase);
  const cantonalBasis = sumBrackets(zhBrackets, taxBase);
  const cantonalCommunal = cantonalBasis * ZH_MULTIPLIER;

  const totalIncomeTax = federalTax + cantonalCommunal;
  const netCHF = grossCHF - employeeSS - totalIncomeTax;

  // Employer 1st-pillar SS + family allowance fund + admin
  const employerSS =
    grossCHF * 0.053 + // AHV/IV/EO
    Math.min(grossCHF, ALV_CAP) * 0.011 + // ALV capped
    Math.max(0, grossCHF - ALV_CAP) * 0.005 + // ALV solidarity
    grossCHF * 0.018; // family allowance + admin (BU + Berufsunfall+Verwaltung)

  return {
    employerCost: (grossCHF + employerSS) / FX.CHF_PER_EUR,
    net: netCHF / FX.CHF_PER_EUR,
  };
}

const SALARY_POINTS = [50000, 70000, 100000, 150000, 200000, 250000];

console.log("// Zurich, Switzerland — paste-ready cells\n");
for (const sp of SALARY_POINTS) {
  const sRaw = computeCH(sp, "single");
  const fRaw = computeCH(sp, "family");
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
