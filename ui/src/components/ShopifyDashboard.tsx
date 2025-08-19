import React from "react";
import ShopifyStatsCard from "./ShopifyStatsCard";

export default function ShopifyDashboard() {
  const stats = [
    { label: "Total Revenue", value: "$228,632" },
    { label: "Number of Orders", value: 257 },
    { label: "Average Order Value", value: "$444.81" },
    { label: "Repeat Purchase Rate", value: "100%" },
    { label: "Unique Customers", value: 1 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat) => (
        <ShopifyStatsCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
  );
}
