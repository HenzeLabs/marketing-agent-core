
import Hero from '../components/Hero';
import Features from '../components/Features';
import Integrations from '../components/Integrations';
import Testimonials from '../components/Testimonials';
import PricingCTA from '../components/PricingCTA';
import FAQ from '../components/FAQ';
import ClientLogos from '../components/ClientLogos';
import Security from '../components/Security';
import LiveDemo from '../components/LiveDemo';

const Landing: React.FC = () => {
  return (
    <>
      <Hero />
      <ClientLogos />
      <Integrations />
      <Features />
      <LiveDemo />
      <Testimonials />
      <PricingCTA />
      <Security />
      <FAQ />
    </>
  );
};

export default Landing;
