import { DATA_VINTAGE } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[70vh] flex-col justify-center px-5 pb-16 pt-24 sm:min-h-[85vh] sm:px-8 sm:pt-32 lg:min-h-screen">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
          gross-to-net
        </p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] text-stone-900 sm:text-5xl md:text-6xl lg:text-7xl">
          What your employer really pays for you. What you actually keep.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Thirteen European cities. Six salary points from €50k to €250k. Two household
          profiles. EUR throughout, with a separate view normalised for local cost of
          living.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#table"
            className="rounded-md bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Open the table
          </a>
          <a
            href="#methodology"
            className="rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            Methodology
          </a>
        </div>
        <p className="mt-12 text-xs text-stone-500">Data vintage {DATA_VINTAGE}.</p>
      </div>
    </section>
  );
}
