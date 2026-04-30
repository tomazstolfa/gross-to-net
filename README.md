# gross-to-net

Open-source comparison of **employer cost vs net take-home** across 13 European cities.

Twelve cities — Ljubljana, Milan, Lisbon, Berlin, Amsterdam, Barcelona, Zagreb, Dublin, Copenhagen, Tallinn, Warsaw, London — plus an EU aggregate. Five salary points (€70k–€250k). Two household profiles (single; married, single-earner, two children). All values in EUR, with a separate view normalised for local cost of living via a Numbeo-based PPP factor.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Sections

1. **Hero** — what the project shows.
2. **Selected city** — employer cost, tax collected, net, € per €1 net.
3. **Comparison table** — sortable; click a row to pin a city through every chart below.
4. **Stacked bar** — `tax + net = employer cost`, one bar per city.
5. **City profile** — per-city tax structure for whichever city is pinned.
6. **PPP chart** — net adjusted for local cost of living.
7. **Progressive curve** — effective wedge as gross income climbs.
8. **Methodology** — sources, profiles, FX, PPP method, caveats.
9. **Footer**.

## Local development

Requires Node 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build      # static export to ./out
npm run lint
npm run typecheck
npm run format
```

## Stack

- Next.js 14 (App Router), TypeScript, static export (`output: 'export'`)
- Tailwind CSS, neutral slate palette with a single amber-500 accent for hover-driven highlight
- Recharts for visualizations
- Inter (body) + Source Serif 4 (headings) via `next/font/google`
- No backend, no DB — all data is in [`lib/data.ts`](lib/data.ts)

## Data

- `lib/data.ts` defines the type, the 13 entries, and small helpers (`eurPerEuroNet`, `realNetPpp`, `rentYears`, sort comparators).
- Sources are listed in the Methodology section in-app and in the file header. Notable inputs: PwC and KPMG 2025/2026 tax tables, country tax-authority calculators (FURS, EMTA, Revenue.ie, HMRC, Belastingdienst, Bundeszentralamt, AT-PT, KIS PL, Porezna Uprava HR), Workplace.hr Slovenia 2026 calculator, Numbeo April 2026, Eurofast Croatia Tax Card 2025, EY Estonia 2025-2026 tax alert.
- FX snapshot in `lib/data.ts` (`FX.GBP_PER_EUR`, `FX.PLN_PER_EUR`); data vintage in `DATA_VINTAGE`.
- Special tax regimes (NL 30%, ES Beckham, IT impatriati, PL IP-Box) are deliberately excluded from v0; see the Methodology caveats.

## Contributing

PRs welcome. The high-leverage edit is updating `lib/data.ts` when a country reforms — please cite the official source in the PR. Bracket changes, SS-cap moves, and FX revisions are the most common.

## Deploy

Build is a static export — drop `out/` on Vercel, GitHub Pages, S3, or any static host.

```bash
npm run build
```

## License

MIT — see [LICENSE](LICENSE).
