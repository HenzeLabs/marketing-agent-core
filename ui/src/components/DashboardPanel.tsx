import React, { useEffect, useState } from "react";
import ShopifyDashboard from "./ShopifyDashboard";
import ChartLine from "./ChartLine";
import { fetchClarityMetrics } from "../../../src/lib/api";

const DashboardPanel = () => {
  const [clarityData, setClarityData] = useState<{ x: string; y: number }[]>(
    []
  );
  const [clarityLoading, setClarityLoading] = useState(true);
  const [clarityError, setClarityError] = useState<string | null>(null);

  useEffect(() => {
    fetchClarityMetrics()
      .then((data) => {
        // Group by snapshot_date, sum pageviews
        const grouped: Record<string, number> = {};
        data.forEach((row: any) => {
          if (!row.snapshot_date || row.pagesViews == null) return;
          grouped[row.snapshot_date] =
            (grouped[row.snapshot_date] || 0) + Number(row.pagesViews);
        });
        // Convert to sorted array
        const arr = Object.entries(grouped)
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x.localeCompare(b.x));
        setClarityData(arr);
        setClarityLoading(false);
      })
      .catch((err) => {
        setClarityError(err.message);
        setClarityLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
        Marketing Dashboard
      </h2>
      {/* Shopify Dashboard */}
      <ShopifyDashboard />
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-zinc-800 p-6 min-h-[180px] flex items-center justify-center shadow hover:shadow-xl transition-shadow duration-200">
          {clarityLoading ? (
            <span className="text-zinc-400">Loading Clarity pageviews...</span>
          ) : clarityError ? (
            <span className="text-red-500">Error: {clarityError}</span>
          ) : (
            <ChartLine data={clarityData} title="Clarity Pageviews by Day" />
          )}
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
