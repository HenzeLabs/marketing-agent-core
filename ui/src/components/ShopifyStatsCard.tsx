import React from "react";

interface ShopifyStatsCardProps {
  label: string;
  value: string | number;
}

export default function ShopifyStatsCard({
  label,
  value,
}: ShopifyStatsCardProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow w-full">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}
