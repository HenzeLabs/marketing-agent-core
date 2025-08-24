import React from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div className="rounded-2xl shadow bg-white p-6 flex flex-col items-center min-w-[160px]">
      <div className="text-2xl font-bold text-blue-700">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
