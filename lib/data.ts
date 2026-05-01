// lib/data.ts
//
// European compensation comparison: 13 cities, 5 salary points, 2 family profiles.
//
// Source: PwC and KPMG 2025/2026 tax tables, country tax authority calculators
// (FURS, EMTA, Revenue.ie, HMRC, Belastingdienst, Skat, Bundeszentralamt,
// Agencia Tributaria, Comune di Milano + Regione Lombardia, Autoridade
// Tributaria PT, KIS PL, Porezna Uprava HR), Workplace.hr Slovenia 2026
// calculator, Numbeo April 2026 cost-of-living data, Eurofast Croatia Tax
// Card 2025, EY Estonia 2025-2026 tax alert.
//
// All values in EUR. Conversion: GBP/EUR at 0.85, PLN/EUR at 4.30.
// Profile A (single) = single, no children, age 30, no special regime.
// Profile B (family) = married single-earner, two children under 12.
//
// Last updated: 2026-04-30.

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Profile = "single" | "family";

export type SalaryPoint = 50000 | 70000 | 100000 | 150000 | 200000 | 250000;

export type CountryISO =
  | "SI"
  | "EE"
  | "HR"
  | "PL"
  | "PT"
  | "DE"
  | "IT"
  | "ES"
  | "IE"
  | "NL"
  | "DK"
  | "GB"
  | "CH"
  | "EU"; // EU = aggregate, not a real city

export interface CellData {
  /** Total annual cost to the employer in EUR (gross + employer SS, capped where applicable) */
  employerCost: number;
  /** Annual net take-home in EUR (after income tax + employee SS + surcharges) */
  net: number;
  /** Total tax collected by the state in EUR. Equals employerCost − net. */
  taxCollected: number;
  /** Effective tax wedge as decimal. Equals taxCollected / employerCost. */
  wedge: number;
}

export interface CostOfLiving {
  /** Monthly rent for a 2-bedroom apartment in city center, EUR */
  rent2brCenter: number;
  /** Numbeo cost-of-living index, ex-rent, NYC = 100 baseline */
  numbeoIdxExRent: number;
  /** Big Mac price, EUR */
  bigMac: number;
  /** Pint of domestic beer in a pub, EUR */
  pint: number;
  /** Monthly public transit pass, EUR */
  transitMonthly: number;
  /** Cappuccino price, EUR */
  cappuccino: number;
}

export interface TaxStructure {
  /** Top marginal income tax rate as decimal (e.g. 0.50 = 50%) */
  topBracketRate: number;
  /** Income threshold (EUR) above which the top rate applies. null if flat tax. */
  topBracketThreshold: number | null;
  /** Annual social security contribution cap, EUR. null if no cap. */
  ssCapEur: number | null;
  /** Free-form notes about the tax regime */
  notes: string[];
}

