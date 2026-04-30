"use client";

import { useHighlight } from "./HighlightContext";
import { SALARY_POINTS, PROFILES, type SalaryPoint, type Profile } from "@/lib/data";
import { formatEURCompact } from "@/lib/format";

export function Controls({ className = "" }: { className?: string }) {
  const { salary, setSalary, profile, setProfile } = useHighlight();

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${className}`}
    >
      <SegmentedSalary value={salary} onChange={setSalary} />
      <SegmentedProfile value={profile} onChange={setProfile} />
    </div>
  );
}

function SegmentedSalary({
  value,
  onChange,
}: {
  value: SalaryPoint;
  onChange: (s: SalaryPoint) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Salary
      </span>
      <div
        className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1"
        role="radiogroup"
        aria-label="Salary point"
      >
        {SALARY_POINTS.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={s === value}
            onClick={() => onChange(s)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              s === value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {formatEURCompact(s)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SegmentedProfile({
  value,
  onChange,
}: {
  value: Profile;
  onChange: (p: Profile) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Profile
      </span>
      <div
        className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
        role="radiogroup"
        aria-label="Family profile"
      >
        {PROFILES.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={p === value}
            onClick={() => onChange(p)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
              p === value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {p === "single" ? "Single" : "Family"}
          </button>
        ))}
      </div>
    </div>
  );
}
