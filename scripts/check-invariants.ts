import { cities, SALARY_POINTS, ALL_PROFILES } from "../lib/data";

type Issue = { city: string; salary: number; profile: string; msg: string };
const issues: Issue[] = [];

for (const c of cities) {
  for (const sp of SALARY_POINTS) {
    for (const profile of ALL_PROFILES) {
      const cell = c.salaries[sp][profile];
      const computedTax = cell.employerCost - cell.net;
      const taxDelta = Math.abs(computedTax - cell.taxCollected);
      if (taxDelta > 1) {
        issues.push({
          city: c.name,
          salary: sp,
          profile,
          msg: `taxCollected ${cell.taxCollected} should equal employerCost − net = ${computedTax} (delta ${taxDelta})`,
        });
      }
      const computedWedge = cell.taxCollected / cell.employerCost;
      if (Math.abs(computedWedge - cell.wedge) > 0.01) {
        issues.push({
          city: c.name,
          salary: sp,
          profile,
          msg: `wedge ${cell.wedge} but computed ${computedWedge.toFixed(4)}`,
        });
      }
      if (cell.net <= 0 || cell.taxCollected <= 0 || cell.employerCost <= 0) {
        issues.push({
          city: c.name,
          salary: sp,
          profile,
          msg: `non-positive value`,
        });
      }
    }
  }
}

// Monotonicity: net and employerCost should grow with salary (per profile).
for (const c of cities) {
  for (const profile of ALL_PROFILES) {
    let prevNet = -Infinity;
    let prevEmp = -Infinity;
    for (const sp of SALARY_POINTS) {
      const cell = c.salaries[sp][profile];
      if (cell.net < prevNet) {
        issues.push({
          city: c.name,
          salary: sp,
          profile,
          msg: `net regressed: ${cell.net} < previous ${prevNet}`,
        });
      }
      if (cell.employerCost < prevEmp) {
        issues.push({
          city: c.name,
          salary: sp,
          profile,
          msg: `employerCost regressed: ${cell.employerCost} < previous ${prevEmp}`,
        });
      }
      prevNet = cell.net;
      prevEmp = cell.employerCost;
    }
  }
}

// Family vs single: family net should be >= single net for the same gross
// (assuming the family profile has spouse/child credits).
for (const c of cities) {
  for (const sp of SALARY_POINTS) {
    const s = c.salaries[sp].single;
    const f = c.salaries[sp].family;
    if (f.net < s.net - 1) {
      issues.push({
        city: c.name,
        salary: sp,
        profile: "family",
        msg: `family net ${f.net} < single net ${s.net}`,
      });
    }
  }
}

if (issues.length === 0) {
  console.log("All invariants hold across", cities.length, "cities × 6 salary points × 2 profiles");
} else {
  console.log(`Found ${issues.length} issues:`);
  for (const i of issues) {
    console.log(`  [${i.city} · €${i.salary / 1000}k · ${i.profile}] ${i.msg}`);
  }
  process.exitCode = 1;
}
