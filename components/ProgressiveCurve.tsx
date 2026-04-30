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
import { CHART_COLORS, NET_STOPS, TAX_STOPS } from "@/lib/chart-style";

export function ProgressiveCurve() {
  const { profile, selectedSlug } = useHighlight();
  const city: CityData = findCity(selectedSlug) ?? findCity("Ljubljana")!;

  const chartData = useMemo(
    () =>
      SALARY_POINTS.map((point) => {
        const cell = city.salaries[point][profile];
        return {
          salary: point,
          netShare: cell.net / cell.employerCost,
          taxShare: cell.taxCollected / cell.employerCost,
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
      title="The higher you climb, the smaller your slice."
      lede={`Each column is 100% of what your employer pays for you. Bottom: what you take home. Top: what goes to the state. Showing ${city.name}, ${city.country}.`}
    >
      <Controls className="mb-6" showSalary={false} />
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <ResponsiveContainer width="100%" height={460}>
          <AreaChart
            data={chartData}
            margin={{ top: 16, right: 24, bottom: 24, left: 12 }}
            stackOffset="expand"
          >
            <defs>
              <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={NET_STOPS.top} />
                <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={NET_STOPS.bottom} />
              </linearGradient>
              <linearGradient id="taxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={TAX_STOPS.top} />
                <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={TAX_STOPS.bottom} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e7e5e4" vertical={false} />
            <XAxis
              dataKey="salary"
              type="number"
              domain={[50000, 250000]}
              ticks={[...SALARY_POINTS]}
              interval={0}
              tickFormatter={(v) => formatEURCompact(v)}
              tick={{ fontSize: 12, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#d6d3d1" }}
            />
            <YAxis
              tickFormatter={(v) => formatPercent(v)}
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fontSize: 12, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#d6d3d1" }}
              width={48}
            />
            <Tooltip
              content={<AreaTooltip />}
              cursor={{ stroke: "#d6d3d1", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="netShare"
              stackId="1"
              stroke="none"
              fill="url(#netFill)"
              fillOpacity={1}
              name="Net share"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="taxShare"
              stackId="1"
              stroke="none"
              fill="url(#taxFill)"
              fillOpacity={1}
              name="Tax share"
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
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600">
      <Swatch color={CHART_COLORS.red} label="Tax — to the state" />
      <Swatch color={CHART_COLORS.emerald} label="Net — to you" />
      <span className="text-stone-400">·</span>
      <span>Each column = 100% of what your employer pays.</span>
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
      netShare: number;
      taxShare: number;
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
    <div className="rounded-md border border-stone-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-stone-900">
        Gross {label ? formatEURCompact(label) : ""}
      </p>
      <Row
        label="To you (net)"
        value={`${formatPercent(d.netShare)} · ${formatEUR(d.net)}`}
        bold
      />
      <Row
        label="To the state"
        value={`${formatPercent(d.taxShare)} · ${formatEUR(d.tax)}`}
        taxAccent
      />
      <Row label="Cost to employer" value={formatEUR(d.employerCost)} />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  taxAccent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  taxAccent?: boolean;
}) {
  const cls = taxAccent
    ? "text-red-700"
    : bold
      ? "font-semibold text-stone-900"
      : "text-stone-600";
  return (
    <div className={`flex justify-between gap-6 ${cls}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
