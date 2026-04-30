"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Profile, SalaryPoint } from "@/lib/data";

type HighlightContextValue = {
  hoveredSlug: string | null;
  setHoveredSlug: (slug: string | null) => void;
  salary: SalaryPoint;
  setSalary: (s: SalaryPoint) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
};

const HighlightCtx = createContext<HighlightContextValue | null>(null);

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [hoveredSlug, setHoveredSlugState] = useState<string | null>(null);
  const [salary, setSalary] = useState<SalaryPoint>(100000);
  const [profile, setProfile] = useState<Profile>("single");

  const setHoveredSlug = useCallback((slug: string | null) => {
    setHoveredSlugState(slug);
  }, []);

  const value = useMemo(
    () => ({
      hoveredSlug,
      setHoveredSlug,
      salary,
      setSalary,
      profile,
      setProfile,
    }),
    [hoveredSlug, setHoveredSlug, salary, profile],
  );

  return <HighlightCtx.Provider value={value}>{children}</HighlightCtx.Provider>;
}

export function useHighlight(): HighlightContextValue {
  const ctx = useContext(HighlightCtx);
  if (!ctx) {
    throw new Error("useHighlight must be used inside <HighlightProvider>");
  }
  return ctx;
}
