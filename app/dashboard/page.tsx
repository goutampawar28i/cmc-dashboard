import { getDataset } from "@/lib/google/sheets";
import {
  buildOverview,
  buildFunnel,
  buildAttentionItems,
  buildDailyActivity,
} from "@/lib/analytics/metrics";

import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { AttentionList } from "@/components/dashboard/AttentionList";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DailyActivityChart } from "@/components/charts/DailyActivityChart";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const dataset = await getDataset();

  const overview = buildOverview(dataset);
  const funnel = buildFunnel(dataset);
  const attention = buildAttentionItems(dataset);

  return (
    <>
      <Header
        title="Overview"
        lastSynced={dataset.lastSynced}
        source={dataset.source}
      />

      <main className="space-y-8 bg-[#f4f4f0] p-4 md:p-6 lg:p-8">

        {/* =====================================================
            KPI OVERVIEW
        ====================================================== */}

        <section>

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
                Performance Snapshot
              </p>

              <h2 className="mt-1 text-lg font-black tracking-tight text-[#111111]">
                Outreach Overview
              </h2>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#999999]">
                Reporting Period
              </p>

              <p className="mt-1 text-xs font-bold text-[#333333]">
                Current Dataset
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            <KpiCard
              label="Total CMCs"
              value={overview.totalCmcs}
            />

            <KpiCard
              label="Active CMCs"
              value={overview.activeCmcs}
            />

            <KpiCard
              label="Companies Targeted"
              value={overview.companiesTargeted}
            />

            <KpiCard
              label="Companies Approached"
              value={overview.companiesApproached}
            />

            <KpiCard
              label="Total Outreach"
              value={overview.totalOutreach}
            />

            <KpiCard
              label="Emails Sent"
              value={overview.emailsSent}
            />

            <KpiCard
              label="Pitches Sent"
              value={overview.pitchesSent}
            />

            <KpiCard
              label="Responses"
              value={overview.responses}
            />

            <KpiCard
              label="Interested"
              value={overview.interested}
              tone="positive"
            />

            <KpiCard
              label="Meetings"
              value={overview.meetings}
            />

            <KpiCard
              label="Confirmed Companies"
              value={overview.confirmedCompanies}
              tone="positive"
            />

            <KpiCard
              label="Campus Visits"
              value={overview.campusVisits}
              tone="positive"
            />

          </div>

        </section>


        {/* =====================================================
            ATTENTION REQUIRED
        ====================================================== */}

        <section>

          <div className="mb-4">

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
              Action Center
            </p>

            <div className="mt-1 flex items-center gap-3">

              <h2 className="text-lg font-black tracking-tight text-[#111111]">
                Attention Required
              </h2>

              {attention.length > 0 && (
                <span className="rounded-full border border-[#111111] bg-[#ff5a36] px-2 py-0.5 text-[9px] font-black text-white">
                  {attention.length}
                </span>
              )}

            </div>

          </div>

          <AttentionList items={attention} />

        </section>


        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <section>

          <div className="mb-4">

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
              Outreach Analytics
            </p>

            <h2 className="mt-1 text-lg font-black tracking-tight text-[#111111]">
              Pipeline & Activity
            </h2>

          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            <FunnelChart stages={funnel} />

            <DailyActivityChart
              data7={buildDailyActivity(dataset, 7)}
              data30={buildDailyActivity(dataset, 30)}
              data90={buildDailyActivity(dataset, 90)}
            />

          </div>

        </section>


        {/* =====================================================
            RECENT ACTIVITY
        ====================================================== */}

        <section>

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
                Activity Log
              </p>

              <h2 className="mt-1 text-lg font-black tracking-tight text-[#111111]">
                Recent Activity
              </h2>

            </div>

            <span className="hidden text-[9px] font-bold uppercase tracking-wider text-[#999999] sm:block">
              Latest updates
            </span>

          </div>

          <ActivityFeed activities={dataset.activities} />

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="border-t-2 border-[#111111] pt-4">

          <div className="flex flex-col justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-[#999999] sm:flex-row">

            <span>
              CMC Outreach Dashboard
            </span>

            <span>
              Developed by Goutam Pawar
            </span>

          </div>

        </footer>

      </main>
    </>
  );
}