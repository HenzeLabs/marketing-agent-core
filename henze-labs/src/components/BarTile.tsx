import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarTileProps {
  data: { date: string; value: number }[];
  label: string;
}

export default function BarTile({ data, label }: BarTileProps) {
  return (
    <div className="rounded-2xl shadow bg-white p-4">
      <div className="mb-2 text-sm text-gray-600">{label}</div>
      <ResponsiveContainer
        width="100%"
        height={180}
        minWidth={200}
        minHeight={120}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
