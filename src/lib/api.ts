// Fetch AI summary recommendations (Clarity)
export async function fetchClaritySummaries() {
  const res = await fetch("/api/clarity/summaries");
  if (!res.ok) throw new Error("Failed to fetch Clarity AI summaries");
  return res.json();
}
// API utility functions for dashboard data

export async function fetchClarityMetrics() {
  const res = await fetch("/api/clarity-metrics");
  if (!res.ok) throw new Error("Failed to fetch Clarity metrics");
  return res.json();
}

export async function fetchShopifyMetrics() {
  const res = await fetch("/api/shopify-metrics");
  if (!res.ok) throw new Error("Failed to fetch Shopify metrics");
  return res.json();
}
