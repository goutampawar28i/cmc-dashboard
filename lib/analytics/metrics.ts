import type { ActivityRecord, CMC, Company, RawDataset } from "@/types";

// ---------------------------------------------------------------------------
// All metric definitions live in this one file, matching the build spec's
// "Section 6: Important Metric Definitions" precisely. The rule that matters
// most: outreach ACTIVITIES and unique COMPANIES are always counted
// separately. Never let a company be counted twice for a "unique" metric.
// ---------------------------------------------------------------------------

export interface CmcRow {
  cmc: CMC;
  companiesTargeted: number; // unique companies with any activity from this CMC
  companiesApproached: number; // unique companies with an actual outreach activity (excludes "Company Targeted" only)
  totalOutreach: number; // total activity records
  emails: number;
  calls: number;
  linkedIn: number;
  pitches: number;
  responses: number; // unique companies with a real response
  interested: number; // unique companies currently Interested
  meetings: number;
  confirmed: number; // unique companies Confirmed
  lastActivity: string | null; // ISO date
}

export interface FunnelStage {
  label: string;
  count: number;
  pctOfPrevious: number | null;
}

export interface OverviewMetrics {
  totalCmcs: number;
  activeCmcs: number;
  companiesTargeted: number;
  companiesApproached: number;
  totalOutreach: number;
  emailsSent: number;
  pitchesSent: number;
  responses: number;
  interested: number;
  meetings: number;
  confirmedCompanies: number;
  campusVisits: number;
}

const OUTREACH_ACTIVITY_TYPES = new Set([
  "Initial Outreach", "Email Sent", "Call Made", "LinkedIn Outreach",
  "Pitch Sent", "Follow-up", "Meeting", "Proposal Sent",
  "Campus Visit Discussion", "Campus Visit Confirmed",
]);

function uniqueCompanyIds(records: ActivityRecord[]): Set<string> {
  const s = new Set<string>();
  for (const r of records) if (r.companyId) s.add(r.companyId);
  return s;
}

function latestStatusByCompany(records: ActivityRecord[]): Map<string, ActivityRecord> {
  const latest = new Map<string, ActivityRecord>();
  for (const r of records) {
    if (!r.companyId) continue;
    const cur = latest.get(r.companyId);
    if (!cur || new Date(r.date).getTime() >= new Date(cur.date).getTime()) {
      latest.set(r.companyId, r);
    }
  }
  return latest;
}

export function buildCmcRows(dataset: RawDataset): CmcRow[] {
  const byCmc = new Map<string, ActivityRecord[]>();
  for (const a of dataset.activities) {
    if (!byCmc.has(a.cmcId)) byCmc.set(a.cmcId, []);
    byCmc.get(a.cmcId)!.push(a);
  }

  return dataset.cmcs.map((cmc) => {
    const records = byCmc.get(cmc.cmcId) ?? [];
    const targeted = uniqueCompanyIds(records);
    const approachedRecords = records.filter((r) => OUTREACH_ACTIVITY_TYPES.has(r.activity));
    const approached = uniqueCompanyIds(approachedRecords);
    const latest = latestStatusByCompany(records);

    const interestedCount = [...latest.values()].filter((r) => r.status === "Interested").length;
    const confirmedCount = [...latest.values()].filter((r) => r.status === "Confirmed").length;
    const respondedCount = [...latest.values()].filter(
      (r) => r.response && r.response !== "No Response"
    ).length;

    const lastActivity = records.reduce<string | null>((acc, r) => {
      if (!r.date) return acc;
      if (!acc || new Date(r.date) > new Date(acc)) return r.date;
      return acc;
    }, null);

    return {
      cmc,
      companiesTargeted: targeted.size,
      companiesApproached: approached.size,
      totalOutreach: records.length,
      emails: records.filter((r) => r.outreachChannel === "Email" || r.activity === "Email Sent").length,
      calls: records.filter((r) => r.outreachChannel === "Phone Call" || r.activity === "Call Made").length,
      linkedIn: records.filter((r) => r.outreachChannel === "LinkedIn" || r.activity === "LinkedIn Outreach").length,
      pitches: records.filter((r) => r.activity === "Pitch Sent").length,
      responses: respondedCount,
      interested: interestedCount,
      meetings: records.filter((r) => r.activity === "Meeting").length,
      confirmed: confirmedCount,
      lastActivity,
    };
  });
}

