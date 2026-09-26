import { notFound } from "next/navigation";
import { getDataset } from "@/lib/google/sheets";
import { buildCmcRows } from "@/lib/analytics/metrics";
import { Header } from "@/components/layout/Header";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CmcProfileCard } from "@/components/dashboard/CmcProfileCard";
import { CmcKpiGrid } from "@/components/dashboard/CmcKpiGrid";
import { CmcActivityFunnel } from "@/components/dashboard/CmcActivityFunnel";
import { CmcCompaniesTable } from "@/components/tables/CmcCompaniesTable";

export const dynamic = "force-dynamic";

export default async function CmcDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const dataset = await getDataset();
  const rows = buildCmcRows(dataset);
  const row = rows.find((r) => r.cmc.cmcId === params.id);

  if (!row) notFound();

  const records = dataset.activities.filter((a) => a.cmcId === params.id);

  const companyIds = Array.from(
    new Set(records.map((r) => r.companyId).filter(Boolean))
  );

  const companyMap = new Map(dataset.companies.map((c) => [c.companyId, c]));

  const cmcOnlyDataset = { ...dataset, activities: records };

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#111111]">
      <Header title={row.cmc.name} lastSynced={dataset.lastSynced} source={dataset.source} />

      <main className="mx-auto max-w-[1600px] space-y-7 p-4 md:p-6 lg:p-8">
        <CmcProfileCard cmc={row.cmc} />

        <CmcKpiGrid
          companiesTargeted={row.companiesTargeted}
          companiesApproached={row.companiesApproached}
          emails={row.emails}
          calls={row.calls}
          pitches={row.pitches}
          responses={row.responses}
          interested={row.interested}
          meetings={row.meetings}
          confirmed={row.confirmed}
        />

        <CmcActivityFunnel
          cmcOnlyDataset={cmcOnlyDataset}
          companiesTargeted={row.companiesTargeted}
          companiesApproached={row.companiesApproached}
          interested={row.interested}
          meetings={row.meetings}
          confirmed={row.confirmed}
        />

        <CmcCompaniesTable
          companyIds={companyIds}
          companyMap={companyMap}
          records={records}
        />

        <section>
          <SectionHeading eyebrow="Activity Log" title="Recent Activity" />
          <div className="neo-card mt-4 p-5 md:p-6">
            <ActivityFeed activities={records} />
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-2 border-t-2 border-[#111] py-5 text-xs text-[#777] sm:flex-row">
          <span>Source: {dataset.source}</span>
          <span>Last synced: {dataset.lastSynced}</span>
        </footer>
      </main>
    </div>
  );
}