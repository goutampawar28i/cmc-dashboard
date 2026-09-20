import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "positive" | "warn" | "critical";
}) {
  const toneClass = {
    default: "text-ink",
    positive: "text-positive",
    warn: "text-warn",
    critical: "text-critical",
  }[tone];

  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
    </div>
  );
}
