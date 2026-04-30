"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { realCities, realNetPpp, PPP_BASELINE } from "@/lib/data";
import { formatEUR, formatEURCompact } from "@/lib/format";

const SLATE_500 = "#64748b";
const AMBER_500 = "#f59e0b";

export function PPPChart() {
  const { salary, profile, hoveredSlug, setHoveredSlug } = useHighlight();

  const chartData = useMemo(() => {
    const arr = realCities().map((c) => {
      const cell = c.salaries[salary][profile];
      return {
        name: c.name,
        country: c.country,
        nominalNet: cell.net,
        realNet: Math.round(realNetPpp(cell, c.col)),
        idx: c.col.numbeoIdxExRent,
      };
    });
    arr.sort((a, b) => b.realNet - a.realNet);
    return arr;
  }, [salary, profile]);

  return (
    <Section
      id="ppp"
      eyebrow="What it actually buys"
      title="Net adjusted to local cost of living."
      lede={`Net take-home re-indexed to a Numbeo ex-rent baseline of ${PPP_BASELINE} (≈ EU average). A high-tax city in a cheap country can outrank a low-tax city in an expensive one.`}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, bottom: 56, left: 12 }}
          >
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={64}
            />
            <YAxis
              tickFormatter={(v) => formatEURCompact(v)}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              width={72}
            />
            <Tooltip content={<PPPTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar
              dataKey="realNet"
              name="Real net (PPP)"
              onMouseEnter={(d) =>
                setHoveredSlug((d as { name?: string }).name ?? null)
              }
              onMouseLeave={() => setHoveredSlug(null)}
            >
              {chartData.map((d) => (
                <Cell
                  key={`real-${d.name}`}
                  fill={d.name === hoveredSlug ? AMBER_500 : SLATE_500}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

type PPPTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      country: string;
      nominalNet: number;
      realNet: number;
      idx: number;
    };
  }>;
};

function PPPTooltip({ active, payload }: PPPTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-900">
        {d.name} · {d.country}
      </p>
      <div className="flex justify-between gap-6 font-semibold text-slate-900">
        <span>Real net</span>
        <span className="tabular-nums">{formatEUR(d.realNet)}</span>
      </div>
      <div className="flex justify-between gap-6 text-slate-600">
        <span>Nominal net</span>
        <span className="tabular-nums">{formatEUR(d.nominalNet)}</span>
      </div>
      <div className="flex justify-between gap-6 text-slate-600">
        <span>Numbeo idx</span>
        <span className="tabular-nums">{d.idx}</span>
      </div>
    </div>
  );
}
