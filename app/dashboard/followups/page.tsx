import { getDataset } from "@/lib/google/sheets";
import { buildFollowups, type FollowupRow } from "@/lib/analytics/metrics";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BUCKETS: FollowupRow["bucket"][] = ["Overdue", "Due Today", "Due This Week", "Upcoming"];

export default async function FollowupsPage() {
  const dataset = await getDataset();
  const rows = buildFollowups(dataset);

  return (
    <>
      <Header title="Follow-up Management" lastSynced={dataset.lastSynced} source={dataset.source} />
      <main className="p-6 space-y-6">
        {BUCKETS.map((bucket) => {
          const bucketRows = rows.filter((r) => r.bucket === bucket);
          if (bucketRows.length === 0) return null;
          return (
            <div key={bucket}>
              <p className={cn(
                "mb-2 text-sm font-medium",
                bucket === "Overdue" ? "text-critical" : bucket === "Due Today" ? "text-warn" : "text-ink"
              )}>
                {bucket} ({bucketRows.length})
              </p>
              <div className="card overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr><th>Company</th><th>CMC</th><th>Follow-up Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bucketRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="font-medium text-ink">{r.companyName || "—"}</td>
                        <td>{r.cmcName}</td>
                        <td className="text-xs text-muted">{formatDate(r.followupDate)}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted">No follow-ups scheduled.</p>}
      </main>
    </>
  );
}
