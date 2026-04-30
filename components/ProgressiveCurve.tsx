"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section } from "./ui/Section";
import { useHighlight } from "./ui/HighlightContext";
import { Controls } from "./ui/Controls";
import { realCities, SALARY_POINTS } from "@/lib/data";
import { formatEURCompact, formatPercent } from "@/lib/format";

const SLATE_300 = "#cbd5e1";
const SLATE_500 = "#64748b";
const AMBER_500 = "#f59e0b";

export function ProgressiveCurve() {
  const { salary, profile, effectiveSlug, setHoveredSlug } = useHighlight();

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
      title="How the wedge moves as gross rises."
      lede="Each line is one country, plotted across five gross-salary points. Flat regimes plateau; progressive regimes ramp. The pinned city stands out; the dashed line marks the salary you've selected above."
    >
      <Controls className="mb-6" />
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
              domain={[0.2, 0.7]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              width={48}
            />
            <ReferenceLine
              x={salary}
              stroke={SLATE_500}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: formatEURCompact(salary),
                position: "top",
                fontSize: 11,
                fill: SLATE_500,
              }}
            />
            <Tooltip
              content={<CurveTooltip activeSlug={effectiveSlug} />}
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
            />
            {cityNames.map((name) => {
              const isActive = name === effectiveSlug;
              return (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={isActive ? AMBER_500 : SLATE_300}
                  strokeWidth={isActive ? 3 : 1.2}
                  strokeOpacity={isActive ? 1 : 0.6}
                  dot={isActive ? { r: 4, fill: AMBER_500 } : false}
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
  activeSlug: string;
};

function CurveTooltip({ active, label, payload, activeSlug }: CurveTooltipProps) {
  if (!active || !payload?.length) return null;
  const activeRow = payload.find((p) => p.name === activeSlug);
  const others = [...payload]
    .filter((p) => p.name !== activeSlug)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-2 font-semibold text-slate-900">
        Gross {label ? formatEURCompact(label) : ""}
      </p>
      <div className="space-y-1">
        {activeRow && (
          <div
            className="flex items-center justify-between gap-6 font-semibold"
            style={{ color: activeRow.color }}
          >
            <span>{activeRow.name}</span>
            <span className="tabular-nums">{formatPercent(activeRow.value)}</span>
          </div>
        )}
        {others.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between gap-6 text-slate-500"
          >
            <span>{p.name}</span>
            <span className="tabular-nums">{formatPercent(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
