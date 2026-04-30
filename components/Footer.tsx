import { DATA_VINTAGE } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="text-sm text-stone-600">
          <p className="font-semibold text-stone-900">gross-to-net</p>
          <p className="mt-1">Open-source · MIT · Data vintage {DATA_VINTAGE}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a
            href="https://github.com/tomazstolfa/gross-to-net"
            target="_blank"
            rel="noreferrer noopener"
            className="text-stone-700 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            GitHub
          </a>
          <a
            href="#table"
            className="text-stone-700 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            Comparison
          </a>
          <a
            href="#methodology"
            className="text-stone-700 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            Methodology
          </a>
          <a
            href="#"
            className="text-stone-700 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
