import React from 'react';

const steps = [
  {
    step: 1,
    title: 'Connect sources',
    description: 'Plug in Google Analytics, Shopify, Microsoft Clarity, and PageSpeed in minutes. No code required.',
  },
  {
    step: 2,
    title: 'We unify & analyze',
    description: 'Our engine processes your raw data in BigQuery, applying proprietary rules and LLMs to find signals in the noise.',
  },
  {
    step: 3,
    title: 'You act',
    description: 'Get daily briefs, critical alerts, and one-click tasks that help you improve performance, fast.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How it works in 3 simple steps
          </h2>
          <p className="text-lg text-marketing-gray-light">
            Connect in minutes • We crunch the numbers • You get answers
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-12 text-center">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-marketing-slate/20 border border-marketing-slate/50 rounded-full text-marketing-cyan font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-marketing-gray-light">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px -translate-x-0">
                      <svg className="w-full h-full text-marketing-slate/50" preserveAspectRatio="none" viewBox="0 0 100 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" strokeDasharray="4 4"/>
                      </svg>
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;