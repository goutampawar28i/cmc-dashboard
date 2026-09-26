import { notFound } from "next/navigation";
import { getDataset } from "@/lib/google/sheets";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: { companyId: string } }) {
  const dataset = await getDataset();
  const company = dataset.companies.find((c) => c.companyId === params.companyId);
  if (!company) notFound();

  const records = dataset.activities
    .filter((a) => a.companyId === params.companyId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const involvedCmcs = Array.from(new Set(records.map((r) => r.cmcName)));

  return (
    <>
      <Header title={company.companyName} lastSynced={dataset.lastSynced} source={dataset.source} />
      <main className="p-6 space-y-6">
        <div className="card p-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-base font-semibold text-ink">{company.companyName}</p>
            <p className="text-sm text-muted">{company.industry}</p>
            {company.website && (
              <a href={company.website} target="_blank" className="text-xs text-primary hover:underline">
                {company.website}
              </a>
            )}
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-muted">Primary Contact: </span>{company.primaryContact ?? "—"}</p>
            <p><span className="text-muted">Email: </span>{company.contactEmail ?? "—"}</p>
            <p><span className="text-muted">Phone: </span>{company.contactPhone ?? "—"}</p>
            <p><span className="text-muted">Current Status: </span><StatusBadge status={company.status ?? ""} /></p>
          </div>
        </div>

        {involvedCmcs.length > 1 && (
          <div className="card border-critical/30 bg-red-50/40 p-3 text-sm text-critical">
            Contacted by multiple CMCs: {involvedCmcs.join(", ")}
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Outreach History</p>
          <div className="card divide-y divide-line">
            {records.map((r) => (
              <div key={r.recordId} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{r.cmcName} · {r.activity}</p>
                  <span className="text-xs text-muted">{formatDate(r.date)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {r.outreachChannel} {r.response ? `· Response: ${r.response}` : ""} {r.remarks ? `· ${r.remarks}` : ""}
                </p>
                {(r.meetingDate || r.campusVisitDate) && (
                  <p className="mt-0.5 text-xs text-muted">
                    {r.meetingDate ? `Meeting: ${formatDate(r.meetingDate)}` : ""}
                    {r.meetingDate && r.campusVisitDate ? " · " : ""}
                    {r.campusVisitDate ? `Campus Visit: ${formatDate(r.campusVisitDate)}` : ""}
                  </p>
                )}
              </div>
            ))}
            {records.length === 0 && <p className="px-4 py-6 text-sm text-muted">No outreach recorded yet.</p>}
          </div>
        </div>
      </main>
    </>
  );
}