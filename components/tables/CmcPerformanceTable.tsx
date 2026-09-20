"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { CmcRow } from "@/lib/analytics/metrics";
import { formatRelativeTime } from "@/lib/utils";

type SortKey = keyof Pick<
  CmcRow,
  "companiesTargeted" | "companiesApproached" | "totalOutreach" | "emails" | "calls" | "pitches" | "responses" | "interested" | "confirmed"
> | "name";

export function CmcPerformanceTable({ rows }: { rows: CmcRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalOutreach");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeOnly, setActiveOnly] = useState(false);

  const filtered = useMemo(() => {
    let r = rows;
    if (activeOnly) r = r.filter((x) => x.cmc.active);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) => x.cmc.name.toLowerCase().includes(q) || x.cmc.email.toLowerCase().includes(q));
    }
    const sorted = [...r].sort((a, b) => {
      const va = sortKey === "name" ? a.cmc.name : a[sortKey];
      const vb = sortKey === "name" ? b.cmc.name : b[sortKey];
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return sorted;
  }, [rows, query, sortKey, sortDir, activeOnly]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "CMC" },
    { key: "companiesTargeted", label: "Targeted" },
    { key: "companiesApproached", label: "Approached" },
    { key: "totalOutreach", label: "Outreach" },
    { key: "emails", label: "Emails" },
    { key: "calls", label: "Calls" },
    { key: "pitches", label: "Pitches" },
    { key: "responses", label: "Responses" },
    { key: "interested", label: "Interested" },
    { key: "confirmed", label: "Confirmed" },
  ];

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search CMC by name or email"
          className="w-64 rounded-md border border-line px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
          Active only
        </label>
        <span className="ml-auto text-xs text-muted">{filtered.length} of {rows.length} CMCs</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort(c.key)}>
                  {c.label}{sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.cmc.cmcId} className="hover:bg-slate-50">
                <td>
                  <Link href={`/dashboard/cmc/${row.cmc.cmcId}`} className="font-medium text-primary hover:underline">
                    {row.cmc.name}
                  </Link>
                  {!row.cmc.active && <span className="ml-2 text-xs text-muted">(inactive)</span>}
                </td>
                <td className="tabular-nums">{row.companiesTargeted}</td>
                <td className="tabular-nums">{row.companiesApproached}</td>
                <td className="tabular-nums font-medium">{row.totalOutreach}</td>
                <td className="tabular-nums">{row.emails}</td>
                <td className="tabular-nums">{row.calls}</td>
                <td className="tabular-nums">{row.pitches}</td>
                <td className="tabular-nums">{row.responses}</td>
                <td className="tabular-nums">{row.interested}</td>
                <td className="tabular-nums">{row.confirmed}</td>
                <td className="text-muted text-xs whitespace-nowrap">{formatRelativeTime(row.lastActivity)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-sm text-muted">
                  No CMCs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
