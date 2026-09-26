import type { CMC } from "@/types";

export function CmcProfileCard({ cmc }: { cmc: CMC }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1fr_auto]">
        {/* Profile Info */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ff5a36] text-lg font-black text-white shadow-sm">
              {cmc.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            {/* Name */}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#737373]">
                CMC Profile
              </p>

              <h1 className="mt-1 truncate text-2xl font-black tracking-tight md:text-3xl">
                {cmc.name}
              </h1>

              <p className="mt-1 truncate text-sm text-[#666]">
                {cmc.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-t border-[#e5e5e5] lg:border-l lg:border-t-0">
          <ProfileStat
            label="CMC ID"
            value={cmc.cmcId}
          />

          <ProfileStat
            label="Section"
            value={cmc.section}
          />

          {/* Status */}
          <div className="flex min-w-[120px] flex-col justify-center bg-[#fafafa] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
              Status
            </span>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  cmc.active ? "bg-[#16a34a]" : "bg-[#dc2626]"
                }`}
              />

              <span
                className={`text-sm font-bold ${
                  cmc.active ? "text-[#15803d]" : "text-[#b91c1c]"
                }`}
              >
                {cmc.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-[120px] flex-col justify-center border-r border-[#e5e5e5] bg-[#fafafa] p-5 last:border-r-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#888]">
        {label}
      </span>

      <span className="mt-2 truncate text-sm font-bold text-[#111]">
        {value}
      </span>
    </div>
  );
}