import type { ReactNode } from "react";

type Props = {
  id?: string;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
};

export function Section({ id, children, className = "", eyebrow, title, lede }: Props) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24 ${className}`}
    >
      {(eyebrow || title || lede) && (
        <header className="mb-10 max-w-3xl">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="font-serif text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {title}
            </h2>
          )}
          {lede && <p className="mt-3 text-base text-slate-600 sm:text-lg">{lede}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
