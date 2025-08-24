import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineTileProps {
  data: { date: string; value: number }[];
  label: string;
}

export default function LineTile({ data, label }: LineTileProps) {
  return (
    <div className="rounded-2xl shadow bg-white p-4">
      <div className="mb-2 text-sm text-gray-600">{label}</div>
      <ResponsiveContainer
        width="100%"
        height={180}
        minWidth={200}
        minHeight={120}
      >
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
