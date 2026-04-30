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
import { realCities, realNetPpp, PPP_BASELINE } from "@/lib/data";
import { formatEUR, formatEURCompact } from "@/lib/format";

const STONE_500 = "#78716c";
const EMERALD_500 = "#10b981";
const SKY_500 = "#0ea5e9";

export function PPPChart() {
  const { salary, profile, selectedSlug, hoveredSlug, setHoveredSlug } =
    useHighlight();

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
      eyebrow="Purchasing power"
      title="What your net actually buys."
      lede={`Net divided by Numbeo's ex-rent index, baseline ${PPP_BASELINE} ≈ EU average.`}
    >
      <Controls className="mb-6" />
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 12, bottom: 56, left: 12 }}
          >
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
            <Tooltip content={<PPPTooltip />} cursor={{ fill: "#f5f5f4" }} />
            <Bar
              dataKey="realNet"
              name="Real net (PPP)"
              onMouseEnter={(d) =>
                setHoveredSlug((d as { name?: string }).name ?? null)
              }
              onMouseLeave={() => setHoveredSlug(null)}
            >
              {chartData.map((d) => {
                const isPinned = d.name === selectedSlug;
                const isHovered = !isPinned && d.name === hoveredSlug;
                const fill = isPinned ? EMERALD_500 : isHovered ? SKY_500 : STONE_500;
                return <Cell key={`real-${d.name}`} fill={fill} />;
              })}
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
    <div className="rounded-md border border-stone-200 bg-white p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-stone-900">
        {d.name} · {d.country}
      </p>
      <div className="flex justify-between gap-6 font-semibold text-stone-900">
        <span>What it buys you</span>
        <span className="tabular-nums">{formatEUR(d.realNet)}</span>
      </div>
      <div className="flex justify-between gap-6 text-stone-600">
        <span>Nominal net</span>
        <span className="tabular-nums">{formatEUR(d.nominalNet)}</span>
      </div>
      <div className="flex justify-between gap-6 text-stone-600">
        <span>Numbeo idx</span>
        <span className="tabular-nums">{d.idx}</span>
      </div>
    </div>
  );
}
