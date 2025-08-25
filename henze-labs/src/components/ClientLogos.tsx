
import React from 'react';

const clients = [
  { name: 'QuantumLeap', id: 1 },
  { name: 'SynthWave', id: 2 },
  { name: 'ApexLogic', id: 3 },
  { name: 'StellarForge', id: 4 },
  { name: 'NovaCore', id: 5 },
];

const ClientLogos: React.FC = () => {
  return (
    <div className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">
          Trusted by innovative SaaS leaders
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {clients.map((client) => (
            <div key={client.id} className="text-gray-400 filter grayscale hover:grayscale-0 transition-all duration-300 text-xl font-bold">
              {client.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientLogos;