export function buildOverview(dataset: RawDataset): OverviewMetrics {
  const { activities, cmcs } = dataset;
  const targeted = uniqueCompanyIds(activities);
  const approachedRecords = activities.filter((r) => OUTREACH_ACTIVITY_TYPES.has(r.activity));
  const approached = uniqueCompanyIds(approachedRecords);
  const latest = latestStatusByCompany(activities);

  return {
    totalCmcs: cmcs.length,
    activeCmcs: cmcs.filter((c) => c.active).length,
    companiesTargeted: targeted.size,
    companiesApproached: approached.size,
    totalOutreach: activities.length,
    emailsSent: activities.filter((r) => r.outreachChannel === "Email" || r.activity === "Email Sent").length,
    pitchesSent: activities.filter((r) => r.activity === "Pitch Sent").length,
    responses: [...latest.values()].filter((r) => r.response && r.response !== "No Response").length,
    interested: [...latest.values()].filter((r) => r.status === "Interested").length,
    meetings: activities.filter((r) => r.activity === "Meeting").length,
    confirmedCompanies: [...latest.values()].filter((r) => r.status === "Confirmed").length,
    campusVisits: [...latest.values()].filter((r) => r.status === "Confirmed" && r.campusVisitDate).length ||
      activities.filter((r) => r.activity === "Campus Visit Confirmed").length,
  };
}

export function buildFunnel(dataset: RawDataset): FunnelStage[] {
  const { activities } = dataset;
  const latest = latestStatusByCompany(activities);
  const latestVals = [...latest.values()];

  const targeted = uniqueCompanyIds(activities).size;
  const contacted = uniqueCompanyIds(activities.filter((r) => OUTREACH_ACTIVITY_TYPES.has(r.activity))).size;
  const pitched = uniqueCompanyIds(activities.filter((r) => r.activity === "Pitch Sent")).size;
  const responded = latestVals.filter((r) => r.response && r.response !== "No Response").length;
  const interested = latestVals.filter((r) => r.status === "Interested").length;
  const meetings = uniqueCompanyIds(activities.filter((r) => r.activity === "Meeting")).size;
  const confirmed = latestVals.filter((r) => r.status === "Confirmed").length;
  const campusVisit = uniqueCompanyIds(activities.filter((r) => r.activity === "Campus Visit Confirmed")).size;

  const stages: [string, number][] = [
    ["Companies Targeted", targeted],
    ["Companies Contacted", contacted],
    ["Pitches Sent", pitched],
    ["Responses", responded],
    ["Interested", interested],
    ["Meetings", meetings],
    ["Confirmed", confirmed],
    ["Campus Visit", campusVisit],
  ];

  return stages.map(([label, count], i) => ({
    label,
    count,
    pctOfPrevious: i === 0 ? null : stages[i - 1][1] === 0 ? 0 : Math.round((count / stages[i - 1][1]) * 1000) / 10,
  }));
}

export interface DuplicateEntry {
  companyId: string;
  companyName: string;
  assignedCmcName: string | null;
  contactedByOthers: { cmcId: string; cmcName: string; activityCount: number }[];
}

export function findDuplicates(dataset: RawDataset): DuplicateEntry[] {
  const { activities, companies } = dataset;
  const byCompany = new Map<string, Map<string, { cmcName: string; count: number }>>();

  for (const a of activities) {
    if (!a.companyId) continue;
    if (!byCompany.has(a.companyId)) byCompany.set(a.companyId, new Map());
    const cmcMap = byCompany.get(a.companyId)!;
    const cur = cmcMap.get(a.cmcId);
    cmcMap.set(a.cmcId, { cmcName: a.cmcName, count: (cur?.count ?? 0) + 1 });
  }

  const companyById = new Map(companies.map((c) => [c.companyId, c]));
  const result: DuplicateEntry[] = [];

  for (const [companyId, cmcMap] of byCompany.entries()) {
    if (cmcMap.size < 2) continue;
    const company = companyById.get(companyId);
    const assignedCmcId = company?.assignedCmcId;
    const entries = [...cmcMap.entries()].map(([cmcId, v]) => ({ cmcId, cmcName: v.cmcName, activityCount: v.count }));
    result.push({
      companyId,
      companyName: company?.companyName ?? entries[0]?.cmcName ?? companyId,
      assignedCmcName: assignedCmcId
        ? cmcMap.get(assignedCmcId)?.cmcName ?? null
        : null,
      contactedByOthers: entries
        .filter((e) => e.cmcId !== assignedCmcId)
        .sort((a, b) => b.activityCount - a.activityCount),
    });
  }

  return result.sort((a, b) => b.contactedByOthers.length - a.contactedByOthers.length);
}

export interface FollowupRow {
  companyId: string;
  companyName: string;
  cmcName: string;
  followupDate: string;
  bucket: "Overdue" | "Due Today" | "Due This Week" | "Upcoming";
  status: string;
}

