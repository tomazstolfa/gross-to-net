import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { HighlightProvider } from "@/components/ui/HighlightContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "gross-to-net — European salary comparison",
  description:
    "How much of your salary survives the trip from your employer's payroll to your bank account? Employer cost, tax, and net take-home across 13 European cities.",
  openGraph: {
    title: "gross-to-net",
    description:
      "Employer cost vs net take-home across 13 European cities, normalized to EUR and PPP-adjusted.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="bg-stone-50 font-sans text-stone-700 antialiased">
        <HighlightProvider>{children}</HighlightProvider>
      </body>
    </html>
  );
}
