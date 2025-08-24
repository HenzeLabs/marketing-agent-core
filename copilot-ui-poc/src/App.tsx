import { useEffect, useState } from "react";
import {
  getHealth,
  getRevenueDaily,
  getSessionsDaily,
  type RevPt,
  type SessPt,
} from "./lib/api";

export default function App() {
  const [ok, setOk] = useState(false);
  const [rev, setRev] = useState<RevPt[]>([]);
  const [sess, setSess] = useState<SessPt[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [h, r, s] = await Promise.all([
          getHealth(),
          getRevenueDaily(),
          getSessionsDaily(),
        ]);
        setOk(!!h?.ok);
        setRev(r ?? []);
        setSess(s ?? []);
      } catch {
        setErr("API unreachable");
      }
    })();
  }, []);

  const revSum = rev.reduce((a, b) => a + (b.revenue || 0), 0);
  const sessSum = sess.reduce((a, b) => a + (b.sessions || 0), 0);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Marketing Copilot</h1>
      <div style={{ marginBottom: 12 }}>API Health: {ok ? "OK" : "DOWN"}</div>
      {err && <div style={{ color: "red", marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Revenue (sum)</div>
          <div style={{ fontSize: 24 }}>
            {rev.length ? revSum.toFixed(2) : "No data"}
          </div>
        </div>
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Sessions (sum)</div>
          <div style={{ fontSize: 24 }}>
            {sess.length ? sessSum : "No data"}
          </div>
        </div>
      </div>
    </main>
  );
}
