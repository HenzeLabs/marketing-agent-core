// src/pages/Metrics.tsx
import React, { useEffect, useState } from "react";
import { getSessions, getRevenue, getClarity } from "../lib/api";
import KpiCard from "../components/KpiCard";
import LineTile from "../components/LineTile";
import BarTile from "../components/BarTile";
import TopUrlsTable from "../components/TopUrlsTable";

type Norm = { date: string; value: number };
type TopUrl = { date: string; url: string; views: number };

export default function Metrics() {
  const [sessions, setSessions] = useState<Norm[]>([]);
  const [revenue, setRevenue] = useState<Norm[]>([]);
  const [clarity, setClarity] = useState<TopUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSessions().catch(() => []),
      getRevenue().catch(() => []),
      getClarity().catch(() => []),
    ])
      .then(([sessionsRaw, revenueRaw, clarityRaw]) => {
        // Normalize sessions/revenue to {date, value}
        const sessionsNorm = Array.isArray(sessionsRaw)
          ? sessionsRaw.map((d: any) => ({
              date: d.date || d.dt,
              value: d.sessions || d.value || 0,
            }))
          : [];
        const revenueNorm = Array.isArray(revenueRaw)
          ? revenueRaw.map((d: any) => ({
              date: d.date || d.dt,
              value: d.revenue || d.value || 0,
            }))
          : [];
        const clarityNorm = Array.isArray(clarityRaw)
          ? clarityRaw.map((d: any) => ({
              date: d.date,
              url: d.url,
              views: d.views,
            }))
          : [];
        setSessions(sessionsNorm);
        setRevenue(revenueNorm);
        setClarity(clarityNorm);
        // Print first 5 data points for proof
        console.log("Sessions (first 5):", sessionsNorm.slice(0, 5));
        console.log("Revenue (first 5):", revenueNorm.slice(0, 5));
        console.log("Clarity (first 5):", clarityNorm.slice(0, 5));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading live metrics…</div>;
  if (error)
    return (
      <div className="p-8 text-red-600">Error loading metrics: {error}</div>
    );

  const sessionsTotal = sessions.reduce((a, b) => a + b.value, 0);
  const revenueTotal = revenue.reduce((a, b) => a + b.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">
        Live Metrics Demo
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-3xl">
        <KpiCard
          label="Sessions (30d)"
          value={sessionsTotal.toLocaleString()}
        />
        <KpiCard
          label="Revenue (30d)"
          value={revenueTotal.toLocaleString()}
          sub="USD"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-4xl">
        <LineTile data={sessions} label="Sessions by Day" />
        <BarTile data={revenue} label="Revenue by Day" />
      </div>
      <div className="w-full max-w-4xl mb-8">
        <TopUrlsTable data={clarity} />
      </div>
    </div>
  );
}