export interface CityData {
  name: string;
  country: string;
  iso: CountryISO;
  /** Native currency before EUR conversion */
  currency: "EUR" | "GBP" | "PLN" | "CHF";
  /** True if this entry is an aggregate (e.g. EU average) rather than a real city */
  isAggregate?: boolean;
  /** Tax cells, indexed by salary point and profile */
  salaries: Record<SalaryPoint, Record<Profile, CellData>>;
  col: CostOfLiving;
  taxStructure: TaxStructure;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Numbeo ex-rent index used as PPP baseline. 60 ≈ EU average. */
export const PPP_BASELINE = 60;

export const SALARY_POINTS: SalaryPoint[] = [50000, 70000, 100000, 150000, 200000, 250000];

export const PROFILES: Profile[] = ["single", "family"];

export const FX = {
  GBP_PER_EUR: 0.85,
  PLN_PER_EUR: 4.3,
  CHF_PER_EUR: 0.94,
};

export const DATA_VINTAGE = "2026-04-30";

// -----------------------------------------------------------------------------
// Cities
// -----------------------------------------------------------------------------

export const cities: CityData[] = [
  // ---------------------------------------------------------------------------
  // Slovenia — Ljubljana
  // ---------------------------------------------------------------------------
  {
    name: "Ljubljana",
    country: "Slovenia",
    iso: "SI",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2025 brackets via scripts/compute-cells.ts.
      50000: {
        single: { employerCost: 58100, net: 29000, taxCollected: 29100, wedge: 0.5 },
        family: { employerCost: 58100, net: 31700, taxCollected: 26400, wedge: 0.45 },
      },
      70000: {
        single: { employerCost: 81200, net: 39000, taxCollected: 42200, wedge: 0.52 },
        family: { employerCost: 81200, net: 42500, taxCollected: 38700, wedge: 0.48 },
      },
      100000: {
        single: { employerCost: 116000, net: 51500, taxCollected: 64500, wedge: 0.56 },
        family: { employerCost: 116000, net: 55500, taxCollected: 60500, wedge: 0.52 },
      },
      150000: {
        single: { employerCost: 174000, net: 72500, taxCollected: 101500, wedge: 0.58 },
        family: { employerCost: 174000, net: 76500, taxCollected: 97500, wedge: 0.56 },
      },
      200000: {
        single: { employerCost: 232000, net: 92500, taxCollected: 139500, wedge: 0.6 },
        family: { employerCost: 232000, net: 96500, taxCollected: 135500, wedge: 0.58 },
      },
      250000: {
        single: { employerCost: 290300, net: 116400, taxCollected: 173900, wedge: 0.6 },
        family: {
          employerCost: 290300,
          net: 124500,
          taxCollected: 165800,
          wedge: 0.57,
        },
      },
    },
    col: {
      rent2brCenter: 1150,
      numbeoIdxExRent: 53,
      bigMac: 5.0,
      pint: 4.0,
      transitMonthly: 37,
      cappuccino: 2.2,
    },
    taxStructure: {
      topBracketRate: 0.5,
      topBracketThreshold: 78016,
      ssCapEur: null,
      notes: [
        "Brackets 16% / 26% / 33% / 39% / 50%; 50% bracket starts at €78,016 (PwC 2025)",
        "No social security contribution cap; full rates apply at all income levels",
        "Employee SS 22.1%, employer SS 16.1%",
        "Compulsory flat health contribution €35/month (since Jan 2024)",
        "General tax relief phases down with income",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Italy — Milan
  // ---------------------------------------------------------------------------
  {
    name: "Milan",
    country: "Italy",
    iso: "IT",
    currency: "EUR",
    salaries: {
      50000: {
        single: { employerCost: 67400, net: 29900, taxCollected: 37500, wedge: 0.56 },
        family: { employerCost: 67400, net: 32700, taxCollected: 34700, wedge: 0.51 },
      },
      70000: {
        single: { employerCost: 94300, net: 39800, taxCollected: 54500, wedge: 0.58 },
        family: { employerCost: 94300, net: 42800, taxCollected: 51500, wedge: 0.55 },
      },
      100000: {
        single: { employerCost: 131500, net: 53300, taxCollected: 78200, wedge: 0.59 },
        family: { employerCost: 131500, net: 56800, taxCollected: 74700, wedge: 0.57 },
      },
      150000: {
        single: { employerCost: 194500, net: 75800, taxCollected: 118700, wedge: 0.61 },
        family: { employerCost: 194500, net: 79800, taxCollected: 114700, wedge: 0.59 },
      },
      200000: {
        single: { employerCost: 255500, net: 96800, taxCollected: 158700, wedge: 0.62 },
        family: {
          employerCost: 255500,
          net: 100800,
          taxCollected: 154700,
          wedge: 0.61,
        },
      },
      250000: {
        single: {
          employerCost: 339000,
          net: 122200,
          taxCollected: 216800,
          wedge: 0.64,
        },
        family: {
          employerCost: 339000,
          net: 126800,
          taxCollected: 212200,
          wedge: 0.63,
        },
      },
    },
    col: {
      rent2brCenter: 2200,
      numbeoIdxExRent: 67,
      bigMac: 5.8,
      pint: 7.0,
      transitMonthly: 39,
      cappuccino: 1.8,
    },
    taxStructure: {
      topBracketRate: 0.43,
      topBracketThreshold: 50000,
      ssCapEur: null,
      notes: [
        "IRPEF brackets 23% / 35% / 43%",
        "Lombardia regional addizionale 1.73%",
        "Milano municipal addizionale 0.8%",
        "Solidarity contribution 1% above ~€100k INPS ceiling",
        "Employer INPS ~30% with no meaningful cap for executives",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Portugal — Lisbon
  // ---------------------------------------------------------------------------
  {
    name: "Lisbon",
    country: "Portugal",
    iso: "PT",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2026 brackets via scripts/compute-cells.ts.
      50000: {
        single: { employerCost: 61900, net: 33100, taxCollected: 28800, wedge: 0.47 },
        family: { employerCost: 61900, net: 34900, taxCollected: 27000, wedge: 0.44 },
      },
      70000: {
        single: { employerCost: 86625, net: 43800, taxCollected: 42825, wedge: 0.49 },
        family: { employerCost: 86625, net: 47100, taxCollected: 39525, wedge: 0.46 },
      },
      100000: {
        single: { employerCost: 123750, net: 58200, taxCollected: 65550, wedge: 0.53 },
        family: { employerCost: 123750, net: 62400, taxCollected: 61350, wedge: 0.5 },
      },
      150000: {
        single: { employerCost: 185625, net: 81400, taxCollected: 104225, wedge: 0.56 },
        family: { employerCost: 185625, net: 86500, taxCollected: 99125, wedge: 0.53 },
      },
      200000: {
        single: {
          employerCost: 247500,
          net: 104500,
          taxCollected: 143000,
          wedge: 0.58,
        },
        family: {
          employerCost: 247500,
          net: 109800,
          taxCollected: 137700,
          wedge: 0.56,
        },
      },
      250000: {
        single: {
          employerCost: 309400,
          net: 127600,
          taxCollected: 181800,
          wedge: 0.59,
        },
        family: {
          employerCost: 309400,
          net: 132800,
          taxCollected: 176600,
          wedge: 0.57,
        },
      },
    },
    col: {
      rent2brCenter: 1950,
      numbeoIdxExRent: 49,
      bigMac: 5.2,
      pint: 3.5,
      transitMonthly: 40,
      cappuccino: 2.1,
    },
    taxStructure: {
      topBracketRate: 0.48,
      topBracketThreshold: 86634,
      ssCapEur: null,
      notes: [
        "IRS top bracket 48% above €86,634 (PwC 2026)",
        "Solidarity surcharge 2.5% on €80k–€250k slice; 5% above €250k",
        "Employer Social Security (TSU) 23.75%, uncapped",
        "Employee SS 11%",
        "NHR ended for new applicants Jan 2024; IFICI replacement is R&D/qualifying-activities only",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Germany — Berlin
  // ---------------------------------------------------------------------------
  {
    name: "Berlin",
    country: "Germany",
    iso: "DE",
    currency: "EUR",
    salaries: {
      50000: {
        single: { employerCost: 59600, net: 31100, taxCollected: 28500, wedge: 0.48 },
        family: { employerCost: 59600, net: 39000, taxCollected: 20600, wedge: 0.35 },
      },
      70000: {
        single: { employerCost: 83500, net: 41500, taxCollected: 42000, wedge: 0.5 },
        family: { employerCost: 83500, net: 50500, taxCollected: 33000, wedge: 0.4 },
      },
      100000: {
        single: { employerCost: 115200, net: 56000, taxCollected: 59200, wedge: 0.51 },
        family: { employerCost: 115200, net: 68000, taxCollected: 47200, wedge: 0.41 },
      },
      150000: {
        single: { employerCost: 165200, net: 80500, taxCollected: 84700, wedge: 0.51 },
        family: { employerCost: 165200, net: 95500, taxCollected: 69700, wedge: 0.42 },
      },
      200000: {
        single: {
          employerCost: 215200,
          net: 104500,
          taxCollected: 110700,
          wedge: 0.51,
        },
        family: { employerCost: 215200, net: 121000, taxCollected: 94200, wedge: 0.44 },
      },
      250000: {
        single: {
          employerCost: 274500,
          net: 134800,
          taxCollected: 139700,
          wedge: 0.51,
        },
        family: {
          employerCost: 274500,
          net: 152900,
          taxCollected: 121600,
          wedge: 0.44,
        },
      },
    },
    col: {
      rent2brCenter: 1950,
      numbeoIdxExRent: 62,
      bigMac: 5.8,
      pint: 4.5,
      transitMonthly: 49,
      cappuccino: 3.6,
    },
    taxStructure: {
      topBracketRate: 0.45,
      topBracketThreshold: 277826,
      ssCapEur: 96600,
      notes: [
        "Progressive income tax up to 45% (Reichensteuer)",
        "Solidaritätszuschlag 5.5% of income tax, kicks in fully at high incomes",
        "Pension/unemployment SS cap ~€96,600 (2026)",
        "Health/long-term-care cap ~€66,150",
        "Steuerklasse III splitting + €250/month/child Kindergeld for married+children",
        "Church tax excluded",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Netherlands — Amsterdam
  // ---------------------------------------------------------------------------
  {
    name: "Amsterdam",
    country: "Netherlands",
    iso: "NL",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2026 brackets via scripts/compute-cells.ts.
      50000: {
        single: { employerCost: 57000, net: 33400, taxCollected: 23600, wedge: 0.41 },
        family: { employerCost: 57000, net: 35900, taxCollected: 21100, wedge: 0.37 },
      },
      70000: {
        single: { employerCost: 82500, net: 43000, taxCollected: 39500, wedge: 0.48 },
        family: { employerCost: 82500, net: 47000, taxCollected: 35500, wedge: 0.43 },
      },
      100000: {
        single: { employerCost: 113500, net: 57500, taxCollected: 56000, wedge: 0.49 },
        family: { employerCost: 113500, net: 61500, taxCollected: 52000, wedge: 0.46 },
      },
      150000: {
        single: { employerCost: 161500, net: 83000, taxCollected: 78500, wedge: 0.49 },
        family: { employerCost: 161500, net: 87000, taxCollected: 74500, wedge: 0.46 },
      },
      200000: {
        single: {
          employerCost: 211500,
          net: 107500,
          taxCollected: 104000,
          wedge: 0.49,
        },
        family: {
          employerCost: 211500,
          net: 111500,
          taxCollected: 100000,
          wedge: 0.47,
        },
      },
      250000: {
        single: {
          employerCost: 268000,
          net: 138900,
          taxCollected: 129100,
          wedge: 0.48,
        },
        family: {
          employerCost: 268000,
          net: 142200,
          taxCollected: 125800,
          wedge: 0.47,
        },
      },
    },
    col: {
      rent2brCenter: 2650,
      numbeoIdxExRent: 70,
      bigMac: 6.1,
      pint: 5.5,
      transitMonthly: 100,
      cappuccino: 3.8,
    },
    taxStructure: {
      topBracketRate: 0.495,
      topBracketThreshold: 78426,
      ssCapEur: 71000,
      notes: [
        "Box 1 income tax + Zvw health insurance",
        "Top bracket 49.5% above €78,426 (PwC 2026)",
        "Employer SS effectively caps near €71k",
        "30% ruling not applied; with ruling (2024 phasing 30/20/10), €100k single nets ~€68k",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Spain — Barcelona
  // ---------------------------------------------------------------------------
  {
    name: "Barcelona",
    country: "Spain",
    iso: "ES",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2025 brackets via scripts/compute-cells.ts.
      50000: {
        single: { employerCost: 65300, net: 35300, taxCollected: 30000, wedge: 0.46 },
        family: { employerCost: 65300, net: 37800, taxCollected: 27500, wedge: 0.42 },
      },
      70000: {
        single: { employerCost: 91000, net: 47000, taxCollected: 44000, wedge: 0.48 },
        family: { employerCost: 91000, net: 49500, taxCollected: 41500, wedge: 0.46 },
      },
      100000: {
        single: { employerCost: 123300, net: 63500, taxCollected: 59800, wedge: 0.49 },
        family: { employerCost: 123300, net: 66000, taxCollected: 57300, wedge: 0.46 },
      },
      150000: {
        single: { employerCost: 165800, net: 89000, taxCollected: 76800, wedge: 0.46 },
        family: { employerCost: 165800, net: 91500, taxCollected: 74300, wedge: 0.45 },
      },
      200000: {
        single: {
          employerCost: 215800,
          net: 113500,
          taxCollected: 102300,
          wedge: 0.47,
        },
        family: { employerCost: 215800, net: 116000, taxCollected: 99800, wedge: 0.46 },
      },
      250000: {
        single: {
          employerCost: 282000,
          net: 132500,
          taxCollected: 149500,
          wedge: 0.53,
        },
        family: {
          employerCost: 282000,
          net: 137200,
          taxCollected: 144800,
          wedge: 0.51,
        },
      },
    },
    col: {
      rent2brCenter: 1750,
      numbeoIdxExRent: 56,
      bigMac: 5.3,
      pint: 4.0,
      transitMonthly: 22,
      cappuccino: 2.3,
    },
    taxStructure: {
      topBracketRate: 0.5,
      topBracketThreshold: 175000,
      ssCapEur: 59000,
      notes: [
        "National + Catalonia regional brackets, top 50% above ~€175k",
        "Employer SS ~30% capped at ~€59k base; above cap, ~7% solidarity charge applies",
        "Catalonia 2024 reform applied",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Croatia — Zagreb
  // ---------------------------------------------------------------------------
  {
    name: "Zagreb",
    country: "Croatia",
    iso: "HR",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2025 brackets via scripts/compute-cells.ts.
      50000: {
        single: { employerCost: 58300, net: 32500, taxCollected: 25800, wedge: 0.44 },
        family: { employerCost: 58300, net: 34000, taxCollected: 24300, wedge: 0.42 },
      },
      70000: {
        single: { employerCost: 81550, net: 44800, taxCollected: 36750, wedge: 0.45 },
        family: { employerCost: 81550, net: 46200, taxCollected: 35350, wedge: 0.43 },
      },
      100000: {
        single: { employerCost: 116500, net: 62000, taxCollected: 54500, wedge: 0.47 },
        family: { employerCost: 116500, net: 63400, taxCollected: 53100, wedge: 0.46 },
      },
      150000: {
        single: { employerCost: 174750, net: 91000, taxCollected: 83750, wedge: 0.48 },
        family: { employerCost: 174750, net: 92400, taxCollected: 82350, wedge: 0.47 },
      },
      200000: {
        single: {
          employerCost: 233000,
          net: 119500,
          taxCollected: 113500,
          wedge: 0.49,
        },
        family: {
          employerCost: 233000,
          net: 120900,
          taxCollected: 112100,
          wedge: 0.48,
        },
      },
      250000: {
        single: {
          employerCost: 291250,
          net: 148000,
          taxCollected: 143250,
          wedge: 0.49,
        },
        family: {
          employerCost: 291250,
          net: 149400,
          taxCollected: 141850,
          wedge: 0.49,
        },
      },
    },
    col: {
      rent2brCenter: 900,
      numbeoIdxExRent: 47,
      bigMac: 5.1,
      pint: 3.5,
      transitMonthly: 40,
      cappuccino: 2.0,
    },
    taxStructure: {
      topBracketRate: 0.33,
      topBracketThreshold: 60000,
      ssCapEur: 81000,
      notes: [
        "Zagreb sets the maximum effective rates: 23% to €60k, 33% above",
        "Croatian 2024 reform abolished prirez surtax; municipalities now set rates within ranges",
        "Employee pension 20% (15% pillar I uncapped + 5% pillar II capped at ~€81k base)",
        "Employer health 16.5%, uncapped",
        "Personal allowance €7,200/year",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Ireland — Dublin
  // ---------------------------------------------------------------------------
  {
    name: "Dublin",
    country: "Ireland",
    iso: "IE",
    currency: "EUR",
    salaries: {
      50000: {
        single: { employerCost: 55700, net: 39600, taxCollected: 16100, wedge: 0.29 },
        family: { employerCost: 55700, net: 44800, taxCollected: 10900, wedge: 0.2 },
      },
      70000: {
        single: { employerCost: 77900, net: 50200, taxCollected: 27700, wedge: 0.36 },
        family: { employerCost: 77900, net: 55900, taxCollected: 22000, wedge: 0.28 },
      },
      100000: {
        single: { employerCost: 111300, net: 64500, taxCollected: 46800, wedge: 0.42 },
        family: { employerCost: 111300, net: 70200, taxCollected: 41100, wedge: 0.37 },
      },
      150000: {
        single: { employerCost: 167000, net: 88300, taxCollected: 78700, wedge: 0.47 },
        family: { employerCost: 167000, net: 94100, taxCollected: 72900, wedge: 0.44 },
      },
      200000: {
        single: { employerCost: 222700, net: 112200, taxCollected: 110500, wedge: 0.5 },
        family: { employerCost: 222700, net: 118000, taxCollected: 104700, wedge: 0.47 },
      },
      250000: {
        single: { employerCost: 278300, net: 136100, taxCollected: 142200, wedge: 0.51 },
        family: { employerCost: 278300, net: 141800, taxCollected: 136500, wedge: 0.49 },
      },
    },
    col: {
      rent2brCenter: 2800,
      numbeoIdxExRent: 73,
      bigMac: 5.4,
      pint: 6.5,
      transitMonthly: 100,
      cappuccino: 4.0,
    },
    taxStructure: {
      topBracketRate: 0.4,
      topBracketThreshold: 44000,
      ssCapEur: null,
      notes: [
        "PAYE 40% above standard rate cut-off (~€44k single, €53k married)",
        "USC + PRSI on top of income tax",
        "Employer PRSI 11.15%, no cap",
        "Married-couple full standard rate band transfer + home-carer credit applied for family profile",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Denmark — Copenhagen
  // ---------------------------------------------------------------------------
  {
    name: "Copenhagen",
    country: "Denmark",
    iso: "DK",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2026 brackets via scripts/compute-cells.ts (post-reform).
      50000: {
        single: { employerCost: 52500, net: 31800, taxCollected: 20700, wedge: 0.39 },
        family: { employerCost: 52500, net: 32600, taxCollected: 19900, wedge: 0.38 },
      },
      70000: {
        single: { employerCost: 71300, net: 41500, taxCollected: 29800, wedge: 0.42 },
        family: { employerCost: 71300, net: 43500, taxCollected: 27800, wedge: 0.39 },
      },
      100000: {
        single: { employerCost: 101800, net: 56500, taxCollected: 45300, wedge: 0.45 },
        family: { employerCost: 101800, net: 58500, taxCollected: 43300, wedge: 0.43 },
      },
      150000: {
        single: { employerCost: 152800, net: 81500, taxCollected: 71300, wedge: 0.47 },
        family: { employerCost: 152800, net: 83500, taxCollected: 69300, wedge: 0.45 },
      },
      200000: {
        single: { employerCost: 203800, net: 106000, taxCollected: 97800, wedge: 0.48 },
        family: { employerCost: 203800, net: 108000, taxCollected: 95800, wedge: 0.47 },
      },
      250000: {
        single: { employerCost: 251500, net: 126300, taxCollected: 125200, wedge: 0.5 },
        family: {
          employerCost: 251500,
          net: 128400,
          taxCollected: 123100,
          wedge: 0.49,
        },
      },
    },
    col: {
      rent2brCenter: 2400,
      numbeoIdxExRent: 80,
      bigMac: 6.5,
      pint: 7.0,
      transitMonthly: 60,
      cappuccino: 5.2,
    },
    taxStructure: {
      topBracketRate: 0.605,
      topBracketThreshold: 113000,
      ssCapEur: null,
      notes: [
        "AM-bidrag 8% before income tax",
        "Municipal Copenhagen ~23.65%; bottom-bracket state tax 12.01%",
        "2026 reform: topskat now 7.5% above DKK 845,543 (~€113k); a new mellemskat 7.5% kicks in at the prior threshold; combined marginal cap 60.5%",
        "Employer SS minimal (~€1,500–3,500/year flat)",
        "Church tax excluded",
        "Cell values for Copenhagen may not yet reflect the 2026 reform; treat as approximate at the high end",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Estonia — Tallinn
  // ---------------------------------------------------------------------------
  {
    name: "Tallinn",
    country: "Estonia",
    iso: "EE",
    currency: "EUR",
    salaries: {
      // 50000 computed from PwC 2026 brackets via scripts/compute-cells.ts.
      50000: {
        single: { employerCost: 66900, net: 37600, taxCollected: 29300, wedge: 0.44 },
        family: { employerCost: 66900, net: 37600, taxCollected: 29300, wedge: 0.44 },
      },
      70000: {
        single: { employerCost: 93660, net: 52600, taxCollected: 41060, wedge: 0.44 },
        family: { employerCost: 93660, net: 53600, taxCollected: 40060, wedge: 0.43 },
      },
      100000: {
        single: { employerCost: 133800, net: 75200, taxCollected: 58600, wedge: 0.44 },
        family: { employerCost: 133800, net: 76200, taxCollected: 57600, wedge: 0.43 },
      },
      150000: {
        single: { employerCost: 200700, net: 112800, taxCollected: 87900, wedge: 0.44 },
        family: { employerCost: 200700, net: 113800, taxCollected: 86900, wedge: 0.43 },
      },
      200000: {
        single: {
          employerCost: 267600,
          net: 150400,
          taxCollected: 117200,
          wedge: 0.44,
        },
        family: {
          employerCost: 267600,
          net: 151400,
          taxCollected: 116200,
          wedge: 0.43,
        },
      },
      250000: {
        single: {
          employerCost: 334500,
          net: 188000,
          taxCollected: 146500,
          wedge: 0.44,
        },
        family: {
          employerCost: 334500,
          net: 189000,
          taxCollected: 145500,
          wedge: 0.43,
        },
      },
    },
    col: {
      rent2brCenter: 1100,
      numbeoIdxExRent: 52,
      bigMac: 5.3,
      pint: 5.0,
      transitMonthly: 30,
      cappuccino: 3.5,
    },
    taxStructure: {
      topBracketRate: 0.22,
      topBracketThreshold: null,
      ssCapEur: null,
      notes: [
        "Flat 22% income tax",
        "Employer social tax 33% + 0.8% unemployment",
        "Employee unemployment 1.6% + 2% mandatory funded pension",
        "Tax-free allowance phased out for high earners",
        "24% rate planned for 2026 was cancelled by the Riigikogu in December 2025",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Poland — Warsaw
  // ---------------------------------------------------------------------------
  {
    name: "Warsaw",
    country: "Poland",
    iso: "PL",
    currency: "PLN",
    salaries: {
      50000: {
        single: { employerCost: 60000, net: 31900, taxCollected: 28100, wedge: 0.47 },
        family: { employerCost: 60000, net: 32400, taxCollected: 27600, wedge: 0.46 },
      },
      70000: {
        single: { employerCost: 83300, net: 42300, taxCollected: 41000, wedge: 0.49 },
        family: { employerCost: 83300, net: 42900, taxCollected: 40400, wedge: 0.48 },
      },
      100000: {
        single: { employerCost: 114500, net: 59600, taxCollected: 54900, wedge: 0.48 },
        family: { employerCost: 114500, net: 60100, taxCollected: 54400, wedge: 0.48 },
      },
      150000: {
        single: { employerCost: 166500, net: 88400, taxCollected: 78100, wedge: 0.47 },
        family: { employerCost: 166500, net: 88900, taxCollected: 77600, wedge: 0.47 },
      },
      200000: {
        single: { employerCost: 218500, net: 117200, taxCollected: 101300, wedge: 0.46 },
        family: { employerCost: 218500, net: 117700, taxCollected: 100800, wedge: 0.46 },
      },
      250000: {
        single: { employerCost: 270500, net: 145200, taxCollected: 125300, wedge: 0.46 },
        family: { employerCost: 270500, net: 145800, taxCollected: 124700, wedge: 0.46 },
      },
    },
    col: {
      rent2brCenter: 1400,
      numbeoIdxExRent: 42,
      bigMac: 5.1,
      pint: 3.2,
      transitMonthly: 25,
      cappuccino: 3.8,
    },
    taxStructure: {
      topBracketRate: 0.32,
      topBracketThreshold: 27800,
      ssCapEur: 60000,
      notes: [
        "PIT 12% to PLN 120k (~€28k); 32% above",
        "Health insurance 9% non-deductible",
        "ZUS caps at PLN 260k (~€60k) base; above the cap, employer marginal SS ~3.5% and employee SS effectively stops",
        "4% solidarity levy above PLN 1m (~€233k)",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // United Kingdom — London
  // ---------------------------------------------------------------------------
  {
    name: "London",
    country: "United Kingdom",
    iso: "GB",
    currency: "GBP",
    salaries: {
      50000: {
        single: { employerCost: 56600, net: 40100, taxCollected: 16500, wedge: 0.29 },
        family: { employerCost: 56600, net: 43000, taxCollected: 13600, wedge: 0.24 },
      },
      70000: {
        single: { employerCost: 79600, net: 53000, taxCollected: 26600, wedge: 0.33 },
        family: { employerCost: 79600, net: 55900, taxCollected: 23700, wedge: 0.3 },
      },
      100000: {
        single: { employerCost: 114100, net: 70400, taxCollected: 43700, wedge: 0.38 },
        family: { employerCost: 114100, net: 70700, taxCollected: 43400, wedge: 0.38 },
      },
      150000: {
        single: { employerCost: 171600, net: 92600, taxCollected: 79000, wedge: 0.46 },
        family: { employerCost: 171600, net: 92900, taxCollected: 78700, wedge: 0.46 },
      },
      200000: {
        single: { employerCost: 229100, net: 119100, taxCollected: 110000, wedge: 0.48 },
        family: { employerCost: 229100, net: 119400, taxCollected: 109700, wedge: 0.48 },
      },
      250000: {
        single: { employerCost: 286600, net: 145600, taxCollected: 141000, wedge: 0.49 },
        family: { employerCost: 286600, net: 145900, taxCollected: 140700, wedge: 0.49 },
      },
    },
    col: {
      rent2brCenter: 3400,
      numbeoIdxExRent: 75,
      bigMac: 5.9,
      pint: 7.1,
      transitMonthly: 200,
      cappuccino: 4.2,
    },
    taxStructure: {
      topBracketRate: 0.45,
      topBracketThreshold: 147000,
      ssCapEur: null,
      notes: [
        "UK income tax brackets 20% / 40% / 45%",
        "Personal allowance withdrawn between £100k–£125k (effective 60% rate band)",
        "Top 45% rate above £125,140 (~€147k)",
        "Employer NI 15% post-April 2025 reform, £5k threshold, no cap",
        "Marriage Allowance limited at this income; Child Benefit clawed back fully above £80k",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Switzerland — Zurich
  // ---------------------------------------------------------------------------
  {
    name: "Zurich",
    country: "Switzerland",
    iso: "CH",
    currency: "CHF",
    salaries: {
      50000: {
        single: { employerCost: 54100, net: 42900, taxCollected: 11200, wedge: 0.21 },
        family: { employerCost: 54100, net: 46000, taxCollected: 8100, wedge: 0.15 },
      },
      70000: {
        single: { employerCost: 75700, net: 58400, taxCollected: 17300, wedge: 0.23 },
        family: { employerCost: 75700, net: 62900, taxCollected: 12800, wedge: 0.17 },
      },
      100000: {
        single: { employerCost: 108200, net: 80200, taxCollected: 28000, wedge: 0.26 },
        family: { employerCost: 108200, net: 86800, taxCollected: 21400, wedge: 0.2 },
      },
      150000: {
        single: { employerCost: 162300, net: 113200, taxCollected: 49100, wedge: 0.3 },
        family: { employerCost: 162300, net: 123800, taxCollected: 38500, wedge: 0.24 },
      },
      200000: {
        single: { employerCost: 216100, net: 143700, taxCollected: 72400, wedge: 0.34 },
        family: { employerCost: 216100, net: 158600, taxCollected: 57500, wedge: 0.27 },
      },
      250000: {
        single: { employerCost: 269900, net: 173100, taxCollected: 96800, wedge: 0.36 },
        family: { employerCost: 269900, net: 191400, taxCollected: 78500, wedge: 0.29 },
      },
    },
    col: {
      rent2brCenter: 4170,
      numbeoIdxExRent: 99,
      bigMac: 7.55,
      pint: 10.1,
      transitMonthly: 90,
      cappuccino: 5.55,
    },
    taxStructure: {
      topBracketRate: 0.4,
      topBracketThreshold: 319000,
      ssCapEur: 139000,
      notes: [
        "Federal direct tax 0% to 11.5% top, married couples taxed jointly",
        "Zurich canton 99% × cantonal basis tax + Zurich city 119% × basis (218% combined)",
        "AHV/IV/EO 5.3% employee + 5.3% employer, uncapped",
        "ALV 1.1% to CHF 148,200 (~€139k); 0.5% solidarity above (both sides)",
        "BVG 2nd-pillar pension excluded — see methodology",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // EU average (aggregate, not a real city)
  // ---------------------------------------------------------------------------
  {
    name: "EU average",
    country: "EU",
    iso: "EU",
    currency: "EUR",
    isAggregate: true,
    salaries: {
      50000: {
        single: { employerCost: 60000, net: 32600, taxCollected: 27400, wedge: 0.46 },
        family: { employerCost: 60000, net: 35900, taxCollected: 24100, wedge: 0.4 },
      },
      70000: {
        single: { employerCost: 84000, net: 43500, taxCollected: 40500, wedge: 0.48 },
        family: { employerCost: 84000, net: 47000, taxCollected: 37000, wedge: 0.44 },
      },
      100000: {
        single: { employerCost: 120000, net: 58500, taxCollected: 61500, wedge: 0.51 },
        family: { employerCost: 120000, net: 62500, taxCollected: 57500, wedge: 0.48 },
      },
      150000: {
        single: { employerCost: 180000, net: 83000, taxCollected: 97000, wedge: 0.54 },
        family: { employerCost: 180000, net: 87500, taxCollected: 92500, wedge: 0.51 },
      },
      200000: {
        single: {
          employerCost: 240000,
          net: 106000,
          taxCollected: 134000,
          wedge: 0.56,
        },
        family: {
          employerCost: 240000,
          net: 110500,
          taxCollected: 129500,
          wedge: 0.54,
        },
      },
      250000: {
        single: {
          employerCost: 300000,
          net: 130000,
          taxCollected: 170000,
          wedge: 0.57,
        },
        family: {
          employerCost: 300000,
          net: 135000,
          taxCollected: 165000,
          wedge: 0.55,
        },
      },
    },
    col: {
      rent2brCenter: 1800,
      numbeoIdxExRent: 60,
      bigMac: 5.5,
      pint: 4.8,
      transitMonthly: 60,
      cappuccino: 3.0,
    },
    taxStructure: {
      topBracketRate: 0.45,
      topBracketThreshold: null,
      ssCapEur: null,
      notes: [
        "Illustrative aggregate, not from a single official source",
        "OECD Taxing Wages 2025 puts employer SS load at ~20% on average for EU-27",
      ],
    },
  },
];

// -----------------------------------------------------------------------------
// Computed metric helpers
// -----------------------------------------------------------------------------

/** Employer total cost per €1 of net take-home. e.g. 2.25 means "company spent €2.25 for every €1 the engineer banked". */
export const eurPerEuroNet = (cell: CellData): number => cell.employerCost / cell.net;

/**
 * Real net adjusted for local cost of living (ex-rent), normalised to PPP_BASELINE.
 * A city with idx 75 (London) gets multiplier 60/75 = 0.80.
 * A city with idx 42 (Warsaw) gets multiplier 60/42 ≈ 1.43.
 */
export const realNetPpp = (cell: CellData, col: CostOfLiving): number =>
  cell.net * (PPP_BASELINE / col.numbeoIdxExRent);

/** Years of city-center 2BR rent that the annual net buys. */
export const rentYears = (cell: CellData, col: CostOfLiving): number =>
  cell.net / (12 * col.rent2brCenter);

// -----------------------------------------------------------------------------
// Sorting and ranking helpers
// -----------------------------------------------------------------------------

/** Sort comparator: by €/€1 net (descending — highest cost-per-€1 first). */
export const compareByEurPerEuroNet =
  (salary: SalaryPoint = 100000, profile: Profile = "single") =>
  (a: CityData, b: CityData): number =>
    eurPerEuroNet(b.salaries[salary][profile]) -
    eurPerEuroNet(a.salaries[salary][profile]);

/** Sort comparator: by tax wedge (descending). */
export const compareByWedge =
  (salary: SalaryPoint = 100000, profile: Profile = "single") =>
  (a: CityData, b: CityData): number =>
    b.salaries[salary][profile].wedge - a.salaries[salary][profile].wedge;

/** Sort comparator: by net take-home (descending). */
export const compareByNet =
  (salary: SalaryPoint = 100000, profile: Profile = "single") =>
  (a: CityData, b: CityData): number =>
    b.salaries[salary][profile].net - a.salaries[salary][profile].net;

/** Sort comparator: by absolute tax collected (descending). */
export const compareByTaxCollected =
  (salary: SalaryPoint = 100000, profile: Profile = "single") =>
  (a: CityData, b: CityData): number =>
    b.salaries[salary][profile].taxCollected - a.salaries[salary][profile].taxCollected;

/** Sort comparator: by real net (PPP) descending. */
export const compareByRealNet =
  (salary: SalaryPoint = 100000, profile: Profile = "single") =>
  (a: CityData, b: CityData): number =>
    realNetPpp(b.salaries[salary][profile], b.col) -
    realNetPpp(a.salaries[salary][profile], a.col);

// -----------------------------------------------------------------------------
// Convenience lookups
// -----------------------------------------------------------------------------

export const findCity = (name: string): CityData | undefined =>
  cities.find((c) => c.name.toLowerCase() === name.toLowerCase());

export const realCities = (): CityData[] => cities.filter((c) => !c.isAggregate);

/** All distinct profiles for type-safe iteration. */
export const ALL_PROFILES: readonly Profile[] = ["single", "family"] as const;
