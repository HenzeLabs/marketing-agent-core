import React, { useEffect, useState } from "react";
import { fetchClaritySummaries } from "../../../src/lib/api";

export default function AISummaryRecommendations() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlFilter, setUrlFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetchClaritySummaries()
      .then((data) => {
        setSummaries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        console.error("AI Summary fetch error:", err);
      });
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow w-full flex flex-col min-h-[120px]">
      <div className="flex flex-col w-full mb-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            AI Summary Recommendations
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="rounded bg-gray-700 text-gray-100 px-2 py-1 text-xs border border-gray-600 focus:outline-none"
              placeholder="Filter by URL..."
              value={urlFilter}
              onChange={(e) => setUrlFilter(e.target.value)}
            />
            <select
              className="rounded bg-gray-700 text-gray-100 px-2 py-1 text-xs border border-gray-600 focus:outline-none"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      {loading ? (
        <div>
          <div className="w-40 h-4 bg-gray-700 rounded animate-pulse mb-2" />
          <div className="w-full h-4 bg-gray-700 rounded animate-pulse mb-2" />
          <div className="w-32 h-3 bg-gray-700 rounded animate-pulse mb-2" />
        </div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : summaries.length === 0 ? (
        <div className="text-zinc-400">No recommendations available.</div>
      ) : (
        <ul className="divide-y divide-gray-700">
          {summaries
            .filter(
              (s) =>
                (!urlFilter ||
                  s.url?.toLowerCase().includes(urlFilter.toLowerCase())) &&
                (!priorityFilter ||
                  (priorityFilter === "high" && s.ai_priority === 1) ||
                  (priorityFilter === "medium" && s.ai_priority === 2) ||
                  (priorityFilter === "low" && s.ai_priority === 3))
            )
            .map((s, i) => {
              let badgeColor = "bg-green-600 text-white";
              let badgeText = "Low";
              if (s.ai_priority === 1) {
                badgeColor = "bg-red-600 text-white";
                badgeText = "High";
              } else if (s.ai_priority === 2) {
                badgeColor = "bg-yellow-400 text-gray-900";
                badgeText = "Medium";
              }
              return (
                <li key={i} className="py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-300">{s.url}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${badgeColor}`}
                    >
                      {badgeText} Priority
                    </span>
                  </div>
                  <div className="text-zinc-200 text-sm">{s.ai_summary}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {s.snapshot_date}
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