export function buildFollowups(dataset: RawDataset): FollowupRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const rows: FollowupRow[] = [];
  for (const a of dataset.activities) {
    if (!a.nextFollowup) continue;
    const d = new Date(a.nextFollowup);
    if (isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);

    let bucket: FollowupRow["bucket"];
    if (d.getTime() < today.getTime()) bucket = "Overdue";
    else if (d.getTime() === today.getTime()) bucket = "Due Today";
    else if (d.getTime() <= weekEnd.getTime()) bucket = "Due This Week";
    else bucket = "Upcoming";

    rows.push({
      companyId: a.companyId,
      companyName: a.companyName,
      cmcName: a.cmcName,
      followupDate: a.nextFollowup,
      bucket,
      status: a.status,
    });
  }
  return rows.sort((a, b) => new Date(a.followupDate).getTime() - new Date(b.followupDate).getTime());
}

export interface AttentionItem {
  id: string;
  severity: "critical" | "warn";
  label: string;
  count: number;
  href: string;
}

export function buildAttentionItems(dataset: RawDataset): AttentionItem[] {
  const followups = buildFollowups(dataset);
  const overdue = followups.filter((f) => f.bucket === "Overdue").length;

  const cmcRows = buildCmcRows(dataset);
  const staleCmcs = cmcRows.filter((r) => {
    if (!r.lastActivity) return true;
    const days = (Date.now() - new Date(r.lastActivity).getTime()) / 86400000;
    return days > 3;
  }).length;

  const latest = latestStatusByCompany(dataset.activities);
  const interestedNoMeeting = [...latest.values()].filter((r) => {
    return r.status === "Interested" && !dataset.activities.some(
      (a) => a.companyId === r.companyId && a.activity === "Meeting"
    );
  }).length;

  const pitchedNoFollowup = dataset.activities.filter(
    (a) => a.activity === "Pitch Sent" && !a.nextFollowup
  ).length;

  const duplicates = findDuplicates(dataset).length;
  const missingData = dataset.issues.length;

  const items: AttentionItem[] = [
    { id: "overdue", severity: "critical", label: "overdue follow-ups", count: overdue, href: "/dashboard/followups" },
    { id: "stale", severity: "warn", label: "CMCs with no recent activity (3+ days)", count: staleCmcs, href: "/dashboard/cmc" },
    { id: "interested-no-meeting", severity: "warn", label: "interested companies with no meeting scheduled", count: interestedNoMeeting, href: "/dashboard/companies" },
    { id: "pitched-no-followup", severity: "warn", label: "pitches sent with no follow-up set", count: pitchedNoFollowup, href: "/dashboard/followups" },
    { id: "duplicates", severity: "critical", label: "duplicate company assignments", count: duplicates, href: "/dashboard/duplicates" },
    { id: "data-quality", severity: "warn", label: "data quality issues found", count: missingData, href: "/dashboard/data-quality" },
  ];
  return items.filter((i) => i.count > 0);
}

export interface DailyActivityPoint {
  date: string;
  count: number;
}

export function buildDailyActivity(dataset: RawDataset, days: 7 | 30 | 90): DailyActivityPoint[] {
  const buckets = new Map<string, number>();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const a of dataset.activities) {
    if (buckets.has(a.date)) buckets.set(a.date, (buckets.get(a.date) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

export interface IndustryRow {
  industry: string;
  companies: number;
  outreach: number;
  responses: number;
  interested: number;
  confirmed: number;
}

export function buildIndustryAnalytics(dataset: RawDataset): IndustryRow[] {
  const byIndustry = new Map<string, ActivityRecord[]>();
  for (const a of dataset.activities) {
    const key = a.industry || "Other";
    if (!byIndustry.has(key)) byIndustry.set(key, []);
    byIndustry.get(key)!.push(a);
  }

  return [...byIndustry.entries()]
    .map(([industry, records]) => {
      const latest = latestStatusByCompany(records);
      const latestVals = [...latest.values()];
      return {
        industry,
        companies: uniqueCompanyIds(records).size,
        outreach: records.length,
        responses: latestVals.filter((r) => r.response && r.response !== "No Response").length,
        interested: latestVals.filter((r) => r.status === "Interested").length,
        confirmed: latestVals.filter((r) => r.status === "Confirmed").length,
      };
    })
    .sort((a, b) => b.companies - a.companies);
}

export function buildHeatmap(dataset: RawDataset, days = 14) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const dateKeys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dateKeys.push(d.toISOString().slice(0, 10));
  }

  const grid = dataset.cmcs
    .filter((c) => c.active)
    .map((cmc) => {
      const counts = dateKeys.map((date) =>
        dataset.activities.filter((a) => a.cmcId === cmc.cmcId && a.date === date).length
      );
      return { cmcName: cmc.name, counts };
    });

  return { dateKeys, grid };
}
