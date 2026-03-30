import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import WhatItDoes from "@/components/sections/WhatItDoes";
import Roles from "@/components/sections/Roles";
import FAQ from "@/components/sections/FAQ";
import MeltingDivider from "@/components/MeltingDivider";

export default function Home() {
  return (
    <>
      <Hero />
      <MeltingDivider fromClass="from-brand-bg" toClass="to-brand-mid" />
      <HowItWorks />
      <MeltingDivider fromClass="from-brand-mid" toClass="to-brand-bg" />
      <WhatItDoes />
      <MeltingDivider fromClass="from-brand-bg" toClass="to-brand-mid" />
      <Roles />
      <MeltingDivider fromClass="from-brand-mid" toClass="to-brand-bg" />
      <FAQ />
    </>
  );
}