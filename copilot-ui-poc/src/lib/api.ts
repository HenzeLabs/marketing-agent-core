import axios from "axios";

export type RevPt = { date: string; revenue: number };
export type SessPt = { date: string; sessions: number };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

export const getRevenueDaily = async (): Promise<RevPt[]> =>
  (await api.get<RevPt[]>("/api/metrics/revenue-daily")).data ?? [];

export const getSessionsDaily = async (): Promise<SessPt[]> =>
  (await api.get<SessPt[]>("/api/metrics/sessions-daily")).data ?? [];

export const getHealth = async () =>
  (await api.get<{ ok: boolean }>("/api/health")).data;
