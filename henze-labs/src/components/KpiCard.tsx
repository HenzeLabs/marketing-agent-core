type KpiCardProps = {
  label: string;
  value: string | number;
  delta?: number;
  suffix?: string;
  icon?: React.ReactNode;
};

export function KpiCard({ label, value, delta, suffix, icon }: KpiCardProps) {
  const up = typeof delta === "number" && delta >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="text-sm text-content-muted">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold text-content">
        {value}
        {suffix}
      </div>
      {typeof delta === "number" && (
        <div className={`mt-1 text-xs ${up ? "text-success" : "text-danger"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
