import { SectionHeading } from "@/components/ui/SectionHeading";

type CmcKpiGridProps = {
  companiesTargeted: number;
  companiesApproached: number;
  emails: number;
  calls: number;
  pitches: number;
  responses: number;
  interested: number;
  meetings: number;
  confirmed: number;
};

export function CmcKpiGrid(row: CmcKpiGridProps) {
  return (
    <section>
      <SectionHeading eyebrow="Performance" title="Activity Overview" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Companies Targeted" value={row.companiesTargeted} />
        <MetricCard label="Companies Approached" value={row.companiesApproached} accent />
        <MetricCard label="Emails" value={row.emails} />
        <MetricCard label="Calls" value={row.calls} />
        <MetricCard label="Pitches" value={row.pitches} />
        <MetricCard label="Responses" value={row.responses} />
        <MetricCard label="Interested" value={row.interested} positive />
        <MetricCard label="Meetings" value={row.meetings} />
        <MetricCard label="Confirmed" value={row.confirmed} positive />
      </div>
    </section>
  );
}

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
        positive ? "bg-[#f0fdf4]" : accent ? "bg-[#fff4ef]" : "bg-white"
      }`}
    >
      <p className="min-h-[30px] text-[10px] font-bold uppercase leading-relaxed tracking-wider text-[#888]">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black tracking-tight ${
          positive ? "text-[#15803d]" : accent ? "text-[#e54826]" : "text-[#111]"
        }`}
      >
        {value}
      </p>

      <div
        className={`mt-4 h-1 w-8 ${
          positive ? "bg-[#16a34a]" : accent ? "bg-[#ff5a36]" : "bg-[#111]"
        }`}
      />
    </div>
  );
}