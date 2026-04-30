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
import { Controls } from "./ui/Controls";
import { realCities } from "@/lib/data";
import { formatEUR, formatEURCompact, formatPercent } from "@/lib/format";

const SLATE_400 = "#94a3b8";
const SLATE_700 = "#334155";
const AMBER_500 = "#f59e0b";
const AMBER_300 = "#fcd34d";

export function StackedBarChart() {
  const { salary, profile, effectiveSlug, setHoveredSlug } = useHighlight();

  const chartData = useMemo(() => {
    const arr = realCities().map((c) => {
      const cell = c.salaries[salary][profile];
      return {
        name: c.name,
        country: c.country,
        net: cell.net,
        tax: cell.taxCollected,
        employerCost: cell.employerCost,
        wedge: cell.wedge,
      };
    });
    arr.sort((a, b) => b.employerCost - a.employerCost);
    return arr;
  }, [salary, profile]);

  return (
    <Section
      id="stacked"
      eyebrow="Composition"
      title="Employer cost, split into net and tax."
      lede="Bottom: net take-home. Top: tax collected. Sorted by total employer cost."
    >
      <Controls className="mb-6" />
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar
              dataKey="net"
              stackId="cost"
              name="Net"
              onMouseEnter={(d) =>
                setHoveredSlug((d as { name?: string }).name ?? null)
              }
              onMouseLeave={() => setHoveredSlug(null)}
            >
              {chartData.map((d) => (
                <Cell
                  key={`net-${d.name}`}
                  fill={d.name === effectiveSlug ? AMBER_300 : SLATE_400}
                />
              ))}
            </Bar>
            <Bar
              dataKey="tax"
              stackId="cost"
              name="Tax collected"
              onMouseEnter={(d) =>
                setHoveredSlug((d as { name?: string }).name ?? null)
              }
              onMouseLeave={() => setHoveredSlug(null)}
            >
              {chartData.map((d) => (
                <Cell
                  key={`tax-${d.name}`}
                  fill={d.name === effectiveSlug ? AMBER_500 : SLATE_700}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Legend />
      </div>
    </Section>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
      <Swatch color={SLATE_700} label="Tax collected" />
      <Swatch color={SLATE_400} label="Net take-home" />
      <span className="text-slate-400">·</span>
      <span className="text-amber-700">Amber: pinned city</span>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      country: string;
      net: number;
      tax: number;
      employerCost: number;
      wedge: number;
    };
  }>;
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-900">
        {d.name} · {d.country}
      </p>
      <Row label="Employer cost" value={formatEUR(d.employerCost)} bold />
      <Row label="Tax collected" value={formatEUR(d.tax)} />
      <Row label="Net" value={formatEUR(d.net)} />
      <Row label="Wedge" value={formatPercent(d.wedge)} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-6 ${
        bold ? "font-semibold text-slate-900" : "text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
