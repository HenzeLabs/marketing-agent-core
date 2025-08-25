import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import LiveDemo from "../components/LiveDemo";
import Integrations from "../components/Integrations";
import Testimonials from "../components/Testimonials";
import Security from "../components/Security";
import PricingCTA from "../components/PricingCTA";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

const Landing: React.FC = () => {
  return (
    <div className="bg-marketing-charcoal min-h-screen text-marketing-text-light font-sans overflow-x-hidden">
      <Header />
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
      <Footer />
    </div>
  );
};

export default Landing;
