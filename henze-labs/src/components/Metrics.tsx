import React from "react";

const Metrics: React.FC = () => (
  <section id="metrics" className="section container text-center py-20">
    <h2 className="text-3xl font-display mb-4">Sample Metrics</h2>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card p-4">
        <div className="text-2xl font-bold">1.2M</div>
        <div className="text-sm text-secondary">Pageviews</div>
      </div>
      <div className="card p-4">
        <div className="text-2xl font-bold">8.5K</div>
        <div className="text-sm text-secondary">Conversions</div>
      </div>
      <div className="card p-4">
        <div className="text-2xl font-bold">$320K</div>
        <div className="text-sm text-secondary">Revenue</div>
      </div>
    </div>
  </section>
);

export default Metrics;
