import { STATUS_COLORS, cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[status] ?? "bg-slate-100 text-muted")}>
      {status || "—"}
    </span>
  );
}
