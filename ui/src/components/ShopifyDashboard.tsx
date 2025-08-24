import React, { useEffect, useState } from "react";
import ShopifyStatsCard from "./ShopifyStatsCard";
import { fetchShopifyMetrics } from "../../../src/lib/api";

export default function ShopifyDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShopifyMetrics()
      .then((data) => {
        // data is an array, take the first row (dashboard metrics view)
        setStats(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading Shopify metrics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return <div>No data.</div>;

  const statCards = [
    {
      label: "Total Revenue",
      value: stats.total_revenue
        ? `$${Number(stats.total_revenue).toLocaleString()}`
        : "-",
    },
    { label: "Number of Orders", value: stats.number_of_orders ?? "-" },
    {
      label: "Average Order Value",
      value: stats.average_order_value
        ? `$${Number(stats.average_order_value).toFixed(2)}`
        : "-",
    },
    {
      label: "Repeat Purchase Rate",
      value:
        stats.repeat_purchase_rate !== undefined
          ? `${(Number(stats.repeat_purchase_rate) * 100).toFixed(1)}%`
          : "-",
    },
    { label: "Unique Customers", value: stats.unique_customers ?? "-" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {statCards.map((stat) => (
        <ShopifyStatsCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
  );
}
