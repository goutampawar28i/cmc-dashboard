import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "—";
  const diffMs = Date.now() - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}

export function formatSyncTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export const STATUS_COLORS: Record<string, string> = {
  Targeted: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-50 text-blue-700",
  "No Response": "bg-slate-100 text-muted",
  "Follow-up Required": "bg-amber-50 text-warn",
  Interested: "bg-emerald-50 text-positive",
  "Discussion Scheduled": "bg-indigo-50 text-indigo-700",
  "Proposal Sent": "bg-indigo-50 text-indigo-700",
  Confirmed: "bg-emerald-100 text-positive",
  Rejected: "bg-red-50 text-critical",
  "Not Relevant": "bg-slate-100 text-muted",
};
