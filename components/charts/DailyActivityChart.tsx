"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { DailyActivityPoint } from "@/lib/analytics/metrics";

export function DailyActivityChart({
  data7,
  data30,
  data90,
}: {
  data7: DailyActivityPoint[];
  data30: DailyActivityPoint[];
  data90: DailyActivityPoint[];
}) {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const data = range === 7 ? data7 : range === 30 ? data30 : data90;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-ink">Daily Outreach Activity</p>
        <div className="flex rounded-md border border-line overflow-hidden text-xs">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as 7 | 30 | 90)}
              className={`px-2.5 py-1 ${range === r ? "bg-primary text-white" : "bg-surface text-muted hover:bg-slate-50"}`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={20}
            />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E9F0" }}
              labelFormatter={(d: string) => d}
            />
            <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
