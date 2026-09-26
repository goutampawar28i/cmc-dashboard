import { SectionHeading } from "@/components/ui/SectionHeading";
import { DailyActivityChart } from "@/components/charts/DailyActivityChart";
import type { RawDataset } from "@/types";
import { buildDailyActivity } from "@/lib/analytics/metrics";

type CmcActivityFunnelProps = {
  cmcOnlyDataset: RawDataset;
  companiesTargeted: number;
  companiesApproached: number;
  interested: number;
  meetings: number;
  confirmed: number;
};

export function CmcActivityFunnel({
  cmcOnlyDataset,
  companiesTargeted,
  companiesApproached,
  interested,
  meetings,
  confirmed,
}: CmcActivityFunnelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="neo-card p-5 md:p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Activity" title="Daily Activity" />

          <div className="flex border-2 border-[#111] bg-[#f4f4f0] p-1">
            <button className="bg-[#111] px-3 py-1.5 text-[11px] font-bold text-white">7D</button>
            <button className="px-3 py-1.5 text-[11px] font-bold text-[#666]">30D</button>
            <button className="px-3 py-1.5 text-[11px] font-bold text-[#666]">90D</button>
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

      <div className="rounded-[10px] border-2 border-[#111] bg-[#111] p-6 text-white shadow-[5px_5px_0_#ff5a36]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
          Conversion
        </p>

        <h2 className="mt-1 text-2xl font-black">Outreach Funnel</h2>

        <div className="mt-8 space-y-6">
          <FunnelRow label="Targeted" value={companiesTargeted} percentage={100} />
          <FunnelRow
            label="Approached"
            value={companiesApproached}
            percentage={percentage(companiesApproached, companiesTargeted)}
          />
          <FunnelRow
            label="Interested"
            value={interested}
            percentage={percentage(interested, companiesApproached)}
          />
          <FunnelRow
            label="Meetings"
            value={meetings}
            percentage={percentage(meetings, companiesApproached)}
          />
          <FunnelRow
            label="Confirmed"
            value={confirmed}
            percentage={percentage(confirmed, companiesApproached)}
          />
        </div>
      </div>
    </section>
  );
}

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
        <span className="text-xs font-medium text-white/60">{label}</span>
        <span className="text-sm font-black">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#ff5a36]"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="mt-1 text-right text-[10px] text-white/35">{percentage}%</div>
    </div>
  );
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}