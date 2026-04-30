"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { realCities, SALARY_POINTS } from "@/lib/data";
import { formatEURCompact, formatPercent } from "@/lib/format";

const SLATE_300 = "#cbd5e1";
const SLATE_500 = "#64748b";
const AMBER_500 = "#f59e0b";

export function ProgressiveCurve() {
  const { profile, hoveredSlug, setHoveredSlug } = useHighlight();

  const chartData = useMemo(() => {
    return SALARY_POINTS.map((point) => {
      const row: Record<string, number> = { salary: point };
      for (const c of realCities()) {
        row[c.name] = c.salaries[point][profile].wedge;
      }
      return row;
    });
  }, [profile]);

  const cityNames = useMemo(() => realCities().map((c) => c.name), []);

  return (
    <Section
      id="progressive"
      eyebrow="Progressivity"
      title="Where each country's curve bends."
      lede="Effective wedge as gross income climbs from €70k to €250k. Flat-tax regimes (Estonia) plateau; progressive regimes (Italy, Slovenia, Ireland) ramp hard. Hover a row in the table above to highlight a single line here."
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ResponsiveContainer width="100%" height={460}>
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 24, bottom: 24, left: 12 }}
          >
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
              tickFormatter={(v) => formatPercent(v)}
              domain={[0.3, 0.7]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              width={48}
            />
            <Tooltip
              content={<CurveTooltip hoveredSlug={hoveredSlug} />}
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
            />
            {cityNames.map((name) => {
              const isHovered = name === hoveredSlug;
              return (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={isHovered ? AMBER_500 : hoveredSlug ? SLATE_300 : SLATE_500}
                  strokeWidth={isHovered ? 3 : hoveredSlug ? 1 : 1.4}
                  strokeOpacity={hoveredSlug && !isHovered ? 0.5 : 1}
                  dot={isHovered ? { r: 4, fill: AMBER_500 } : false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  onMouseEnter={() => setHoveredSlug(name)}
                  onMouseLeave={() => setHoveredSlug(null)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

type CurveTooltipProps = {
  active?: boolean;
  label?: number;
  payload?: Array<{ name: string; value: number; color: string }>;
  hoveredSlug: string | null;
};

function CurveTooltip({ active, label, payload, hoveredSlug }: CurveTooltipProps) {
  if (!active || !payload?.length) return null;
  const filtered = hoveredSlug
    ? payload.filter((p) => p.name === hoveredSlug)
    : [...payload].sort((a, b) => b.value - a.value).slice(0, 6);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-2 font-semibold text-slate-900">
        Gross {label ? formatEURCompact(label) : ""}
      </p>
      <div className="space-y-1">
        {filtered.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between gap-6"
            style={{ color: p.color }}
          >
            <span className="font-medium">{p.name}</span>
            <span className="tabular-nums">{formatPercent(p.value)}</span>
          </div>
        ))}
      </div>
      {!hoveredSlug && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">
          Hover a city to isolate
        </p>
      )}
    </div>
  );
}
