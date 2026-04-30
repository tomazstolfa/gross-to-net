"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { Controls } from "./ui/Controls";
import { findCity, SALARY_POINTS, type CityData } from "@/lib/data";
import { formatEUR, formatEURCompact, formatPercent } from "@/lib/format";

const SLATE_700 = "#334155";
const AMBER_400 = "#fbbf24";

export function ProgressiveCurve() {
  const { profile, effectiveSlug } = useHighlight();
  const city: CityData = findCity(effectiveSlug) ?? findCity("Ljubljana")!;

  const chartData = useMemo(
    () =>
      SALARY_POINTS.map((point) => {
        const cell = city.salaries[point][profile];
        return {
          salary: point,
          net: cell.net,
          tax: cell.taxCollected,
          employerCost: cell.employerCost,
          wedge: cell.wedge,
        };
      }),
    [city, profile],
  );

  return (
    <Section
      id="progressive"
      eyebrow="Progressivity"
      title="How the breakdown shifts as gross rises."
      lede={`Net take-home and tax collected, stacked to total employer cost across the five salary points. Showing ${city.name}, ${city.country}.`}
    >
      <Controls className="mb-6" showSalary={false} />
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ResponsiveContainer width="100%" height={460}>
          <AreaChart
            data={chartData}
            margin={{ top: 16, right: 24, bottom: 24, left: 12 }}
          >
            <defs>
              <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={AMBER_400} stopOpacity={0.95} />
                <stop offset="100%" stopColor={AMBER_400} stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="taxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SLATE_700} stopOpacity={0.9} />
                <stop offset="100%" stopColor={SLATE_700} stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="salary"
              type="number"
              domain={[70000, 250000]}
              ticks={[...SALARY_POINTS]}
              tickFormatter={(v) => formatEURCompact(v)}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              tickFormatter={(v) => formatEURCompact(v)}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              width={64}
            />
            <Tooltip
              content={<AreaTooltip />}
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="net"
              stackId="1"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="url(#netFill)"
              name="Net take-home"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="tax"
              stackId="1"
              stroke="#1e293b"
              strokeWidth={1.5}
              fill="url(#taxFill)"
              name="Tax collected"
              isAnimationActive={false}
            />
          </AreaChart>
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
      <Swatch color={AMBER_400} label="Net take-home" />
      <span className="text-slate-400">·</span>
      <span>Total height = employer cost.</span>
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
  label?: number;
  payload?: Array<{
    payload: {
      salary: number;
      net: number;
      tax: number;
      employerCost: number;
      wedge: number;
    };
  }>;
};

function AreaTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-900">
        Gross {label ? formatEURCompact(label) : ""}
      </p>
      <Row label="Employer cost" value={formatEUR(d.employerCost)} bold />
      <Row label="Tax collected" value={formatEUR(d.tax)} />
      <Row label="Net take-home" value={formatEUR(d.net)} />
      <Row label="Wedge" value={formatPercent(d.wedge)} />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
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
