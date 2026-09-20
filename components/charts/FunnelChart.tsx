import type { FunnelStage } from "@/lib/analytics/metrics";

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));
  return (
    <div className="card p-4">
      <p className="text-sm font-medium text-ink mb-4">Corporate Outreach Funnel</p>
      <div className="space-y-2.5">
        {stages.map((s) => {
          const widthPct = Math.max(4, (s.count / max) * 100);
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-40 shrink-0 text-xs text-muted">{s.label}</div>
              <div className="flex-1 h-6 rounded bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded bg-primary/80"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <div className="w-28 shrink-0 text-right text-xs tabular-nums">
                <span className="font-semibold text-ink">{s.count}</span>
                {s.pctOfPrevious !== null && (
                  <span className="text-muted"> · {s.pctOfPrevious}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
