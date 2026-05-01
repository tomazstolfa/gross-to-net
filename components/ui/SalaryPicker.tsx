"use client";

import { SALARY_POINTS, type SalaryPoint } from "@/lib/data";
import { formatEURCompact } from "@/lib/format";
import { useHighlight } from "./HighlightContext";

type Props = {
  /** "inline" renders a text-style dropdown that flows in a sentence. "block" is a standalone control. */
  variant?: "inline" | "block";
};

export function SalaryPicker({ variant = "inline" }: Props) {
  const { salary, setSalary } = useHighlight();

  const inlineClass =
    "appearance-none cursor-pointer rounded-md border border-dashed border-stone-400 bg-transparent py-0.5 pl-2 pr-7 font-semibold tabular-nums text-stone-900 transition hover:border-emerald-500 hover:bg-emerald-50/50 focus:border-emerald-500 focus:bg-emerald-50 focus:outline-none";
  const blockClass =
    "appearance-none cursor-pointer rounded-md border border-stone-200 bg-white px-3 py-2 pr-8 text-sm font-medium tabular-nums text-stone-900 shadow-sm focus:border-stone-400 focus:outline-none";

  return (
    <span className="relative inline-block">
      <select
        aria-label="Gross salary"
        value={salary}
        onChange={(e) => setSalary(Number(e.target.value) as SalaryPoint)}
        className={variant === "inline" ? inlineClass : blockClass}
      >
        {SALARY_POINTS.map((s) => (
          <option key={s} value={s}>
            {formatEURCompact(s)} gross
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-500"
      >
        ▾
      </span>
    </span>
  );
}
