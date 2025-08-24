import React from "react";

interface ChartLineProps {
  data: { x: string; y: number }[];
  title?: string;
}

// Simple SVG line chart for demo purposes
export default function ChartLine({ data, title }: ChartLineProps) {
  if (!data.length) return <div>No data</div>;
  // SVG dimensions
  const width = 400;
  const height = 120;
  const padding = 32;

  // X/Y scaling
  const xVals = data.map((d) => d.x);
  const yVals = data.map((d) => d.y);
  const yMax = Math.max(...yVals);
  const yMin = Math.min(...yVals);
  const yRange = yMax - yMin || 1;

  // Map data to SVG coords
  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y =
      height - padding - ((d.y - yMin) / yRange) * (height - 2 * padding);
    return `${x},${y}`;
  });

  return (
    <div>
      {title && <div className="mb-2 font-semibold text-zinc-200">{title}</div>}
      <svg width={width} height={height}>
        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#888"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#888"
        />
        {/* Line */}
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth={3}
          points={points.join(" ")}
        />
        {/* Dots */}
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          const y =
            height - padding - ((d.y - yMin) / yRange) * (height - 2 * padding);
          return <circle key={i} cx={x} cy={y} r={3} fill="#38bdf8" />;
        })}
      </svg>
    </div>
  );
}
