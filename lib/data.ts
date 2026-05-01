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
        single: { employerCost: 65000, net: 32500, taxCollected: 32500, wedge: 0.5 },
        family: { employerCost: 65000, net: 34600, taxCollected: 30400, wedge: 0.47 },
      },
      70000: {
        single: { employerCost: 91000, net: 42300, taxCollected: 48700, wedge: 0.54 },
        family: { employerCost: 91000, net: 44400, taxCollected: 46600, wedge: 0.51 },
      },
      100000: {
        single: { employerCost: 130000, net: 57000, taxCollected: 73000, wedge: 0.56 },
        family: { employerCost: 130000, net: 59100, taxCollected: 70900, wedge: 0.55 },
      },
      150000: {
        single: { employerCost: 195000, net: 83000, taxCollected: 112000, wedge: 0.57 },
        family: { employerCost: 195000, net: 85100, taxCollected: 109900, wedge: 0.56 },
      },
      200000: {
        single: { employerCost: 260000, net: 110300, taxCollected: 149700, wedge: 0.58 },
        family: { employerCost: 260000, net: 112300, taxCollected: 147700, wedge: 0.57 },
      },
      250000: {
        single: { employerCost: 325000, net: 137500, taxCollected: 187500, wedge: 0.58 },
        family: { employerCost: 325000, net: 139600, taxCollected: 185400, wedge: 0.57 },
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
      ssCapEur: 122295,
      notes: [
        "IRPEF 2026 brackets 23% / 33% / 43% (post Legge di Bilancio 2026)",
        "Lombardia regional addizionale 1.73%",
        "Milano municipal addizionale 0.8% (above €21k threshold)",
        "INPS employee 9.19% to €56,224, then +1% solidarity to €122,295 (massimale)",
        "Employer INPS ~30% (general employee; dirigenti add Previndai/FASI)",
        "Assegno Unico Universale ~€1,400/yr for 2 kids at this income (separate cash transfer, included in family net)",
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
      50000: {
        single: { employerCost: 63500, net: 33100, taxCollected: 30400, wedge: 0.48 },
        family: { employerCost: 63500, net: 34900, taxCollected: 28600, wedge: 0.45 },
      },
      70000: {
        single: { employerCost: 88800, net: 43800, taxCollected: 45000, wedge: 0.51 },
        family: { employerCost: 88800, net: 44200, taxCollected: 44600, wedge: 0.5 },
      },
      100000: {
        single: { employerCost: 126900, net: 58200, taxCollected: 68700, wedge: 0.54 },
        family: { employerCost: 126900, net: 62400, taxCollected: 64500, wedge: 0.51 },
      },
      150000: {
        single: { employerCost: 190400, net: 81400, taxCollected: 109000, wedge: 0.57 },
        family: { employerCost: 190400, net: 86500, taxCollected: 103900, wedge: 0.55 },
      },
      200000: {
        single: { employerCost: 253800, net: 104500, taxCollected: 149300, wedge: 0.59 },
        family: { employerCost: 253800, net: 109800, taxCollected: 144000, wedge: 0.57 },
      },
      250000: {
        single: { employerCost: 317300, net: 127600, taxCollected: 189700, wedge: 0.6 },
        family: { employerCost: 317300, net: 132800, taxCollected: 184500, wedge: 0.58 },
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
        "Employer Social Security 26.90% (TSU 23.75% + work-accident 3.15%), uncapped",
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
        single: { employerCost: 60800, net: 32300, taxCollected: 28500, wedge: 0.47 },
        family: { employerCost: 60800, net: 42500, taxCollected: 18300, wedge: 0.3 },
      },
      70000: {
        single: { employerCost: 85100, net: 42600, taxCollected: 42500, wedge: 0.5 },
        family: { employerCost: 85100, net: 54100, taxCollected: 31000, wedge: 0.36 },
      },
      100000: {
        single: { employerCost: 119700, net: 62300, taxCollected: 57400, wedge: 0.48 },
        family: { employerCost: 119700, net: 77800, taxCollected: 41900, wedge: 0.35 },
      },
      150000: {
        single: { employerCost: 171700, net: 88000, taxCollected: 83700, wedge: 0.49 },
        family: { employerCost: 171700, net: 108100, taxCollected: 63600, wedge: 0.37 },
      },
      200000: {
        single: { employerCost: 221700, net: 112600, taxCollected: 109100, wedge: 0.49 },
        family: { employerCost: 221700, net: 135100, taxCollected: 86600, wedge: 0.39 },
      },
      250000: {
        single: { employerCost: 271700, net: 138400, taxCollected: 133300, wedge: 0.49 },
        family: { employerCost: 271700, net: 160300, taxCollected: 111400, wedge: 0.41 },
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
      ssCapEur: 101400,
      notes: [
        "Progressive income tax up to 45% (Reichensteuer); 42% from €69,879 in 2026",
        "Grundfreibetrag €12,348 (single) / €24,696 (joint splitting)",
        "Solidaritätszuschlag 5.5% above ~€20,350 Lohnsteuer (single) / €40,700 (joint)",
        "Pension + unemployment SS cap €101,400 (2026)",
        "Health + long-term care cap €69,750",
        "Steuerklasse III splitting + Kindergeld €259/mo/child for family (€6,216/yr for 2 kids, included in net)",
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
      50000: {
        single: { employerCost: 58800, net: 33400, taxCollected: 25400, wedge: 0.43 },
        family: { employerCost: 58800, net: 35900, taxCollected: 22900, wedge: 0.39 },
      },
      70000: {
        single: { employerCost: 82400, net: 43000, taxCollected: 39400, wedge: 0.48 },
        family: { employerCost: 82400, net: 47000, taxCollected: 35400, wedge: 0.43 },
      },
      100000: {
        single: { employerCost: 113500, net: 57500, taxCollected: 56000, wedge: 0.49 },
        family: { employerCost: 113500, net: 61500, taxCollected: 52000, wedge: 0.46 },
      },
      150000: {
        single: { employerCost: 163500, net: 83000, taxCollected: 80500, wedge: 0.49 },
        family: { employerCost: 163500, net: 87000, taxCollected: 76500, wedge: 0.47 },
      },
      200000: {
        single: { employerCost: 213500, net: 107500, taxCollected: 106000, wedge: 0.5 },
        family: { employerCost: 213500, net: 111500, taxCollected: 102000, wedge: 0.48 },
      },
      250000: {
        single: { employerCost: 263500, net: 138900, taxCollected: 124600, wedge: 0.47 },
        family: { employerCost: 263500, net: 142200, taxCollected: 121300, wedge: 0.46 },
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
      ssCapEur: 76300,
      notes: [
        "Box 1 income tax + Zvw health insurance",
        "Top bracket 49.5% above €78,426 (PwC 2026)",
        "Employer SS 17.65% (WW Awf 2.74% + WIA-Aof 7.05% + Zvw 6.51% + WHK ~1.35%) capped at €76,300; nothing above",
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
      50000: {
        single: { employerCost: 66000, net: 35300, taxCollected: 30700, wedge: 0.47 },
        family: { employerCost: 66000, net: 37800, taxCollected: 28200, wedge: 0.43 },
      },
      70000: {
        single: { employerCost: 89700, net: 47000, taxCollected: 42700, wedge: 0.48 },
        family: { employerCost: 89700, net: 49500, taxCollected: 40200, wedge: 0.45 },
      },
      100000: {
        single: { employerCost: 120000, net: 63500, taxCollected: 56500, wedge: 0.47 },
        family: { employerCost: 120000, net: 66000, taxCollected: 54000, wedge: 0.45 },
      },
      150000: {
        single: { employerCost: 170600, net: 89000, taxCollected: 81600, wedge: 0.48 },
        family: { employerCost: 170600, net: 91500, taxCollected: 79100, wedge: 0.46 },
      },
      200000: {
        single: { employerCost: 221200, net: 113500, taxCollected: 107700, wedge: 0.49 },
        family: { employerCost: 221200, net: 116000, taxCollected: 105200, wedge: 0.48 },
      },
      250000: {
        single: { employerCost: 271800, net: 132500, taxCollected: 139300, wedge: 0.51 },
        family: { employerCost: 271800, net: 137200, taxCollected: 134600, wedge: 0.5 },
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
      ssCapEur: 61224,
      notes: [
        "National + Catalonia regional brackets, top 50% above ~€175k",
        "Employer SS 31.98% (common contingencies 23.6% + unemployment 5.5% + IT/death 1.5% + MEI 0.75% + training 0.6% + FOGASA 0.2%)",
        "Capped at €61,224 (2026 max base); above cap, 1.2% solidarity charge applies",
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
      50000: {
        single: { employerCost: 51300, net: 34200, taxCollected: 17100, wedge: 0.33 },
        family: { employerCost: 51300, net: 39500, taxCollected: 11800, wedge: 0.23 },
      },
      70000: {
        single: { employerCost: 71300, net: 45500, taxCollected: 25800, wedge: 0.36 },
        family: { employerCost: 71300, net: 50800, taxCollected: 20500, wedge: 0.29 },
      },
      100000: {
        single: { employerCost: 101300, net: 61600, taxCollected: 39700, wedge: 0.39 },
        family: { employerCost: 101300, net: 66900, taxCollected: 34400, wedge: 0.34 },
      },
      150000: {
        single: { employerCost: 151300, net: 86400, taxCollected: 64900, wedge: 0.43 },
        family: { employerCost: 151300, net: 91700, taxCollected: 59600, wedge: 0.39 },
      },
      200000: {
        single: { employerCost: 201300, net: 110400, taxCollected: 90900, wedge: 0.45 },
        family: { employerCost: 201300, net: 115700, taxCollected: 85600, wedge: 0.43 },
      },
      250000: {
        single: { employerCost: 251300, net: 134400, taxCollected: 116900, wedge: 0.47 },
        family: { employerCost: 251300, net: 139700, taxCollected: 111600, wedge: 0.44 },
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
        "Municipal Copenhagen 23.50%; bottom-bracket state tax 12.01%",
        "Beskæftigelsesfradrag (employment allowance) 12.30%, capped at DKK 55,600 (~€7,453)",
        "Mellemskat 7.5% above DKK 696,956 (~€93k); topskat 7.5% above DKK 845,543 (~€113k); top-top 5% above DKK 2,818,152",
        "Combined marginal cap 60.5%; personfradrag DKK 51,600 (~€6,915)",
        "Employer SS effectively flat (~€1,340/year ATP+AES+AUB+Barsel)",
        "Family adds børneydelse for 2 kids age 7-14 (DKK 26,760 = €3,587/yr) + spouse personfradrag transfer (~€1,742)",
        "Church tax excluded",
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
