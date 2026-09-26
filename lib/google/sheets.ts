import "server-only";
import { sheets } from "@googleapis/sheets";
import { JWT } from "google-auth-library";
import type {
  ActivityRecord,
  CMC,
  Company,
  DataQualityIssue,
  OutreachChannel,
  ActivityType,
  OutreachStatus,
  RawDataset,
} from "@/types";
import { generateMockDataset } from "@/lib/mock/generateMockData";


const REQUIRED_ENV = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_SHEET_ID",
] as const;

function hasGoogleCredentials(): boolean {
  return REQUIRED_ENV.every((key) => !!process.env[key]);
}

function getSheetsClient() {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return sheets({ version: "v4", auth });
}

let cache: { data: RawDataset; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes, matches the "2-5 min" spec

export async function getDataset(forceRefresh = false): Promise<RawDataset> {
  if (!hasGoogleCredentials()) {
    if (!cache || forceRefresh) {
      cache = { data: generateMockDataset(), fetchedAt: Date.now() };
    }
    return cache.data;
  }

  const isFresh = cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (isFresh && !forceRefresh) {
    return cache!.data;
  }

  try {
    const data = await fetchFromGoogleSheets();
    cache = { data, fetchedAt: Date.now() };
    return data;
    } catch (err) {
    console.error("Google Sheets sync failed:", err);
    if (cache) {
      return { ...cache.data, source: "cache" };
    }
    const reason = err instanceof Error ? err.message : String(err);
    const detail = process.env.NODE_ENV === "development" ? ` Reason: ${reason}` : "";
    throw new Error(
      `Unable to sync Google Sheets and no cached data is available.${detail}`
    );
  }
}

async function fetchFromGoogleSheets(): Promise<RawDataset> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tabNames = (meta.data.sheets ?? [])
    .map((s) => s.properties?.title)
    .filter((t): t is string => !!t);

  if (!tabNames.includes("CMC_Master")) {
    throw new Error("CMC_Master sheet not found in the spreadsheet.");
  }
  if (!tabNames.includes("Company_Master")) {
    throw new Error("Company_Master sheet not found in the spreadsheet.");
  }

  const [cmcRows, companyRows] = await Promise.all([
    readRange(sheets, spreadsheetId, "CMC_Master!A2:F1000"),
    readRange(sheets, spreadsheetId, "Company_Master!A2:J5000"),
  ]);

  const cmcs: CMC[] = cmcRows
  .filter((r) => r[0])
  .map((r) => ({
    cmcId: str(r[0]),
    name: str(r[1]),
    email: str(r[2]),
    batch: "",
    active: str(r[3]).toUpperCase() === "TRUE",
    assignedTarget: num(r[4]),
    sheetName: str(r[1]).replace(/\s+/g, "_"),
  }));

  const companies: Company[] = companyRows
    .filter((r) => r[0])
    .map((r) => ({
      companyId: str(r[0]),
      companyName: str(r[1]),
      industry: str(r[2]),
      website: str(r[3]) || undefined,
      assignedCmcId: str(r[4]) || undefined,
      primaryContact: str(r[5]) || undefined,
      contactEmail: str(r[6]) || undefined,
      contactPhone: str(r[7]) || undefined,
      status: (str(r[8]) as OutreachStatus) || undefined,
      createdDate: str(r[9]) || undefined,
    }));


  const activityResults = await Promise.all(
    cmcs.map(async (cmc) => {
      if (!tabNames.includes(cmc.sheetName)) return [];
      const rows = await readRange(
        sheets,
        spreadsheetId,
        `${cmc.sheetName}!A2:Q10000`
      );
      return rowsToActivities(rows, cmc);
    })
  );

  const activities = activityResults.flat();
  const issues = validateActivities(activities, companies, cmcs);

  return {
    cmcs,
    companies,
    activities,
    issues,
    lastSynced: new Date().toISOString(),
    source: "google-sheets",
  };
}

async function readRange(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as string[][]) ?? [];
}

function rowsToActivities(rows: string[][], cmc: CMC): ActivityRecord[] {
  return rows
    .filter((r) => r[0] || r[2]) // has a date or a company name
    .map((r, idx) => ({
      recordId: `${cmc.cmcId}-${idx + 2}`,
      cmcId: cmc.cmcId,
      cmcName: cmc.name,
      rowIndex: idx + 2,
      date: str(r[0]),
      companyId: str(r[1]),
      companyName: str(r[2]),
      industry: str(r[3]),
      contactName: str(r[4]) || undefined,
      contactDesignation: str(r[5]) || undefined,
      contactEmail: str(r[6]) || undefined,
      contactPhone: str(r[7]) || undefined,
      outreachChannel: str(r[8]) as OutreachChannel,
      activity: str(r[9]) as ActivityType,
      pitchType: (str(r[10]) as any) || undefined,
      status: str(r[11]) as OutreachStatus,
      nextFollowup: str(r[12]) || undefined,
      response: (str(r[13]) as any) || undefined,
      meetingDate: str(r[14]) || undefined,
      campusVisitDate: str(r[15]) || undefined,
      remarks: str(r[16]) || undefined,
    }));
}

function validateActivities(
  activities: ActivityRecord[],
  companies: Company[],
  cmcs: CMC[]
): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];
  const companyIds = new Set(companies.map((c) => c.companyId));
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;

  for (const a of activities) {
    const push = (field: string, problem: string) =>
      issues.push({ recordId: a.recordId, cmcName: a.cmcName, companyName: a.companyName || "(unknown)", field, problem });

    if (!a.companyId) push("Company_ID", "Missing Company ID");
    else if (!companyIds.has(a.companyId)) push("Company_ID", "Company ID not found in Company_Master");
    if (!a.companyName) push("Company_Name", "Missing Company Name");
    if (!a.date || !dateRe.test(a.date)) push("Date", "Missing or invalid date format (expected YYYY-MM-DD)");
    if (a.contactEmail && !emailRe.test(a.contactEmail)) push("Contact_Email", "Invalid email format");
    if (a.nextFollowup && !dateRe.test(a.nextFollowup)) push("Next_Followup", "Invalid date format");
    if (a.status === "Follow-up Required" && !a.nextFollowup) push("Next_Followup", "Follow-up required but no date set");
  }
  return issues;
}

function str(v: unknown): string {
  return v === undefined || v === null ? "" : String(v).trim();
}
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
