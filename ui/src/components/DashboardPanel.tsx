import React from "react";
import ShopifyDashboard from "./ShopifyDashboard";

const metrics = [
  { label: "Visits", value: "12,340", color: "bg-blue-600" },
  { label: "CPC", value: "$1.23", color: "bg-pink-500" },
  { label: "Engagement Rate", value: "5.2%", color: "bg-green-500" },
  { label: "Impressions", value: "98,765", color: "bg-yellow-500" },
];

const DashboardPanel = () => {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
        Marketing Dashboard
      </h2>
      {/* Shopify Dashboard */}
      <ShopifyDashboard />
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-lg p-4 flex flex-col items-center ${m.color} bg-opacity-80 shadow hover:scale-105 hover:shadow-lg transition-transform duration-200 cursor-pointer`}
          >
            <div className="text-2xl md:text-3xl font-bold">{m.value}</div>
            <div className="text-sm opacity-80 mt-1">{m.label}</div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-zinc-800 p-6 min-h-[180px] flex items-center justify-center shadow hover:shadow-xl transition-shadow duration-200">
          <span className="text-zinc-400">[Bar Chart Placeholder]</span>
        </div>
        <div className="rounded-lg bg-zinc-800 p-6 min-h-[180px] flex items-center justify-center shadow hover:shadow-xl transition-shadow duration-200">
          <span className="text-zinc-400">[Donut Chart Placeholder]</span>
        </div>
      </div>
      {/* Panels */}
      <div className="rounded-lg bg-zinc-800 p-6 mt-2 shadow hover:shadow-xl transition-shadow duration-200">
        <h3 className="text-lg font-semibold mb-2">Campaign Overview</h3>
        <p className="text-zinc-300">
          Your latest marketing campaign is performing above average. Keep up
          the good work!
        </p>
        {/* Placeholder for future interactivity */}
        <div className="mt-3 text-xs text-zinc-500 italic">
          [Future: campaign details, actions]
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
