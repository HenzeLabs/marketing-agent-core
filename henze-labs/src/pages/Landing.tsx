import React from "react";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import LiveDemo from "../components/LiveDemo";
import Integrations from "../components/Integrations";
import Testimonials from "../components/Testimonials";
import Security from "../components/Security";
import PricingCTA from "../components/PricingCTA";
import FAQ from "../components/FAQ";

const Landing: React.FC = () => {
  return (
    <div className="bg-marketing-charcoal min-h-screen text-marketing-text-light font-sans overflow-x-hidden">
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <LiveDemo />
        <Integrations />
        <Testimonials />
        <Security />
        <PricingCTA />
        <FAQ />
      </main>
    </div>
  );
};

export default Landing;