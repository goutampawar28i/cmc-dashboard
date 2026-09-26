import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { ActivityRecord, Company } from "@/types";

type CmcCompaniesTableProps = {
  companyIds: string[];
  companyMap: Map<string, Company>;
  records: ActivityRecord[];
};

export function CmcCompaniesTable({
  companyIds,
  companyMap,
  records,
}: CmcCompaniesTableProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <SectionHeading eyebrow="Outreach Database" title="Companies" />

        <div className="hidden border-2 border-[#111] bg-white px-3 py-2 text-xs font-bold shadow-[3px_3px_0_#111] sm:block">
          {companyIds.length} tracked
        </div>
      </div>

      <div className="neo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b-2 border-[#111] bg-[#111] text-white">
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Company</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Industry</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Last Activity</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Channel</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Next Follow-up</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {companyIds.map((cid) => {
                const company = companyMap.get(cid);
                const companyRecords = records
                  .filter((r) => r.companyId === cid)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const latest = companyRecords[0];

                return (
                  <tr key={cid} className="border-b border-[#e5e5e5] transition-colors hover:bg-[#fff4ef]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#111] bg-[#f4f4f0] text-xs font-black">
                          {(company?.companyName ?? latest?.companyName ?? cid).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold">
                          {company?.companyName ?? latest?.companyName ?? cid}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#666]">
                      {company?.industry ?? latest?.industry ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#777]">{formatDate(latest?.date)}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-md border border-[#ddd] bg-[#f7f7f7] px-2 py-1 text-[10px] font-bold uppercase">
                        {latest?.outreachChannel ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={latest?.status ?? ""} />
                    </td>

                    <td className="px-5 py-4 text-xs text-[#777]">{formatDate(latest?.nextFollowup)}</td>
                    <td className="px-5 py-4 text-xs text-[#777]">{latest?.remarks ?? "—" }</td>
                  </tr>
                );
              })}

              {companyIds.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#111] bg-[#f4f4f0] font-black">
                        —
                      </div>
                      <p className="mt-4 font-bold">No companies tracked yet</p>
                      <p className="mt-1 text-sm text-[#888]">Company outreach activity will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}