import { useEffect, useState } from "react";
import { getSessions, getRevenue, getClarity } from "../lib/api";
import { Section } from "../components/Section";
import { Card } from "../components/Card";
import { KpiCard } from "../components/KpiCard";
import LineTile from "../components/LineTile";
import BarTile from "../components/BarTile";
import TopUrlsTable from "../components/TopUrlsTable";

export default function Metrics() {
  const [sessions, setSessions] = useState<{ date: string; value: number }[]>(
    []
  );
  const [revenue, setRevenue] = useState<{ date: string; value: number }[]>([]);
  const [clarity, setClarity] = useState<
    { date: string; url: string; views: number }[]
  >([]);
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
    <Section
      title="Live Metrics Demo"
      subtitle="All data is real-time from your connected sources."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <KpiCard
          label="Sessions (30d)"
          value={sessionsTotal.toLocaleString()}
        />
        <KpiCard
          label="Revenue (30d)"
          value={revenueTotal.toLocaleString()}
          suffix=" USD"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <LineTile data={sessions} label="Sessions by Day" />
        </Card>
        <Card>
          <BarTile data={revenue} label="Revenue by Day" />
        </Card>
      </div>
      <Card className="mb-8">
        <TopUrlsTable data={clarity} />
      </Card>
    </Section>
  );
}
// (end of file)
