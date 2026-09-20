import Link from "next/link";
import { getDataset } from "@/lib/google/sheets";
import { findDuplicates } from "@/lib/analytics/metrics";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function DuplicatesPage() {
  const dataset = await getDataset();
  const duplicates = findDuplicates(dataset);

  return (
    <>
      <Header title="Duplicate Corporate Outreach" lastSynced={dataset.lastSynced} source={dataset.source} />
      <main className="p-6 space-y-3">
        {duplicates.length === 0 && (
          <div className="card p-4 text-sm text-muted">No duplicate outreach detected right now.</div>
        )}
        {duplicates.map((d) => (
          <div key={d.companyId} className="card border-l-4 border-l-critical p-4">
            <div className="flex items-center justify-between">
              <Link href={`/dashboard/companies/${d.companyId}`} className="font-semibold text-ink hover:underline">
                {d.companyName}
              </Link>
              <span className="text-xs text-critical font-medium">Duplicate Corporate Outreach</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Assigned CMC: <span className="text-ink">{d.assignedCmcName ?? "Unassigned"}</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Also contacted by:{" "}
              <span className="text-ink">
                {d.contactedByOthers.map((o) => `${o.cmcName} (${o.activityCount})`).join(", ")}
              </span>
            </p>
          </div>
        ))}
      </main>
    </>
  );
}
