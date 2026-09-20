import { cn } from "@/lib/utils";

export function ActivityHeatmap({
  dateKeys,
  grid,
}: {
  dateKeys: string[];
  grid: { cmcName: string; counts: number[] }[];
}) {
  const max = Math.max(1, ...grid.flatMap((g) => g.counts));

  function cellClass(count: number) {
    if (count === 0) return "bg-slate-100";
    const ratio = count / max;
    if (ratio > 0.75) return "bg-primary";
    if (ratio > 0.5) return "bg-primary/70";
    if (ratio > 0.25) return "bg-primary/40";
    return "bg-primary/20";
  }

  return (
    <div className="card p-4 overflow-x-auto">
      <p className="text-sm font-medium text-ink mb-4">CMC Activity Heatmap — last {dateKeys.length} days</p>
      <table className="text-xs border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr>
            <th className="text-left font-normal text-muted pr-2 sticky left-0 bg-surface"> </th>
            {dateKeys.map((d) => (
              <th key={d} className="font-normal text-muted px-0.5" style={{ minWidth: 18 }}>
                {d.slice(8)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row) => (
            <tr key={row.cmcName}>
              <td className="pr-2 text-ink whitespace-nowrap sticky left-0 bg-surface">{row.cmcName}</td>
              {row.counts.map((c, i) => (
                <td key={i}>
                  <div
                    title={`${row.cmcName} · ${dateKeys[i]} · ${c} activities`}
                    className={cn("h-4 w-4 rounded-sm", cellClass(c))}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
