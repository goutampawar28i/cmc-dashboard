import Link from "next/link";
import type { AttentionItem } from "@/lib/analytics/metrics";
import { cn } from "@/lib/utils";

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-4 text-sm text-muted">
        Nothing needs attention right now — all clear.
      </div>
    );
  }
  return (
    <div className="card divide-y divide-line">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                item.severity === "critical" ? "bg-critical" : "bg-warn"
              )}
            />
            <span className="text-ink">
              <span className="font-semibold tabular-nums">{item.count}</span> {item.label}
            </span>
          </span>
          <span className="text-muted text-xs">View</span>
        </Link>
      ))}
    </div>
  );
}
