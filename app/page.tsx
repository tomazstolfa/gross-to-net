import { Hero } from "@/components/Hero";
import { FourNumbers } from "@/components/FourNumbers";
import { ComparisonTable } from "@/components/ComparisonTable";
import { StackedBarChart } from "@/components/StackedBarChart";
import { CityProfile } from "@/components/CityProfile";
import { PPPChart } from "@/components/PPPChart";
import { ProgressiveCurve } from "@/components/ProgressiveCurve";
import { Methodology } from "@/components/Methodology";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <Hero />
      <FourNumbers />
      <ComparisonTable />
      <StackedBarChart />
      <CityProfile />
      <PPPChart />
      <ProgressiveCurve />
      <Methodology />
      <Footer />
    </main>
  );
}
