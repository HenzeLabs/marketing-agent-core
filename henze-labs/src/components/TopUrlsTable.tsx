import React from "react";

interface TopUrl {
  date: string;
  url: string;
  views: number;
}

interface TopUrlsTableProps {
  data: TopUrl[];
}

export default function TopUrlsTable({ data }: TopUrlsTableProps) {
  if (!data.length)
    return <div className="p-4 text-gray-400">No top URLs found.</div>;
  return (
    <div className="overflow-x-auto rounded-2xl shadow bg-white p-4">
      <table className="min-w-[320px] w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2 px-2">Date</th>
            <th className="py-2 px-2">URL</th>
            <th className="py-2 px-2">Views</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t last:border-b">
              <td className="py-2 px-2 whitespace-nowrap">{row.date}</td>
              <td className="py-2 px-2 text-blue-700 truncate max-w-[200px]">
                {row.url}
              </td>
              <td className="py-2 px-2">{row.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
