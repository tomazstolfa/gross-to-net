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
import { formatEUR, formatEURCompact, formatPercent, isoToFlag } from "@/lib/format";
import { CHART_COLORS, NET_STOPS, TAX_STOPS } from "@/lib/chart-style";

export function StackedBarChart() {
  const { salary, profile, selectedSlug, hoveredSlug, setHoveredSlug } =
    useHighlight();

  const chartData = useMemo(() => {
    const arr = realCities().map((c) => {
      const cell = c.salaries[salary][profile];
      return {
        name: c.name,
        country: c.country,
        iso: c.iso,
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
      title="Where your salary really goes."
      lede="Each bar is what your employer spends. Bottom: what you take home. Top: what the state takes. Sorted by total cost."
    >
      <Controls className="mb-6" />
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, bottom: 56, left: 12 }}
          >
            <defs>
              <linearGradient id="barTaxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={TAX_STOPS.top} />
                <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={TAX_STOPS.bottom} />
              </linearGradient>
              <linearGradient id="barNetStone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.stone} stopOpacity={NET_STOPS.top} />
                <stop offset="100%" stopColor={CHART_COLORS.stone} stopOpacity={NET_STOPS.bottom} />
              </linearGradient>
              <linearGradient id="barNetEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={NET_STOPS.top} />
                <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={NET_STOPS.bottom} />
              </linearGradient>
              <linearGradient id="barNetSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.sky} stopOpacity={NET_STOPS.top} />
                <stop offset="100%" stopColor={CHART_COLORS.sky} stopOpacity={NET_STOPS.bottom} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e7e5e4" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#d6d3d1" }}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={64}
            />
            <YAxis
              tickFormatter={(v) => formatEURCompact(v)}
              tick={{ fontSize: 12, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#d6d3d1" }}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f4" }} />
            <Bar
              dataKey="net"
              stackId="cost"
              name="Net"
              onMouseEnter={(d) =>
                setHoveredSlug((d as { name?: string }).name ?? null)
              }
              onMouseLeave={() => setHoveredSlug(null)}
            >
              {chartData.map((d) => {
                const isPinned = d.name === selectedSlug;
                const isHovered = !isPinned && d.name === hoveredSlug;
                const fill = isPinned
                  ? "url(#barNetEmerald)"
                  : isHovered
                    ? "url(#barNetSky)"
                    : "url(#barNetStone)";
                return <Cell key={`net-${d.name}`} fill={fill} />;
              })}
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
                <Cell key={`tax-${d.name}`} fill="url(#barTaxFill)" />
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
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600">
      <Swatch color={CHART_COLORS.red} label="Tax — to the state" />
      <Swatch color={CHART_COLORS.stone} label="Net — to you" />
      <span className="text-stone-400">·</span>
      <span className="text-emerald-700">Emerald: pinned</span>
      <span className="text-stone-400">·</span>
      <span className="text-sky-700">Sky: hovered</span>
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
      iso: string;
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
    <div className="rounded-md border border-stone-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-stone-900">
        {isoToFlag(d.iso)} {d.name} · {d.country}
      </p>
      <Row label="Cost to employer" value={formatEUR(d.employerCost)} bold />
      <Row label="To the state" value={formatEUR(d.tax)} taxAccent />
      <Row label="To you (net)" value={formatEUR(d.net)} />
      <Row label="Wedge" value={formatPercent(d.wedge)} />
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
