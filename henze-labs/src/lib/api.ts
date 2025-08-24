const API_BASE = import.meta.env.VITE_API_BASE;
async function j(u: string) {
  const r = await fetch(u);
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
}
export const getSessions = () => j(`${API_BASE}/api/metrics/sessions-daily`);
export const getRevenue = () => j(`${API_BASE}/api/metrics/revenue-daily`);
export const getClarity = () => j(`${API_BASE}/api/clarity/top-urls`);
