"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Company } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export interface CompanyTableRow extends Company {
  assignedCmcName: string;
  lastContact: string | null;
}

export function CompanyTable({ rows }: { rows: CompanyTableRow[] }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const [status, setStatus] = useState("All");

  const industries = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.industry)))], [rows]);
  const statuses = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.status).filter(Boolean)))] as string[], [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (industry !== "All" && r.industry !== industry) return false;
      if (status !== "All" && r.status !== status) return false;
      if (query.trim() && !r.companyName.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [rows, query, industry, status]);

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company"
          className="w-56 rounded-md border border-line px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="rounded-md border border-line px-2 py-1.5 text-sm">
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-line px-2 py-1.5 text-sm">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(query || industry !== "All" || status !== "All") && (
          <button
            onClick={() => { setQuery(""); setIndustry("All"); setStatus("All"); }}
            className="text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-muted">{filtered.length} of {rows.length} companies</span>
      </div>
      <div className="overflow-x-auto max-h-[560px]">
        <table className="table-base">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Assigned CMC</th>
              <th>Last Contact</th>
              <th>Status</th>
              <th>Next Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.companyId} className="hover:bg-slate-50">
                <td>
                  <Link href={`/dashboard/companies/${c.companyId}`} className="font-medium text-primary hover:underline">
                    {c.companyName}
                  </Link>
                </td>
                <td className="text-muted">{c.industry}</td>
                <td>{c.assignedCmcName}</td>
                <td className="text-muted text-xs">{formatDate(c.lastContact)}</td>
                <td><StatusBadge status={c.status ?? ""} /></td>
                <td className="text-muted text-xs">—</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-muted">No companies match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
