import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import BenefitsByRole from "@/components/sections/BenefitsByRole";
import CoreFeatures from "@/components/sections/CoreFeatures";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <BenefitsByRole />
      <CoreFeatures />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
