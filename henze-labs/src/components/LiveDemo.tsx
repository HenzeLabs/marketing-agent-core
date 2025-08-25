import React from "react";
import Button from "./Button";
import { ArrowRightIcon } from "./Icons";

const LiveDemo: React.FC = () => {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            See it in action
          </h2>
          <p className="text-lg text-marketing-gray-light mb-10">
            This isn't another dashboard. It's your daily command center for
            growth. Explore our live demo with sample data.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-to-br from-marketing-navy/50 via-marketing-cyan/10 to-marketing-slate/30 rounded-3xl filter blur-2xl opacity-50"></div>
          <div className="relative grid md:grid-cols-3 gap-4 border border-marketing-slate-50 bg-marketing-charcoal-50 rounded-2xl p-6 backdrop-blur-lg shadow-2xl">
            <div className="bg-marketing-slate-20 p-4 rounded-lg">
              <p className="text-sm text-marketing-gray-light">Sessions</p>
              <p className="text-2xl font-bold">
                2,489{" "}
                <span className="text-sm text-green-400 font-medium">+12%</span>
              </p>
            </div>
            <div className="bg-marketing-slate-20 p-4 rounded-lg">
              <p className="text-sm text-marketing-gray-light">Revenue</p>
              <p className="text-2xl font-bold">
                $12,345{" "}
                <span className="text-sm text-green-400 font-medium">+8%</span>
              </p>
            </div>
            <div className="bg-marketing-slate-20 p-4 rounded-lg md:col-span-1">
              <p className="text-sm text-marketing-gray-light">Top URL</p>
              <p className="text-lg font-bold truncate">/product/new-release</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button href="#" variant="primary" size="lg">
            <span>Open Full Demo</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
