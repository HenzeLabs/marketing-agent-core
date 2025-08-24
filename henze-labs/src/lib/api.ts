const API_BASE = "/api";

const j = async (path: string) => {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
};

export const getSessions = () => j(`/metrics/sessions-daily`);
export const getRevenue = () => j(`/metrics/revenue-daily`);
export const getClarity = () => j(`/clarity/top-urls`);
