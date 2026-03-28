import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import WhatItDoes from "@/components/sections/WhatItDoes";
import Roles from "@/components/sections/Roles";




export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhatItDoes />
      <Roles/>
    </main>
  );
}