import { notFound } from "next/navigation";
import { getDataset } from "@/lib/google/sheets";
import { buildCmcRows, buildDailyActivity } from "@/lib/analytics/metrics";
import { Header } from "@/components/layout/Header";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DailyActivityChart } from "@/components/charts/DailyActivityChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

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

  const records = dataset.activities.filter(
    (a) => a.cmcId === params.id
  );

  const companyIds = Array.from(
    new Set(records.map((r) => r.companyId).filter(Boolean))
  );

  const companyMap = new Map(
    dataset.companies.map((c) => [c.companyId, c])
  );

  const cmcOnlyDataset = {
    ...dataset,
    activities: records,
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#111111]">

      <Header
        title={row.cmc.name}
        lastSynced={dataset.lastSynced}
        source={dataset.source}
      />

      <main className="mx-auto max-w-[1600px] space-y-7 p-4 md:p-6 lg:p-8">

        {/* =====================================================
            PROFILE
        ====================================================== */}

        <section className="neo-card overflow-hidden">

          <div className="grid lg:grid-cols-[1fr_auto]">

            <div className="p-6 md:p-8">

              <div className="mb-6 flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-[#111] bg-[#ff5a36] text-lg font-black text-white shadow-[4px_4px_0_#111]">
                  {row.cmc.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#737373]">
                    CMC Profile
                  </p>

                  <h1 className="mt-1 text-2xl font-black tracking-tight md:text-4xl">
                    {row.cmc.name}
                  </h1>

                </div>

              </div>

              <p className="text-sm text-[#666]">
                {row.cmc.email}
              </p>

            </div>

            <div className="grid grid-cols-2 border-t-2 border-[#111] lg:grid-cols-4 lg:border-l-2 lg:border-t-0">

              <ProfileStat
                label="CMC ID"
                value={row.cmc.cmcId}
              />

              <ProfileStat
                label="Batch"
                value={row.cmc.batch}
              />

              <ProfileStat
                label="Target"
                value={row.cmc.assignedTarget}
              />

              <div className="flex flex-col justify-center border-t border-[#ddd] bg-[#fafafa] p-5 lg:border-t-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
                  Status
                </span>

                <div className="mt-2 flex items-center gap-2">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      row.cmc.active
                        ? "bg-[#16a34a]"
                        : "bg-[#dc2626]"
                    }`}
                  />

                  <span
                    className={`text-sm font-bold ${
                      row.cmc.active
                        ? "text-[#15803d]"
                        : "text-[#b91c1c]"
                    }`}
                  >
                    {row.cmc.active ? "Active" : "Inactive"}
                  </span>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            KPI
        ====================================================== */}

        <section>

          <SectionHeading
            eyebrow="Performance"
            title="Activity Overview"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

            <MetricCard
              label="Companies Targeted"
              value={row.companiesTargeted}
            />

            <MetricCard
              label="Companies Approached"
              value={row.companiesApproached}
              accent
            />

            <MetricCard
              label="Emails"
              value={row.emails}
            />

            <MetricCard
              label="Calls"
              value={row.calls}
            />

            <MetricCard
              label="Pitches"
              value={row.pitches}
            />

            <MetricCard
              label="Responses"
              value={row.responses}
            />

            <MetricCard
              label="Interested"
              value={row.interested}
              positive
            />

            <MetricCard
              label="Meetings"
              value={row.meetings}
            />

            <MetricCard
              label="Confirmed"
              value={row.confirmed}
              positive
            />

          </div>
        </section>

        {/* =====================================================
            CHART + FUNNEL
        ====================================================== */}

        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">

          {/* Chart */}

          <div className="neo-card p-5 md:p-6">

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <SectionHeading
                eyebrow="Activity"
                title="Daily Activity"
              />

              <div className="flex border-2 border-[#111] bg-[#f4f4f0] p-1">

                <button className="bg-[#111] px-3 py-1.5 text-[11px] font-bold text-white">
                  7D
                </button>

                <button className="px-3 py-1.5 text-[11px] font-bold text-[#666]">
                  30D
                </button>

                <button className="px-3 py-1.5 text-[11px] font-bold text-[#666]">
                  90D
                </button>

              </div>

            </div>

            <div className="rounded-lg border border-[#ddd] bg-[#fafafa] p-3">

              <DailyActivityChart
                data7={buildDailyActivity(cmcOnlyDataset, 7)}
                data30={buildDailyActivity(cmcOnlyDataset, 30)}
                data90={buildDailyActivity(cmcOnlyDataset, 90)}
              />

            </div>
          </div>

          {/* Funnel */}

          <div className="rounded-[10px] border-2 border-[#111] bg-[#111] p-6 text-white shadow-[5px_5px_0_#ff5a36]">

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Conversion
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Outreach Funnel
            </h2>

            <div className="mt-8 space-y-6">

              <FunnelRow
                label="Targeted"
                value={row.companiesTargeted}
                percentage={100}
              />

              <FunnelRow
                label="Approached"
                value={row.companiesApproached}
                percentage={percentage(
                  row.companiesApproached,
                  row.companiesTargeted
                )}
              />

              <FunnelRow
                label="Interested"
                value={row.interested}
                percentage={percentage(
                  row.interested,
                  row.companiesApproached
                )}
              />

              <FunnelRow
                label="Meetings"
                value={row.meetings}
                percentage={percentage(
                  row.meetings,
                  row.companiesApproached
                )}
              />

              <FunnelRow
                label="Confirmed"
                value={row.confirmed}
                percentage={percentage(
                  row.confirmed,
                  row.companiesApproached
                )}
              />

            </div>
          </div>

        </section>

        {/* =====================================================
            COMPANIES
        ====================================================== */}

        <section>

          <div className="mb-4 flex items-end justify-between">

            <SectionHeading
              eyebrow="Outreach Database"
              title="Companies"
            />

            <div className="hidden border-2 border-[#111] bg-white px-3 py-2 text-xs font-bold shadow-[3px_3px_0_#111] sm:block">
              {companyIds.length} tracked
            </div>

          </div>

          <div className="neo-card overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] border-collapse">

                <thead>

                  <tr className="border-b-2 border-[#111] bg-[#111] text-white">

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      Company
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      Industry
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      Last Activity
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      Channel
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                      Next Follow-up
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {companyIds.map((cid) => {

                    const company = companyMap.get(cid);

                    const companyRecords = records
                      .filter((r) => r.companyId === cid)
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      );

                    const latest = companyRecords[0];

                    return (
                      <tr
                        key={cid}
                        className="border-b border-[#e5e5e5] transition-colors hover:bg-[#fff4ef]"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#111] bg-[#f4f4f0] text-xs font-black">
                              {(company?.companyName ??
                                latest?.companyName ??
                                cid)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="text-sm font-bold">
                              {company?.companyName ??
                                latest?.companyName ??
                                cid}
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-sm text-[#666]">
                          {company?.industry ??
                            latest?.industry ??
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-xs text-[#777]">
                          {formatDate(latest?.date)}
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-md border border-[#ddd] bg-[#f7f7f7] px-2 py-1 text-[10px] font-bold uppercase">
                            {latest?.outreachChannel ?? "—"}
                          </span>

                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={latest?.status ?? ""}
                          />
                        </td>

                        <td className="px-5 py-4 text-xs text-[#777]">
                          {formatDate(latest?.nextFollowup)}
                        </td>

                      </tr>
                    );
                  })}

                  {companyIds.length === 0 && (
                    <tr>

                      <td
                        colSpan={6}
                        className="px-6 py-14 text-center"
                      >

                        <div className="mx-auto max-w-sm">

                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#111] bg-[#f4f4f0] font-black">
                            —
                          </div>

                          <p className="mt-4 font-bold">
                            No companies tracked yet
                          </p>

                          <p className="mt-1 text-sm text-[#888]">
                            Company outreach activity will appear here.
                          </p>

                        </div>

                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>
        </section>

        {/* =====================================================
            ACTIVITY
        ====================================================== */}

        <section>

          <SectionHeading
            eyebrow="Activity Log"
            title="Recent Activity"
          />

          <div className="neo-card mt-4 p-5 md:p-6">

            <ActivityFeed activities={records} />

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="flex flex-col justify-between gap-2 border-t-2 border-[#111] py-5 text-xs text-[#777] sm:flex-row">

          <span>
            Source: {dataset.source}
          </span>

          <span>
            Last synced: {dataset.lastSynced}
          </span>

        </footer>

      </main>
    </div>
  );
}

/* ==========================================================
   SECTION HEADING
========================================================== */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-black tracking-tight">
        {title}
      </h2>
    </div>
  );
}

/* ==========================================================
   PROFILE STAT
========================================================== */

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center border-t border-[#ddd] bg-[#fafafa] p-5 lg:border-t-0 lg:border-l">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
        {label}
      </span>

      <span className="mt-2 truncate text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

/* ==========================================================
   METRIC CARD
========================================================== */

function MetricCard({
  label,
  value,
  accent = false,
  positive = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] border-2 border-[#111] p-5 shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-0.5 ${
        positive
          ? "bg-[#f0fdf4]"
          : accent
          ? "bg-[#fff4ef]"
          : "bg-white"
      }`}
    >
      <p className="min-h-[30px] text-[10px] font-bold uppercase leading-relaxed tracking-wider text-[#888]">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black tracking-tight ${
          positive
            ? "text-[#15803d]"
            : accent
            ? "text-[#e54826]"
            : "text-[#111]"
        }`}
      >
        {value}
      </p>

      <div
        className={`mt-4 h-1 w-8 ${
          positive
            ? "bg-[#16a34a]"
            : accent
            ? "bg-[#ff5a36]"
            : "bg-[#111]"
        }`}
      />
    </div>
  );
}

/* ==========================================================
   FUNNEL
========================================================== */

function FunnelRow({
  label,
  value,
  percentage,
}: {
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-medium text-white/60">
          {label}
        </span>

        <span className="text-sm font-black">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">

        <div
          className="h-full rounded-full bg-[#ff5a36]"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

      <div className="mt-1 text-right text-[10px] text-white/35">
        {percentage}%
      </div>

    </div>
  );
}

/* ==========================================================
   PERCENTAGE
========================================================== */

function percentage(
  value: number,
  total: number
) {
  if (!total) return 0;

  return Math.round((value / total) * 100);
}