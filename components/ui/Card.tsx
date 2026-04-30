import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
