import React, { useEffect, useState } from "react";
import { fetchClarityMetrics } from "../../../src/lib/api";
import ChartLine from "./ChartLine";

function getDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function ClarityPageviewsChart() {
  const [data, setData] = useState<{ x: string; y: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return getDateString(d);
  });
  const [endDate, setEndDate] = useState<string>(() =>
    getDateString(new Date())
  );

  useEffect(() => {
    setLoading(true);
    fetchClarityMetrics()
      .then((rows) => {
        const grouped: Record<string, number> = {};
        rows.forEach((row: any) => {
          if (!row.snapshot_date || row.pagesViews == null) return;
          if (row.snapshot_date < startDate || row.snapshot_date > endDate)
            return;
          grouped[row.snapshot_date] =
            (grouped[row.snapshot_date] || 0) + Number(row.pagesViews);
        });
        const arr = Object.entries(grouped)
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x.localeCompare(b.x));
        setData(arr);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        console.error("Clarity Pageviews fetch error:", err);
      });
  }, [startDate, endDate]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow w-full flex flex-col items-center min-h-[180px]">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">
            Clarity Pageviews Over Time
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-400">From</label>
            <input
              type="date"
              className="rounded bg-gray-700 text-gray-100 px-2 py-1 text-xs border border-gray-600 focus:outline-none"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="text-xs text-gray-400">To</label>
            <input
              type="date"
              className="rounded bg-gray-700 text-gray-100 px-2 py-1 text-xs border border-gray-600 focus:outline-none"
              value={endDate}
              min={startDate}
              max={getDateString(new Date())}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="w-full h-24 bg-gray-700 rounded animate-pulse mt-2" />
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <ChartLine data={data} />
      )}
    </div>
  );
}
