/**
 * Recompute employer cost for NL/PT/ES to match Deel's published statutory
 * rates. Only employer cost changes; net is unchanged. taxCollected = EC − net
 * recomputes trivially.
 *
 * Validated May 2026 against Deel hiring-page rates:
 *   - NL: WW Awf 2.74% + WIA-Aof 7.05% + Zvw 6.51% + WHK ~1.35% = 17.65%
 *     capped at €76,300 (2026); above cap: 0 (all components cap together)
 *   - PT: TSU 23.75% + work-accident 3.15% = 26.90% (uncapped)
 *   - ES: 31.98% capped at €61,224 (was 30.65%) + 1.2% solidarity above
 *     (added FOGASA 0.20% + training 0.60% + IT/death 0.40% + Aprendizaje 0.13%)
 *
 * Run: npx tsx scripts/recompute-employer-cost-deel.ts
 */

import { cities } from "../lib/data";

const FX = { GBP_PER_EUR: 0.85, PLN_PER_EUR: 4.3, CHF_PER_EUR: 0.94 };

const round100 = (n: number) => Math.round(n / 100) * 100;
const round1pct = (n: number) => Math.round(n * 100) / 100;

const SALARY_POINTS = [50000, 70000, 100000, 150000, 200000, 250000] as const;

type Patch = { ec: number; net: number };

// ============================================================================
// Netherlands (Amsterdam) — 17.65% capped at €76,300, no contribution above.
// ============================================================================
function ecNL(g: number): number {
  const cap = 76300;
  return Math.min(g, cap) * 0.1765;
}

// ============================================================================
// Portugal (Lisbon) — 26.90% uncapped (TSU 23.75% + work accident 3.15%).
// ============================================================================
function ecPT(g: number): number {
  return g * 0.269;
}

// ============================================================================
// Spain (Barcelona) — 31.98% capped at €61,224 + 1.2% solidarity above.
// ============================================================================
function ecES(g: number): number {
  const cap = 61224;
  return Math.min(g, cap) * 0.3198 + Math.max(0, g - cap) * 0.012;
}

const ROUND = (n: number) => round100(n);

// Build the patches
const PATCHES: Record<string, (g: number) => number> = {
  Amsterdam: ecNL,
  Lisbon: ecPT,
  Barcelona: ecES,
};

console.log("// Recomputed employer-cost cells (net unchanged)\n");

for (const cityName of Object.keys(PATCHES)) {
  const city = cities.find((c) => c.name === cityName)!;
  const ecFn = PATCHES[cityName];
  console.log(`// ${cityName}`);
  for (const sp of SALARY_POINTS) {
    for (const profile of ["single", "family"] as const) {
      const cell = city.salaries[sp][profile];
      const newEC = ROUND(sp + ecFn(sp));
      const newTax = newEC - cell.net;
      const newWedge = round1pct(newTax / newEC);
      const ecChanged = newEC !== cell.employerCost;
      if (ecChanged) {
        console.log(
          `  ${sp} ${profile}: ec ${cell.employerCost} → ${newEC} (Δ${newEC - cell.employerCost}); tax ${cell.taxCollected} → ${newTax}; wedge ${cell.wedge} → ${newWedge}`,
        );
      } else {
        console.log(`  ${sp} ${profile}: ec unchanged at ${cell.employerCost}`);
      }
    }
  }
  console.log();
}
