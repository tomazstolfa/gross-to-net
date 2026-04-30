"use client";

import { useHighlight } from "./HighlightContext";
import {
  SALARY_POINTS,
  PROFILES,
  cities,
  type SalaryPoint,
  type Profile,
} from "@/lib/data";
import { formatEURCompact } from "@/lib/format";

type ControlsProps = {
  className?: string;
  /** Hide the gross-salary segmented control. Useful when the chart has salary on an axis. */
  showSalary?: boolean;
};

export function Controls({ className = "", showSalary = true }: ControlsProps) {
  const {
    salary,
    setSalary,
    profile,
    setProfile,
    selectedSlug,
    setSelectedSlug,
  } = useHighlight();

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:flex-wrap lg:items-end lg:gap-6 ${className}`}
    >
      {showSalary && <SegmentedSalary value={salary} onChange={setSalary} />}
      <SegmentedProfile value={profile} onChange={setProfile} />
      <CitySelect value={selectedSlug} onChange={setSelectedSlug} />
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
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Gross salary
      </span>
      <div
        className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-100 p-1"
        role="radiogroup"
        aria-label="Salary point"
      >
        {SALARY_POINTS.map((s) => {
          const active = s === value;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold tabular-nums transition ${
                active
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              {formatEURCompact(s)}
            </button>
          );
        })}
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
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Profile
      </span>
      <div
        className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"
        role="radiogroup"
        aria-label="Family profile"
      >
        {PROFILES.map((p) => {
          const active = p === value;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition ${
                active
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              {p === "single" ? "Single" : "Family"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CitySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 lg:min-w-[16rem] lg:flex-1">
      <label
        htmlFor="city-select"
        className="text-[11px] font-semibold uppercase tracking-widest text-slate-500"
      >
        Pinned city
      </label>
      <div className="relative">
        <select
          id="city-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none cursor-pointer rounded-lg border border-amber-300 bg-amber-50/40 px-3 py-2 pr-9 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-50 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          {cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}, {c.country}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-600"
        >
          ▾
        </span>
      </div>
    </div>
  );
}
