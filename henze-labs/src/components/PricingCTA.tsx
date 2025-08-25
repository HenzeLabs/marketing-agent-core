import React from 'react';
import Button from './Button';

const PricingCTA: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center bg-gradient-to-r from-marketing-slate/80 to-marketing-navy p-12 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            From $0: Start free. Scale when ready.
          </h2>
          <p className="text-lg text-marketing-gray-light max-w-2xl mx-auto mb-8">
            Get started for free with our core features. Upgrade to a paid plan for more data sources, users, and advanced capabilities.
          </p>
          <Button href="#" variant="primary" size="lg">
            See Pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingCTA;