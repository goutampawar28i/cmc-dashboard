import { getDataset } from "@/lib/google/sheets";
import { buildIndustryAnalytics, buildHeatmap } from "@/lib/analytics/metrics";
import { Header } from "@/components/layout/Header";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const dataset = await getDataset();
  const industries = buildIndustryAnalytics(dataset);
  const heatmap = buildHeatmap(dataset, 14);

  return (
    <>
      <Header title="Analytics" lastSynced={dataset.lastSynced} source={dataset.source} />
      <main className="p-6 space-y-6">
        <ActivityHeatmap dateKeys={heatmap.dateKeys} grid={heatmap.grid} />

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Industry Analytics</p>
          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>Industry</th><th>Companies</th><th>Outreach</th><th>Responses</th><th>Interested</th><th>Confirmed</th></tr>
              </thead>
              <tbody>
                {industries.map((row) => (
                  <tr key={row.industry} className="hover:bg-slate-50">
                    <td className="font-medium text-ink">{row.industry}</td>
                    <td className="tabular-nums">{row.companies}</td>
                    <td className="tabular-nums">{row.outreach}</td>
                    <td className="tabular-nums">{row.responses}</td>
                    <td className="tabular-nums">{row.interested}</td>
                    <td className="tabular-nums">{row.confirmed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
