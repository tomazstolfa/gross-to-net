import { DATA_VINTAGE } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[70vh] flex-col justify-center px-5 pb-16 pt-24 sm:min-h-[85vh] sm:px-8 sm:pt-32 lg:min-h-screen">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          gross-to-net
        </p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
          How much of your salary survives the trip from your employer&apos;s payroll to
          your bank account?
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          Employer cost, tax wedge, and net take-home across 13 European cities — all in
          EUR, with PPP normalization.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#table"
            className="rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Open the comparison
          </a>
          <a
            href="#methodology"
            className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Methodology
          </a>
        </div>
        <p className="mt-12 text-xs text-slate-500">
          Data vintage: {DATA_VINTAGE} · Single filer and married single-earner (2
          children) profiles.
        </p>
      </div>
    </section>
  );
}
