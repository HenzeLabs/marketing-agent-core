import React, { useEffect, useState } from "react";
import { fetchShopifyMetrics } from "../../../src/lib/api";

export default function ShopifyRevenueCard() {
  const [revenue, setRevenue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShopifyMetrics()
      .then((data) => {
        const total = data[0]?.total_revenue;
        setRevenue(
          total !== undefined && total !== null
            ? `$${Number(total).toLocaleString()}`
            : "-"
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        console.error("Shopify Revenue fetch error:", err);
      });
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow w-full flex flex-col items-center justify-center min-h-[120px]">
      <div className="text-sm text-gray-400 mb-1">Total Shopify Revenue</div>
      {loading ? (
        <div className="w-32 h-8 bg-gray-700 rounded animate-pulse mt-2" />
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="text-3xl font-bold text-white">{revenue}</div>
      )}
    </div>
  );
}
