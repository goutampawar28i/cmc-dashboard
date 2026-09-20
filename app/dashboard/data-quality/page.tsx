import { getDataset } from "@/lib/google/sheets";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function DataQualityPage() {
  const dataset = await getDataset();
  const total = dataset.activities.length;
  const invalidRecordIds = new Set(dataset.issues.map((i) => i.recordId));
  const invalidCount = invalidRecordIds.size;
  const validPct = total === 0 ? 100 : Math.round(((total - invalidCount) / total) * 1000) / 10;

  const byField = new Map<string, number>();
  for (const issue of dataset.issues) {
    byField.set(issue.field, (byField.get(issue.field) ?? 0) + 1);
  }

  return (
    <>
      <Header title="Data Quality" lastSynced={dataset.lastSynced} source={dataset.source} />
      <main className="p-6 space-y-6">
        <div className="card p-5">
          <p className="text-sm font-medium text-ink">Data Quality Score</p>
          <div className="mt-3 flex items-end gap-8">
            <div>
              <p className="text-3xl font-semibold text-positive tabular-nums">{validPct}%</p>
              <p className="text-xs text-muted">Valid Records</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-critical tabular-nums">{100 - validPct}%</p>
              <p className="text-xs text-muted">Invalid Records ({invalidCount} of {total})</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[...byField.entries()].map(([field, count]) => (
            <div key={field} className="card p-4">
              <p className="text-xs text-muted">{field}</p>
              <p className="mt-1 text-xl font-semibold text-ink tabular-nums">{count}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Issues ({dataset.issues.length})</p>
          <div className="card overflow-x-auto max-h-[500px]">
            <table className="table-base">
              <thead>
                <tr><th>Record</th><th>CMC</th><th>Company</th><th>Field</th><th>Problem</th></tr>
              </thead>
              <tbody>
                {dataset.issues.map((i, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="text-xs text-muted">{i.recordId}</td>
                    <td>{i.cmcName}</td>
                    <td>{i.companyName || "—"}</td>
                    <td className="text-xs text-muted">{i.field}</td>
                    <td className="text-critical text-xs">{i.problem}</td>
                  </tr>
                ))}
                {dataset.issues.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-muted">No data quality issues found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
