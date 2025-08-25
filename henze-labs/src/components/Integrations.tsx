import React from "react";
import { AnalyticsIcon, ShopifyIcon, ClarityIcon, SpeedIcon } from "./Icons";

const integrations = [
  { name: "Google Analytics", icon: AnalyticsIcon },
  { name: "Shopify", icon: ShopifyIcon },
  { name: "Microsoft Clarity", icon: ClarityIcon },
  { name: "PageSpeed", icon: SpeedIcon },
];

const Integrations: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-marketing-slate-5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Connect your entire stack
          </h2>
          <p className="text-lg text-marketing-gray-light">
            Marketing Copilot works with the tools you already use.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex flex-col items-center justify-center gap-4 bg-marketing-slate-10 border border-marketing-slate-30 p-8 rounded-2xl text-center"
            >
              <integration.icon className="w-10 h-10 text-marketing-gray-light" />
              <span className="font-semibold">{integration.name}</span>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-marketing-gray-light">
          More coming soon, including Ads & Sheets.
        </p>
      </div>
    </section>
  );
};

export default Integrations;
